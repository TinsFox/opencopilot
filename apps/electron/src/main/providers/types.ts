import type {
  CreateProviderRequest,
  FailedProviderModel,
  ProviderSummary,
  ProviderVendor,
} from '@opencopilot/shared/bridge'

export interface StoredProvider {
  id: string
  name: string
  vendor: ProviderVendor
  baseUrl: string
  apiKeyEncrypted: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StoredModel {
  id: string
  providerId: string
  name: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProviderPersistenceInput extends CreateProviderRequest {
  encryptedApiKey: string
  successfulModels: string[]
}

export interface ConnectivityTestResult {
  successfulModels: string[]
  failedModels: FailedProviderModel[]
}

export interface ProviderWithSecret extends ProviderSummary {
  apiKey: string
}
