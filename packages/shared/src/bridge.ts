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

export type ProviderVendor =
  | 'openai'
  | 'azure-openai'
  | 'openrouter'
  | 'doubao'
  | 'vercel-ai-gateway'

export interface ProviderTemplate {
  vendor: ProviderVendor
  label: string
  description: string
  defaultBaseUrl: string
  baseUrlPlaceholder: string
  apiKeyPlaceholder: string
  presetModels: ProviderPresetModel[]
}

export interface ProviderPresetModel {
  id: string
  label: string
  useCase: string
  description: string
  defaultEnabled: boolean
}

export const providerTemplates: readonly ProviderTemplate[] = [
  {
    vendor: 'openai',
    label: 'OpenAI',
    description: '标准 OpenAI 兼容接口，适用于 GPT 系列模型。',
    defaultBaseUrl: 'https://api.openai.com/v1',
    baseUrlPlaceholder: 'https://api.openai.com/v1',
    apiKeyPlaceholder: 'sk-...',
    presetModels: [
      {
        id: 'gpt-4.1',
        label: 'GPT-4.1',
        useCase: '复杂写作与分析',
        description: '更强的综合能力，适合复杂对话与高质量生成。',
        defaultEnabled: true,
      },
      {
        id: 'gpt-4.1-mini',
        label: 'GPT-4.1 mini',
        useCase: '日常高频任务',
        description: '速度更快，适合高频日常问答与轻量任务。',
        defaultEnabled: true,
      },
      {
        id: 'gpt-4o-mini',
        label: 'GPT-4o mini',
        useCase: '通用轻量助手',
        description: '低成本多用途模型，适合通用助手场景。',
        defaultEnabled: false,
      },
    ],
  },
  {
    vendor: 'azure-openai',
    label: 'Azure OpenAI',
    description: 'Azure OpenAI v1 接口，使用你的 Azure API Key。',
    defaultBaseUrl: 'https://your-resource.openai.azure.com/openai/v1',
    baseUrlPlaceholder: 'https://your-resource.openai.azure.com/openai/v1',
    apiKeyPlaceholder: '请输入 Azure API Key',
    presetModels: [
      {
        id: 'gpt-4.1',
        label: 'GPT-4.1',
        useCase: '复杂写作与分析',
        description: '适合高质量复杂任务，作为主力模型使用。',
        defaultEnabled: true,
      },
      {
        id: 'gpt-4.1-mini',
        label: 'GPT-4.1 mini',
        useCase: '响应更快',
        description: '更适合响应速度优先的工作流。',
        defaultEnabled: true,
      },
      {
        id: 'gpt-4o-mini',
        label: 'GPT-4o mini',
        useCase: '轻量通用任务',
        description: '适合成本敏感的通用交互。',
        defaultEnabled: false,
      },
    ],
  },
  {
    vendor: 'openrouter',
    label: 'OpenRouter',
    description: 'OpenRouter 聚合网关，可接入多家模型提供方。',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    baseUrlPlaceholder: 'https://openrouter.ai/api/v1',
    apiKeyPlaceholder: 'sk-or-...',
    presetModels: [
      {
        id: 'openai/gpt-4.1-mini',
        label: 'GPT-4.1 mini',
        useCase: '默认工作模型',
        description: '稳定通用，适合作为默认工作模型。',
        defaultEnabled: true,
      },
      {
        id: 'anthropic/claude-sonnet-4.6',
        label: 'Claude Sonnet 4.6',
        useCase: '长文与代码',
        description: '更适合长文本、写作和代码理解。',
        defaultEnabled: true,
      },
      {
        id: 'google/gemini-3-flash',
        label: 'Gemini 3 Flash',
        useCase: '快速轻量处理',
        description: '响应更快，适合轻量和高频调用。',
        defaultEnabled: false,
      },
    ],
  },
  {
    vendor: 'doubao',
    label: '豆包',
    description: '火山引擎 Ark OpenAI 兼容接口。',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    baseUrlPlaceholder: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKeyPlaceholder: '请输入 Ark API Key',
    presetModels: [
      {
        id: 'doubao-seed-1-6-thinking-250715',
        label: 'Doubao Seed 1.6 Thinking',
        useCase: '深度分析',
        description: '偏推理与复杂分析，适合需要更强思考深度的场景。',
        defaultEnabled: true,
      },
      {
        id: 'doubao-seed-1-6-250615',
        label: 'Doubao Seed 1.6',
        useCase: '通用主力模型',
        description: '通用主力模型，适合日常聊天与内容生成。',
        defaultEnabled: true,
      },
      {
        id: 'doubao-seed-1-6-flash-250715',
        label: 'Doubao Seed 1.6 Flash',
        useCase: '快速响应',
        description: '偏速度与成本，适合高频轻量请求。',
        defaultEnabled: false,
      },
    ],
  },
  {
    vendor: 'vercel-ai-gateway',
    label: 'Vercel AI Gateway',
    description: 'Vercel AI Gateway 的 OpenAI 兼容接口。',
    defaultBaseUrl: 'https://ai-gateway.vercel.sh/v1',
    baseUrlPlaceholder: 'https://ai-gateway.vercel.sh/v1',
    apiKeyPlaceholder: '请输入 Vercel AI Gateway Token',
    presetModels: [
      {
        id: 'openai/gpt-5.4',
        label: 'GPT-5.4',
        useCase: '高能力主模型',
        description: '高能力默认项，适合复杂工作流。',
        defaultEnabled: true,
      },
      {
        id: 'anthropic/claude-sonnet-4.6',
        label: 'Claude Sonnet 4.6',
        useCase: '长文与持续对话',
        description: '适合长文本、编码与持续对话。',
        defaultEnabled: true,
      },
      {
        id: 'google/gemini-3-flash',
        label: 'Gemini 3 Flash',
        useCase: '快速轻量处理',
        description: '快速低延迟，适合作为轻量选项。',
        defaultEnabled: false,
      },
    ],
  },
] as const

