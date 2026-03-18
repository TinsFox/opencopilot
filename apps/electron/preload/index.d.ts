import type { ElectronAPI } from '@electron-toolkit/preload'
import type { AppUpdaterApi } from '@opencopilot/shared/updater'

declare global {
  interface Window {
    electron: ElectronAPI
    appUpdater: AppUpdaterApi
  }
}

export {}
