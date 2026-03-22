import type {
  ChatRequest,
  ChatResponse,
  ChatStreamRequest,
} from '@opencopilot/shared/bridge'
import type { ModelMessage } from 'ai'
import { generateText, streamText } from 'ai'

import { buildProviderClient } from '../providers/provider-client'
import { getEnabledProviderModelSelection } from '../providers/repository'
import { decryptSecret } from '../providers/secret-service'

function normalizeMessages(request: ChatRequest): ModelMessage[] {
  const messages = request.messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0) as ModelMessage[]

  if (messages.length === 0) {
    throw new Error('消息内容不能为空。')
  }

  return messages
}

async function getChatRuntimeTarget(request: ChatRequest) {
  const selection = await getEnabledProviderModelSelection(
    request.target.providerId,
    request.target.modelId,
  )

  if (!selection) {
    throw new Error('当前选择的 Provider 或模型不可用，请检查配置后重试。')
  }

  const apiKey = decryptSecret(selection.provider.apiKeyEncrypted)
  const client = buildProviderClient({
    vendor: selection.provider.vendor,
    baseUrl: selection.provider.baseUrl,
    apiKey,
  })

  return {
    providerName: selection.provider.name,
    modelName: selection.model.name,
    client,
  }
}

export async function generateChatResponse(
  request: ChatRequest,
): Promise<ChatResponse> {
  const messages = normalizeMessages(request)
  const target = await getChatRuntimeTarget(request)

  const { text } = await generateText({
    model: target.client.chatModel(target.modelName),
    messages,
  })

  return { text }
}

export async function startChatStream(
  request: ChatStreamRequest,
): Promise<ReturnType<typeof streamText>> {
  const messages = normalizeMessages(request)
  const target = await getChatRuntimeTarget(request)

  return streamText({
    model: target.client.chatModel(target.modelName),
    messages,
  })
}
