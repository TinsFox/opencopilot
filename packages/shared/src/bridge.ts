export type RuntimeVersions = Readonly<Record<string, string | undefined>> & {
  chrome: string
  electron: string
  node: string
}

export interface RendererElectronApi {
  process: {
    versions: RuntimeVersions
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  text: string
}

export interface ChatStreamRequest extends ChatRequest {
  requestId: string
}

export interface ChatStreamDeltaEvent {
  requestId: string
  textDelta: string
}

export interface ChatStreamDoneEvent {
  requestId: string
  text: string
}

export interface ChatStreamErrorEvent {
  requestId: string
  error: string
}

export const chatChannels = {
  sendMessage: 'chat:send-message',
  streamMessage: 'chat:stream-message',
  streamDelta: 'chat:stream-delta',
  streamDone: 'chat:stream-done',
  streamError: 'chat:stream-error'
} as const

export interface RendererChatApi {
  sendMessage: (request: ChatRequest) => Promise<ChatResponse>
  streamMessage: (
    request: ChatRequest,
    listener: {
      onDelta: (event: ChatStreamDeltaEvent) => void
      onDone: (event: ChatStreamDoneEvent) => void
      onError: (event: ChatStreamErrorEvent) => void
    }
  ) => Promise<void>
}
