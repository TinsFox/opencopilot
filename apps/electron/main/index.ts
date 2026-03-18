import path from 'node:path'
import { app, BrowserWindow, shell } from 'electron'
import { getAppEntryUrl, registerAppProtocol } from './protocol'
import { setupUpdater } from './updater'

const devServerUrl = process.env.OPENCOPILOT_RENDERER_URL

function configureWindowShortcuts(window: BrowserWindow): void {
  window.webContents.on('before-input-event', (event, input) => {
    const isReload =
      (input.control || input.meta) && input.key.toLowerCase() === 'r' && input.type === 'keyDown'
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
      nodeIntegration: false
    }
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

void app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.opencopilot.app')
  }

  app.on('browser-window-created', (_, window) => {
    configureWindowShortcuts(window)
  })

  registerAppProtocol()
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
