import type {
  RendererChatApi,
  RendererElectronApi,
  RendererProviderApi,
} from '@opencopilot/shared/bridge'
import type { AppUpdaterApi } from '@opencopilot/shared/updater'

declare global {
  interface Window {
    electron: RendererElectronApi
    appUpdater: AppUpdaterApi
    opencopilot: {
      chat: RendererChatApi
      providers: RendererProviderApi
    }
  }
}
