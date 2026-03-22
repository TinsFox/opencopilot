import { existsSync } from 'node:fs'
import path from 'node:path'

import type { AppUpdaterStatus } from '@opencopilot/shared/updater'
import { updaterChannels } from '@opencopilot/shared/updater'
import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

let currentStatus: AppUpdaterStatus = {
  state: 'idle',
  message: '可以开始检查更新。',
}
let canInstallUpdate = false
let updaterInitialized = false

function broadcastStatus(status: AppUpdaterStatus): void {
  currentStatus = status

  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(updaterChannels.status, status)
  }
}

function configureDevUpdateFeed(): void {
  if (app.isPackaged) {
    return
  }

  const candidatePaths = [
    path.join(app.getAppPath(), 'dev-app-update.yml'),
    path.resolve(app.getAppPath(), '..', 'dev-app-update.yml'),
    path.resolve(app.getAppPath(), '..', '..', 'dev-app-update.yml'),
    path.resolve(process.cwd(), 'dev-app-update.yml'),
  ]
  const updateConfigPath = candidatePaths.find((candidatePath) =>
    existsSync(candidatePath),
  )

  if (!updateConfigPath) {
    throw new Error(
      `Unable to locate dev-app-update.yml. Checked: ${candidatePaths.join(', ')}`,
    )
  }

  autoUpdater.forceDevUpdateConfig = true
  autoUpdater.updateConfigPath = updateConfigPath
}

export async function checkForUpdates(): Promise<void> {
  canInstallUpdate = false
  broadcastStatus({
    state: 'checking',
    message: '正在检查更新。',
  })

  await autoUpdater.checkForUpdates()
}

export function setupUpdater(): void {
  if (updaterInitialized) {
    return
  }

  updaterInitialized = true
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  configureDevUpdateFeed()

  autoUpdater.on('checking-for-update', () => {
    broadcastStatus({
      state: 'checking',
      message: '正在检查更新。',
    })
  })

  autoUpdater.on('update-available', (info) => {
    broadcastStatus({
      state: 'available',
      message: `发现新版本 ${info.version}，正在下载。`,
      version: info.version,
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    broadcastStatus({
      state: 'not-available',
      message: '当前已经是最新版本。',
      version: info.version,
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    broadcastStatus({
      state: 'downloading',
      message: `正在下载更新：${Math.round(progress.percent)}%。`,
      progress: progress.percent,
      transferredBytes: progress.transferred,
      totalBytes: progress.total,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    canInstallUpdate = true
    broadcastStatus({
      state: 'downloaded',
      message: `版本 ${info.version} 已下载完成，重启后即可安装。`,
      version: info.version,
      progress: 100,
    })
  })

  autoUpdater.on('error', (error) => {
    broadcastStatus({
      state: 'error',
      message: error?.message ?? '更新失败。',
    })
  })

  ipcMain.handle(updaterChannels.checkForUpdates, async () => {
    await checkForUpdates()
  })

  ipcMain.handle(updaterChannels.quitAndInstall, () => {
    if (!canInstallUpdate) {
      broadcastStatus({
        ...currentStatus,
        state: 'error',
        message: '没有可安装的已下载更新。',
      })
      return
    }

    autoUpdater.quitAndInstall()
  })
}
