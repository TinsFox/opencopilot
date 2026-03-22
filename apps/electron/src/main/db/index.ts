import { mkdirSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema'

type AppDatabase = ReturnType<typeof createDrizzleDatabase>
type AppDatabaseClient = ReturnType<typeof createClient>

let client: AppDatabaseClient | null = null
let db: AppDatabase | null = null
let databaseFilePath: string | null = null

function resolveDatabaseTarget(explicitPath?: string): {
  filePath: string
  url: string
} {
  const rawPath = explicitPath?.trim()
  const defaultFilePath = path.join(process.cwd(), 'opencopilot.db')

  if (!rawPath) {
    return {
      filePath: defaultFilePath,
      url: `file:${defaultFilePath}`,
    }
  }

  const normalizedPath =
    rawPath.startsWith('file:') ? rawPath.slice('file:'.length) : rawPath

  if (!normalizedPath) {
    return {
      filePath: defaultFilePath,
      url: `file:${defaultFilePath}`,
    }
  }

  const filePath = path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(process.cwd(), normalizedPath)

  return {
    filePath,
    url: `file:${filePath}`,
  }
}

function createDrizzleDatabase(databaseUrl: string) {
  client = createClient({ url: databaseUrl })

  return drizzle({
    client,
    schema,
  })
}

export async function initializeDatabase(explicitPath?: string): Promise<AppDatabase> {
  if (db) {
    return db
  }

  const target = resolveDatabaseTarget(explicitPath)
  databaseFilePath = target.filePath
  mkdirSync(path.dirname(databaseFilePath), { recursive: true })
  db = createDrizzleDatabase(target.url)

  await client?.execute('PRAGMA foreign_keys = ON')

  await client?.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  await client?.execute(`
    CREATE TABLE IF NOT EXISTS llm_providers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      vendor TEXT NOT NULL,
      base_url TEXT NOT NULL,
      api_key_encrypted TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  await client?.execute(`
    CREATE TABLE IF NOT EXISTS llm_models (
      id TEXT PRIMARY KEY NOT NULL,
      provider_id TEXT NOT NULL,
      name TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (provider_id) REFERENCES llm_providers(id) ON DELETE CASCADE
    )
  `)

  return db
}

export function getDatabase(): AppDatabase {
  if (!db) {
    throw new Error('Database has not been initialized.')
  }

  return db
}

export function getDatabaseFilePath(): string {
  if (!databaseFilePath) {
    throw new Error('Database has not been initialized.')
  }

  return databaseFilePath
}
