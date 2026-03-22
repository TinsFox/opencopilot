import type {
  ProviderTemplate,
  ProviderVendor,
} from '@opencopilot/shared/bridge'
import { providerTemplates } from '@opencopilot/shared/bridge'

const templateMap = new Map<ProviderVendor, ProviderTemplate>(
  providerTemplates.map((template) => [template.vendor, template]),
)

export function getProviderTemplate(vendor: ProviderVendor): ProviderTemplate {
  const template = templateMap.get(vendor)

  if (!template) {
    throw new Error(`Unsupported provider vendor: ${vendor}`)
  }

  return template
}

export function normalizeProviderBaseUrl(
  vendor: ProviderVendor,
  baseUrl: string,
): string {
  const trimmedBaseUrl = baseUrl.trim()

  if (!trimmedBaseUrl) {
    return getProviderTemplate(vendor).defaultBaseUrl
  }

  return trimmedBaseUrl.replace(/\/+$/, '')
}
