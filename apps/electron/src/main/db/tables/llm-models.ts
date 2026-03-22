import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { llmProvidersTable } from './llm-providers'

export const llmModelsTable = sqliteTable('llm_models', {
  id: text('id').primaryKey(),
  providerId: text('provider_id')
    .notNull()
    .references(() => llmProvidersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})
