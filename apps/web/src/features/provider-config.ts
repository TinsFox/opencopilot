import type {
  CreateProviderRequest,
  ProviderTemplate,
  ProviderVendor,
} from '@opencopilot/shared/bridge'
import { providerTemplates } from '@opencopilot/shared/bridge'

export interface ProviderFormState {
  vendor: ProviderVendor
  name: string
  baseUrl: string
  apiKey: string
  selectedModels: string[]
}

export function getTemplate(vendor: ProviderVendor): ProviderTemplate {
  const template = providerTemplates.find((item) => item.vendor === vendor)

  if (!template) {
    throw new Error(`未知的 Provider 类型：${vendor}`)
  }

  return template
}

export function createInitialProviderForm(
  vendor: ProviderVendor = 'openai',
): ProviderFormState {
  const template = getTemplate(vendor)

  return {
    vendor,
    name: template.label,
    baseUrl: template.defaultBaseUrl,
    apiKey: '',
    selectedModels: template.presetModels
      .filter((model) => model.defaultEnabled)
      .map((model) => model.id),
  }
}

export function buildModelRequest(form: ProviderFormState): string[] {
  return Array.from(new Set(form.selectedModels))
}

export function buildCreateProviderRequest(
  form: ProviderFormState,
): CreateProviderRequest {
  return {
    vendor: form.vendor,
    name: form.name.trim(),
    baseUrl: form.baseUrl.trim(),
    apiKey: form.apiKey.trim(),
    models: buildModelRequest(form),
  }
}
