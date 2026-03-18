import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  updaterChannels,
  type AppUpdaterApi,
  type AppUpdaterStatus
} from '@opencopilot/shared/updater'

const appUpdater: AppUpdaterApi = {
  checkForUpdates: async () => {
    await ipcRenderer.invoke(updaterChannels.checkForUpdates)
  },
  quitAndInstall: async () => {
    await ipcRenderer.invoke(updaterChannels.quitAndInstall)
  },
  onStatus: (listener): (() => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, status: AppUpdaterStatus): void => {
      listener(status)
    }

    ipcRenderer.on(updaterChannels.status, subscription)

    return () => {
      ipcRenderer.off(updaterChannels.status, subscription)
    }
  }
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('appUpdater', appUpdater)
} else {
  const unsafeWindow = window as Window &
    typeof globalThis & {
      electron: typeof electronAPI
      appUpdater: AppUpdaterApi
    }

  unsafeWindow.electron = electronAPI
  unsafeWindow.appUpdater = appUpdater
}
