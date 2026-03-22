import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DB_FILE_NAME ?? 'file:./opencopilot.db'

export default defineConfig({
  out: './drizzle',
  schema: ['./src/main/db/schema.ts', './src/main/db/tables/*.ts'],
  dialect: 'sqlite',
  dbCredentials: {
    url: databaseUrl,
  },
})
