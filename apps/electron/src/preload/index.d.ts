import type {
  RendererChatApi,
  RendererElectronApi,
} from '@opencopilot/shared/bridge'
import type { AppUpdaterApi } from '@opencopilot/shared/updater'

declare global {
  interface Window {
    electron: RendererElectronApi
    appUpdater: AppUpdaterApi
    opencopilot: {
      chat: RendererChatApi
    }
  }
}
