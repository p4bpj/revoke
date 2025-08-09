import { Pool } from 'pg'

let pool: Pool | null = null

export function getDbPool(): Pool {
  if (pool) return pool

  const connectionString = process.env.DATABASE_URL

  pool = new Pool(
    connectionString
      ? { connectionString, ssl: sslConfigFromEnv() }
      : {
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432', 10),
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'postgres',
          database: process.env.PGDATABASE || 'erc20_indexer',
          ssl: sslConfigFromEnv(),
        }
  )

  return pool
}

function sslConfigFromEnv(): false | { rejectUnauthorized: boolean } {
  const ssl = process.env.PGSSL || process.env.PGSSLMODE
  if (!ssl) return false
  // common Railway/Neon setting
  if (ssl === 'require' || ssl === 'true' || ssl === 'on') {
    return { rejectUnauthorized: false }
  }
  return false
}

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const client = getDbPool()
  const result = await client.query(text, params)
  return result as { rows: T[] }
}



