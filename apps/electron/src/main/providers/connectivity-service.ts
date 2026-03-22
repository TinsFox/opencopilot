import type {
  CreateProviderRequest,
  FailedProviderModel,
} from '@opencopilot/shared/bridge'
import { generateText } from 'ai'

import { buildProviderClient } from './provider-client'
import { normalizeProviderBaseUrl } from './templates'
import type { ConnectivityTestResult } from './types'

function normalizeModelNames(models: string[]): string[] {
  return Array.from(
    new Set(models.map((model) => model.trim()).filter((model) => model.length)),
  )
}

export async function testProviderConnectivity(
  input: CreateProviderRequest,
): Promise<ConnectivityTestResult> {
  const successfulModels: string[] = []
  const failedModels: FailedProviderModel[] = []
  const normalizedModels = normalizeModelNames(input.models)

  if (!input.name.trim()) {
    throw new Error('Provider 名称不能为空。')
  }

  if (!input.apiKey.trim()) {
    throw new Error('API Key 不能为空。')
  }

  if (normalizedModels.length === 0) {
    throw new Error('至少需要填写一个模型。')
  }

  const client = buildProviderClient({
    vendor: input.vendor,
    baseUrl: normalizeProviderBaseUrl(input.vendor, input.baseUrl),
    apiKey: input.apiKey.trim(),
  })

  for (const modelName of normalizedModels) {
    try {
      await generateText({
        model: client.chatModel(modelName),
        prompt: '请只回复 OK。',
        maxOutputTokens: 8,
      })

      successfulModels.push(modelName)
    } catch (error) {
      failedModels.push({
        name: modelName,
        error: error instanceof Error ? error.message : '连通性测试失败。',
      })
    }
  }

  return {
    successfulModels,
    failedModels,
  }
}
