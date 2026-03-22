import path from 'node:path'

import type {
  ChatRequest,
  ChatStreamRequest,
  CreateProviderRequest,
} from '@opencopilot/shared/bridge'
import {
  chatChannels,
  providerChannels,
} from '@opencopilot/shared/bridge'
import { app, BrowserWindow, ipcMain, shell } from 'electron'

import { generateChatResponse, startChatStream } from './chat/chat-service'
import { getDatabaseFilePath, initializeDatabase } from './db'
import { createAppMenu } from './menu'
import { getAppEntryUrl, registerAppProtocol } from './protocol'
import {
  createProvider,
  testProviderConnection,
} from './providers/provider-service'
import {
  getBootstrapState,
  listProviders,
  setModelEnabled,
  setProviderEnabled,
} from './providers/repository'
import { setupUpdater } from './updater'

const devServerUrl = process.env.OPENCOPILOT_RENDERER_URL

function logChatEvent(
  message: string,
  details?: Record<string, unknown>,
): void {
  if (details) {
    console.info(`[chat] ${message}`, details)
    return
  }

  console.info(`[chat] ${message}`)
}

function configureWindowShortcuts(window: BrowserWindow): void {
  window.webContents.on('before-input-event', (event, input) => {
    const isReload =
      (input.control || input.meta) &&
      input.key.toLowerCase() === 'r' &&
      input.type === 'keyDown'
    const isToggleDevTools = input.key === 'F12' && input.type === 'keyDown'

    if (!devServerUrl && isReload) {
      event.preventDefault()
      return
    }

    if (isToggleDevTools) {
      if (window.webContents.isDevToolsOpened()) {
        window.webContents.closeDevTools()
      } else {
        window.webContents.openDevTools({ mode: 'right' })
      }
    }
  })
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    autoHideMenuBar: false,
    title: 'OpenCopilot',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (devServerUrl) {
    void mainWindow.loadURL(devServerUrl)
  } else {
    void mainWindow.loadURL(getAppEntryUrl())
  }

  return mainWindow
}
function getDefaultDatabaseUrl(): string {
  const isDevelopment = Boolean(devServerUrl) || !app.isPackaged
  const databaseFileName = isDevelopment
    ? 'opencopilot.dev.db'
    : 'opencopilot.db'

  return `file:${path.join(app.getPath('userData'), databaseFileName)}`
}

async function handleChatRequest(
  _event: Electron.IpcMainInvokeEvent,
  request: ChatRequest,
) {
  logChatEvent('IPC request received', {
    messageCount: request.messages.length,
    providerId: request.target.providerId,
    modelId: request.target.modelId,
  })

  return generateChatResponse(request)
}

async function handleChatStreamRequest(
  event: Electron.IpcMainInvokeEvent,
  request: ChatStreamRequest,
): Promise<void> {
  logChatEvent('stream IPC request received', {
    requestId: request.requestId,
    messageCount: request.messages.length,
    providerId: request.target.providerId,
    modelId: request.target.modelId,
  })

  const { sender } = event

  void (async () => {
    let text = ''

    try {
      const result = await startChatStream(request)

      for await (const part of result.fullStream) {
        if (part.type !== 'text-delta' || !part.text) {
          continue
        }

        text += part.text
        sender.send(chatChannels.streamDelta, {
          requestId: request.requestId,
          textDelta: part.text,
        })
      }

      sender.send(chatChannels.streamDone, {
        requestId: request.requestId,
        text,
      })

      logChatEvent('stream completed', {
        requestId: request.requestId,
        outputLength: text.length,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      sender.send(chatChannels.streamError, {
        requestId: request.requestId,
        error: message,
      })

      logChatEvent('stream failed', {
        requestId: request.requestId,
        error: message,
      })
    }
  })()
}

async function handleCreateProvider(
  _event: Electron.IpcMainInvokeEvent,
  request: CreateProviderRequest,
) {
  return createProvider(request)
}

async function handleTestProviderConnection(
  _event: Electron.IpcMainInvokeEvent,
  request: CreateProviderRequest,
) {
  return testProviderConnection(request)
}

function registerIpcHandlers(): void {
  ipcMain.handle(chatChannels.sendMessage, handleChatRequest)
  ipcMain.handle(chatChannels.streamMessage, handleChatStreamRequest)
  ipcMain.handle(providerChannels.createProvider, handleCreateProvider)
  ipcMain.handle(
    providerChannels.testConnection,
    handleTestProviderConnection,
  )
  ipcMain.handle(providerChannels.getBootstrapState, () => getBootstrapState())
  ipcMain.handle(providerChannels.listProviders, () => listProviders())
  ipcMain.handle(
    providerChannels.setProviderEnabled,
    (_event, payload: { providerId: string; enabled: boolean }) =>
      setProviderEnabled(payload.providerId, payload.enabled),
  )
  ipcMain.handle(
    providerChannels.setModelEnabled,
    (_event, payload: { modelId: string; enabled: boolean }) =>
      setModelEnabled(payload.modelId, payload.enabled),
  )
}

void app.whenReady().then(async () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.opencopilot.app')
  }

  const dbFileName = process.env.DB_FILE_NAME ?? getDefaultDatabaseUrl()
  await initializeDatabase(dbFileName)
  console.info('[db] initialized', {
    filePath: getDatabaseFilePath(),
  })

  app.on('browser-window-created', (_, window) => {
    configureWindowShortcuts(window)
  })

  registerAppProtocol()
  registerIpcHandlers()
  setupUpdater()
  createAppMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
