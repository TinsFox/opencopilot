import { existsSync } from 'node:fs'
import path from 'node:path'

import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type {
  ChatRequest,
  ChatResponse,
  ChatStreamRequest,
} from '@opencopilot/shared/bridge'
import { chatChannels } from '@opencopilot/shared/bridge'
import type { ModelMessage } from 'ai'
import { generateText, streamText } from 'ai'
import dotenv from 'dotenv'
import { app, BrowserWindow, ipcMain, shell } from 'electron'

import { getDatabaseFilePath, initializeDatabase } from './db'
import { getAppEntryUrl, registerAppProtocol } from './protocol'
import { setupUpdater } from './updater'

function loadEnvironment(): void {
  const candidatePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(path.dirname(process.execPath), '.env.local'),
    path.resolve(path.dirname(process.execPath), '.env'),
  ]

  for (const envPath of candidatePaths) {
    if (!existsSync(envPath)) {
      continue
    }

    dotenv.config({ path: envPath, override: false })
  }
}

loadEnvironment()

const devServerUrl = process.env.OPENCOPILOT_RENDERER_URL
const arkApiKey = process.env.ARK_API_KEY
const arkBaseUrl =
  process.env.ARK_BASE_URL ?? 'https://ark.cn-beijing.volces.com/api/v3'
const arkModel = process.env.ARK_MODEL

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

const doubaoProvider = createOpenAICompatible({
  name: 'doubao',
  apiKey: arkApiKey,
  baseURL: arkBaseUrl,
})

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
    autoHideMenuBar: true,
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
    // mainWindow.webContents.openDevTools({ mode: 'right' })
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

function normalizeMessages(request: ChatRequest): ModelMessage[] {
  if (!arkApiKey) {
    logChatEvent('request rejected: missing ARK_API_KEY')
    throw new Error('Missing ARK_API_KEY environment variable.')
  }

  if (!arkModel) {
    logChatEvent('request rejected: missing ARK_MODEL')
    throw new Error(
      'Missing ARK_MODEL environment variable. Use your Doubao model or endpoint ID.',
    )
  }

  const messages = request.messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0) as ModelMessage[]

  if (messages.length === 0) {
    logChatEvent('request rejected: empty message content')
    throw new Error('Message content cannot be empty.')
  }

  return messages
}

async function handleChatRequest(
  _event: Electron.IpcMainInvokeEvent,
  request: ChatRequest,
): Promise<ChatResponse> {
  logChatEvent('IPC request received', {
    messageCount: request.messages.length,
  })

  const messages = normalizeMessages(request)
  const model = arkModel as string

  const lastMessage = messages.at(-1)

  logChatEvent('sending request to Doubao', {
    model,
    messageCount: messages.length,
    lastRole: lastMessage?.role,
    lastContentLength:
      typeof lastMessage?.content === 'string'
        ? lastMessage.content.length
        : undefined,
  })

  try {
    const { text } = await generateText({
      model: doubaoProvider.chatModel(model),
      messages,
    })

    logChatEvent('response received from Doubao', {
      outputLength: text.length,
    })

    return { text }
  } catch (error) {
    logChatEvent('request failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

async function handleChatStreamRequest(
  event: Electron.IpcMainInvokeEvent,
  request: ChatStreamRequest,
): Promise<void> {
  logChatEvent('stream IPC request received', {
    requestId: request.requestId,
    messageCount: request.messages.length,
  })

  const messages = normalizeMessages(request)
  const model = arkModel as string
  const lastMessage = messages.at(-1)

  logChatEvent('starting Doubao stream', {
    requestId: request.requestId,
    model,
    messageCount: messages.length,
    lastRole: lastMessage?.role,
    lastContentLength:
      typeof lastMessage?.content === 'string'
        ? lastMessage.content.length
        : undefined,
  })

  const { sender } = event

  void (async () => {
    let text = ''

    try {
      const result = streamText({
        model: doubaoProvider.chatModel(model),
        messages,
      })

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
  ipcMain.handle(chatChannels.sendMessage, handleChatRequest)
  ipcMain.handle(chatChannels.streamMessage, handleChatStreamRequest)
  logChatEvent('chat handler registered', {
    model: arkModel ?? null,
    baseUrl: arkBaseUrl,
    hasApiKey: Boolean(arkApiKey),
  })
  createWindow()
  setupUpdater()

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
