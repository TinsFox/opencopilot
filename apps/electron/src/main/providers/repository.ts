import { randomUUID } from 'node:crypto'

import type {
  ProviderBootstrapState,
  ProviderModelSummary,
  ProviderSummary,
  ProviderVendor,
} from '@opencopilot/shared/bridge'
import { and, eq } from 'drizzle-orm'

import { getDatabase } from '../db'
import { llmModelsTable, llmProvidersTable } from '../db/schema'
import type {
  CreateProviderPersistenceInput,
  StoredModel,
  StoredProvider,
} from './types'

function serializeDate(date: Date): string {
  return date.toISOString()
}

function mapProviderSummary(
  provider: StoredProvider,
  models: StoredModel[],
): ProviderSummary {
  const providerModels: ProviderModelSummary[] = models.map((model) => ({
    id: model.id,
    providerId: model.providerId,
    name: model.name,
    enabled: model.enabled,
    createdAt: serializeDate(model.createdAt),
    updatedAt: serializeDate(model.updatedAt),
  }))

  return {
    id: provider.id,
    name: provider.name,
    vendor: provider.vendor,
    baseUrl: provider.baseUrl,
    enabled: provider.enabled,
    createdAt: serializeDate(provider.createdAt),
    updatedAt: serializeDate(provider.updatedAt),
    models: providerModels,
  }
}

export async function listProviders(): Promise<ProviderSummary[]> {
  const db = getDatabase()
  const [providers, models] = await Promise.all([
    db.select().from(llmProvidersTable),
    db.select().from(llmModelsTable),
  ])

  const modelsByProviderId = new Map<string, StoredModel[]>()

  for (const model of models) {
    const providerModels = modelsByProviderId.get(model.providerId) ?? []
    providerModels.push(model)
    modelsByProviderId.set(model.providerId, providerModels)
  }

  return providers.map((provider) =>
    mapProviderSummary(provider, modelsByProviderId.get(provider.id) ?? []),
  )
}

export async function getBootstrapState(): Promise<ProviderBootstrapState> {
  const providers = await listProviders()

  return {
    hasProviders: providers.length > 0,
    hasEnabledModels: providers.some(
      (provider) =>
        provider.enabled && provider.models.some((model) => model.enabled),
    ),
  }
}

export async function createProviderRecord(
  input: CreateProviderPersistenceInput,
): Promise<ProviderSummary> {
  const db = getDatabase()
  const now = new Date()
  const providerId = randomUUID()
  const trimmedModels = input.successfulModels.map((model) => model.trim())

  await db.transaction(async (tx) => {
    await tx.insert(llmProvidersTable).values({
      id: providerId,
      name: input.name.trim(),
      vendor: input.vendor,
      baseUrl: input.baseUrl.trim(),
      apiKeyEncrypted: input.encryptedApiKey,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    })

    await tx.insert(llmModelsTable).values(
      trimmedModels.map((modelName) => ({
        id: randomUUID(),
        providerId,
        name: modelName,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })),
    )
  })

  const provider = await getProviderById(providerId)

  if (!provider) {
    throw new Error('Provider 创建后加载失败。')
  }

  return provider
}

export async function setProviderEnabled(
  providerId: string,
  enabled: boolean,
): Promise<void> {
  const db = getDatabase()

  await db
    .update(llmProvidersTable)
    .set({
      enabled,
      updatedAt: new Date(),
    })
    .where(eq(llmProvidersTable.id, providerId))
}

export async function setModelEnabled(
  modelId: string,
  enabled: boolean,
): Promise<void> {
  const db = getDatabase()

  await db
    .update(llmModelsTable)
    .set({
      enabled,
      updatedAt: new Date(),
    })
    .where(eq(llmModelsTable.id, modelId))
}

export async function getProviderById(
  providerId: string,
): Promise<ProviderSummary | null> {
  const db = getDatabase()
  const providers = await db
    .select()
    .from(llmProvidersTable)
    .where(eq(llmProvidersTable.id, providerId))
    .limit(1)

  const provider = providers[0]

  if (!provider) {
    return null
  }

  const models = await db
    .select()
    .from(llmModelsTable)
    .where(eq(llmModelsTable.providerId, providerId))

  return mapProviderSummary(provider, models)
}

export async function getProviderSecretRecord(providerId: string): Promise<{
  id: string
  name: string
  vendor: ProviderVendor
  baseUrl: string
  apiKeyEncrypted: string
  enabled: boolean
} | null> {
  const db = getDatabase()
  const providers = await db
    .select({
      id: llmProvidersTable.id,
      name: llmProvidersTable.name,
      vendor: llmProvidersTable.vendor,
      baseUrl: llmProvidersTable.baseUrl,
      apiKeyEncrypted: llmProvidersTable.apiKeyEncrypted,
      enabled: llmProvidersTable.enabled,
    })
    .from(llmProvidersTable)
    .where(eq(llmProvidersTable.id, providerId))
    .limit(1)

  return providers[0] ?? null
}

export async function getEnabledProviderModelSelection(
  providerId: string,
  modelId: string,
): Promise<{
  provider: {
    id: string
    name: string
    vendor: ProviderVendor
    baseUrl: string
    apiKeyEncrypted: string
  }
  model: {
    id: string
    name: string
  }
} | null> {
  const db = getDatabase()
  const providers = await db
    .select({
      id: llmProvidersTable.id,
      name: llmProvidersTable.name,
      vendor: llmProvidersTable.vendor,
      baseUrl: llmProvidersTable.baseUrl,
      apiKeyEncrypted: llmProvidersTable.apiKeyEncrypted,
    })
    .from(llmProvidersTable)
    .where(
      and(
        eq(llmProvidersTable.id, providerId),
        eq(llmProvidersTable.enabled, true),
      ),
    )
    .limit(1)

  const provider = providers[0]

  if (!provider) {
    return null
  }

  const models = await db
    .select({
      id: llmModelsTable.id,
      name: llmModelsTable.name,
    })
    .from(llmModelsTable)
    .where(
      and(
        eq(llmModelsTable.id, modelId),
        eq(llmModelsTable.providerId, providerId),
        eq(llmModelsTable.enabled, true),
      ),
    )
    .limit(1)

  const model = models[0]

  if (!model) {
    return null
  }

  return { provider, model }
}