export interface ProviderModelSummary {
  id: string
  providerId: string
  name: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ProviderSummary {
  id: string
  name: string
  vendor: ProviderVendor
  baseUrl: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  models: ProviderModelSummary[]
}

export interface FailedProviderModel {
  name: string
  error: string
}

export interface CreateProviderRequest {
  vendor: ProviderVendor
  name: string
  baseUrl: string
  apiKey: string
  models: string[]
}

export interface CreateProviderResponse {
  provider: ProviderSummary
  failedModels: FailedProviderModel[]
}

export interface TestProviderConnectionResponse {
  successfulModels: string[]
  failedModels: FailedProviderModel[]
}

export interface ProviderBootstrapState {
  hasProviders: boolean
  hasEnabledModels: boolean
}

export interface ChatTarget {
  providerId: string
  modelId: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  target: ChatTarget
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
  streamError: 'chat:stream-error',
} as const

export const providerChannels = {
  createProvider: 'providers:create',
  testConnection: 'providers:test-connection',
  getBootstrapState: 'providers:get-bootstrap-state',
  listProviders: 'providers:list',
  setProviderEnabled: 'providers:set-enabled',
  setModelEnabled: 'providers:set-model-enabled',
} as const

export interface RendererChatApi {
  sendMessage: (request: ChatRequest) => Promise<ChatResponse>
  streamMessage: (
    request: ChatRequest,
    listener: {
      onDelta: (event: ChatStreamDeltaEvent) => void
      onDone: (event: ChatStreamDoneEvent) => void
      onError: (event: ChatStreamErrorEvent) => void
    },
  ) => Promise<void>
}

export interface RendererProviderApi {
  createProvider: (
    request: CreateProviderRequest,
  ) => Promise<CreateProviderResponse>
  testConnection: (
    request: CreateProviderRequest,
  ) => Promise<TestProviderConnectionResponse>
  getBootstrapState: () => Promise<ProviderBootstrapState>
  listProviders: () => Promise<ProviderSummary[]>
  setProviderEnabled: (providerId: string, enabled: boolean) => Promise<void>
  setModelEnabled: (modelId: string, enabled: boolean) => Promise<void>
}
