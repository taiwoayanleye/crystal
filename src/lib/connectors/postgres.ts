import { Client } from 'pg'
import { IDataConnector, IngestResult, SourceType } from './types'

export interface PostgresConfig {
  host: string
  port?: number
  database: string
  user: string
  password: string
  table: string
  schema?: string // defaults to "public"
  ssl?: boolean // defaults to true (most hosted Postgres requires it)
}

// Postgres identifiers we build into SQL can't be parameterized, so we only
// allow a safe character set and quote them.
const IDENT = /^[A-Za-z_][A-Za-z0-9_$]*$/

function quoteIdent(name: string): string {
  if (!IDENT.test(name)) throw new Error(`Invalid identifier: ${name}`)
  return `"${name}"`
}

/**
 * Snapshot-at-connect PostgreSQL connector: reads schema + a capped sample at
 * creation time and does not persist credentials. Live/scheduled sync is a
 * later task (see TAI-32).
 */
export class PostgresConnector implements IDataConnector {
  readonly sourceType: SourceType = 'postgres'
  private cfg: PostgresConfig

  constructor(cfg: PostgresConfig) {
    this.cfg = cfg
  }

  private newClient(): Client {
    const { host, port, database, user, password, ssl = true } = this.cfg
    return new Client({
      host,
      port: port ?? 5432,
      database,
      user,
      password,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
      // Fail fast instead of hanging on an unreachable host.
      connectionTimeoutMillis: 10_000,
      statement_timeout: 15_000,
    })
  }

  async testConnection(): Promise<void> {
    const client = this.newClient()
    try {
      await client.connect()
      await client.query('SELECT 1')
    } catch (err) {
      throw new Error(
        `Could not connect: ${err instanceof Error ? err.message : 'unknown error'}`
      )
    } finally {
      await client.end().catch(() => {})
    }
  }

  async ingest(sampleLimit = 500): Promise<IngestResult> {
    const schema = this.cfg.schema || 'public'
    const table = this.cfg.table
    const client = this.newClient()
    try {
      await client.connect()

      // Column names (ordered) — parameterized against information_schema.
      const cols = await client.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [schema, table]
      )
      if (cols.rows.length === 0) {
        throw new Error(`Table "${schema}.${table}" not found or has no columns`)
      }
      const columns = cols.rows.map((r) => r.column_name)

      const qualified = `${quoteIdent(schema)}.${quoteIdent(table)}`

      const count = await client.query<{ count: string }>(
        `SELECT count(*)::bigint AS count FROM ${qualified}`
      )
      const rowCount = Number(count.rows[0]?.count ?? 0)

      const sample = await client.query(
        `SELECT * FROM ${qualified} LIMIT ${Math.max(1, Math.floor(sampleLimit))}`
      )

      return {
        name: table,
        schema: columns,
        rows: sample.rows as Record<string, any>[],
        rowCount,
      }
    } catch (err) {
      throw new Error(
        `PostgreSQL ingest failed: ${err instanceof Error ? err.message : 'unknown error'}`
      )
    } finally {
      await client.end().catch(() => {})
    }
  }
}
