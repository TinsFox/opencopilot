export const updaterChannels = {
  checkForUpdates: 'app-updater:check-for-updates',
  quitAndInstall: 'app-updater:quit-and-install',
  status: 'app-updater:status'
} as const

export type AppUpdaterState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface AppUpdaterStatus {
  state: AppUpdaterState
  message: string
  version?: string
  progress?: number
  transferredBytes?: number
  totalBytes?: number
}

export interface AppUpdaterApi {
  checkForUpdates: () => Promise<void>
  quitAndInstall: () => Promise<void>
  onStatus: (listener: (status: AppUpdaterStatus) => void) => () => void
}
