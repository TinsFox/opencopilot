import type {
  CreateProviderRequest,
  CreateProviderResponse,
  TestProviderConnectionResponse,
} from '@opencopilot/shared/bridge'

import { testProviderConnectivity } from './connectivity-service'
import { createProviderRecord } from './repository'
import { encryptSecret } from './secret-service'
import { normalizeProviderBaseUrl } from './templates'

export async function createProvider(
  request: CreateProviderRequest,
): Promise<CreateProviderResponse> {
  const testResult = await testProviderConnectivity(request)

  if (testResult.successfulModels.length === 0) {
    throw new Error(
      testResult.failedModels[0]?.error ?? '所有模型的连通性测试都失败了。',
    )
  }

  const provider = await createProviderRecord({
    ...request,
    baseUrl: normalizeProviderBaseUrl(request.vendor, request.baseUrl),
    encryptedApiKey: encryptSecret(request.apiKey.trim()),
    successfulModels: testResult.successfulModels,
  })

  return {
    provider,
    failedModels: testResult.failedModels,
  }
}

export async function testProviderConnection(
  request: CreateProviderRequest,
): Promise<TestProviderConnectionResponse> {
  return testProviderConnectivity(request)
}
