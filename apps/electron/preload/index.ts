import { contextBridge, ipcRenderer } from 'electron'
import type { RendererElectronApi } from '@opencopilot/shared/bridge'
import {
  updaterChannels,
  type AppUpdaterApi,
  type AppUpdaterStatus
} from '@opencopilot/shared/updater'

const electronApi: RendererElectronApi = {
  process: {
    versions: { ...process.versions }
  }
}

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
  contextBridge.exposeInMainWorld('electron', electronApi)
  contextBridge.exposeInMainWorld('appUpdater', appUpdater)
} else {
  const unsafeWindow = window as Window &
    typeof globalThis & {
      electron: RendererElectronApi
      appUpdater: AppUpdaterApi
    }

  unsafeWindow.electron = electronApi
  unsafeWindow.appUpdater = appUpdater
}
