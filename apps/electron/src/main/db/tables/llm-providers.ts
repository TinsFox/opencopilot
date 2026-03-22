import type { ProviderVendor } from '@opencopilot/shared/bridge'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const llmProvidersTable = sqliteTable('llm_providers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  vendor: text('vendor').$type<ProviderVendor>().notNull(),
  baseUrl: text('base_url').notNull(),
  apiKeyEncrypted: text('api_key_encrypted').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})
