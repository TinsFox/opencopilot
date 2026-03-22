import type { OpenAICompatibleProviderSettings } from '@ai-sdk/openai-compatible'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { ProviderVendor } from '@opencopilot/shared/bridge'

import { normalizeProviderBaseUrl } from './templates'

interface ProviderClientInput {
  vendor: ProviderVendor
  baseUrl: string
  apiKey: string
}

export function buildProviderClient({
  vendor,
  baseUrl,
  apiKey,
}: ProviderClientInput) {
  const config: OpenAICompatibleProviderSettings = {
    name: vendor,
    baseURL: normalizeProviderBaseUrl(vendor, baseUrl),
    apiKey,
  }

  return createOpenAICompatible(config)
}
