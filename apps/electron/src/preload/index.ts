import type {
  ChatStreamDeltaEvent,
  ChatStreamDoneEvent,
  ChatStreamErrorEvent,
  RendererChatApi,
  RendererElectronApi,
} from '@opencopilot/shared/bridge'
import { chatChannels } from '@opencopilot/shared/bridge'
import type {
  AppUpdaterApi,
  AppUpdaterStatus,
} from '@opencopilot/shared/updater'
import { updaterChannels } from '@opencopilot/shared/updater'
import { contextBridge, ipcRenderer } from 'electron'

const electronApi: RendererElectronApi = {
  process: {
    versions: { ...process.versions },
  },
}

const appUpdater: AppUpdaterApi = {
  checkForUpdates: async () => {
    await ipcRenderer.invoke(updaterChannels.checkForUpdates)
  },
  quitAndInstall: async () => {
    await ipcRenderer.invoke(updaterChannels.quitAndInstall)
  },
  onStatus: (listener): (() => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      status: AppUpdaterStatus,
    ): void => {
      listener(status)
    }

    ipcRenderer.on(updaterChannels.status, subscription)

    return () => {
      ipcRenderer.off(updaterChannels.status, subscription)
    }
  },
}

const chatApi: RendererChatApi = {
  sendMessage: async (request) =>
    ipcRenderer.invoke(chatChannels.sendMessage, request),
  streamMessage: async (request, listener) => {
    const requestId =
      globalThis.crypto?.randomUUID?.() ??
      `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    const handleDelta = (
      _event: Electron.IpcRendererEvent,
      event: ChatStreamDeltaEvent,
    ): void => {
      if (event.requestId === requestId) {
        listener.onDelta(event)
      }
    }

    const handleDone = (
      _event: Electron.IpcRendererEvent,
      event: ChatStreamDoneEvent,
    ): void => {
      if (event.requestId !== requestId) {
        return
      }

      cleanup()
      listener.onDone(event)
    }

    const handleError = (
      _event: Electron.IpcRendererEvent,
      event: ChatStreamErrorEvent,
    ): void => {
      if (event.requestId !== requestId) {
        return
      }

      cleanup()
      listener.onError(event)
    }

    const cleanup = (): void => {
      ipcRenderer.off(chatChannels.streamDelta, handleDelta)
      ipcRenderer.off(chatChannels.streamDone, handleDone)
      ipcRenderer.off(chatChannels.streamError, handleError)
    }

    ipcRenderer.on(chatChannels.streamDelta, handleDelta)
    ipcRenderer.on(chatChannels.streamDone, handleDone)
    ipcRenderer.on(chatChannels.streamError, handleError)

    try {
      await ipcRenderer.invoke(chatChannels.streamMessage, {
        ...request,
        requestId,
      })
    } catch (error) {
      cleanup()
      throw error
    }
  },
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronApi)
  contextBridge.exposeInMainWorld('appUpdater', appUpdater)
  contextBridge.exposeInMainWorld('opencopilot', {
    chat: chatApi,
  })
} else {
  const unsafeWindow = window as Window &
    typeof globalThis & {
      electron: RendererElectronApi
      appUpdater: AppUpdaterApi
      opencopilot: {
        chat: RendererChatApi
      }
    }

  unsafeWindow.electron = electronApi
  unsafeWindow.appUpdater = appUpdater
  unsafeWindow.opencopilot = {
    chat: chatApi,
  }
}
