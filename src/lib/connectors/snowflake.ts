import { IDataConnector, IngestResult, SourceType } from './types'

export interface SnowflakeConfig {
  accountId: string // e.g., "xy12345.us-east-1"
  user: string
  password: string
  warehouse: string
  database: string
  schema?: string // defaults to "PUBLIC"
  table: string
}

/**
 * Snapshot-at-connect Snowflake connector: reads schema + a capped sample at
 * creation time using Snowflake's REST API. Does not persist credentials.
 * Live/scheduled sync is a later task (see TAI-32).
 *
 * Uses Snowflake REST API (SQL API):
 * https://docs.snowflake.com/en/developer-guide/sql-api
 */
export class SnowflakeConnector implements IDataConnector {
  readonly sourceType: SourceType = 'snowflake'
  private cfg: SnowflakeConfig

  constructor(cfg: SnowflakeConfig) {
    this.cfg = cfg
  }

  private getBaseUrl(): string {
    // Normalize accountId: handle both "xy12345" and "xy12345.us-east-1" formats
    const accountId = this.cfg.accountId.includes('.')
      ? this.cfg.accountId.split('.')[0]
      : this.cfg.accountId
    return `https://${accountId}.snowflakecomputing.com/api/v2`
  }

  private getAuthHeader(): string {
    const credentials = `${this.cfg.user}:${this.cfg.password}`
    return 'Basic ' + Buffer.from(credentials).toString('base64')
  }

  async testConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/statements`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
          'User-Agent': 'Crystal/1.0',
        },
        body: JSON.stringify({
          statement: 'SELECT 1 as test',
          timeout: 10,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }
    } catch (err) {
      throw new Error(
        `Could not connect to Snowflake: ${err instanceof Error ? err.message : 'unknown error'}`
      )
    }
  }

  async ingest(sampleLimit = 500): Promise<IngestResult> {
    const schema = this.cfg.schema || 'PUBLIC'
    const table = this.cfg.table
    const warehouse = this.cfg.warehouse
    const database = this.cfg.database

    try {
      // Step 1: Get column information
      const colQuery = `
        SELECT column_name
        FROM ${database}.information_schema.columns
        WHERE table_schema = '${schema}' AND table_name = '${table}'
        ORDER BY ordinal_position
      `
      const colResult = await this.executeQuery(colQuery, warehouse)
      const columns = colResult.map((row: any) => row.COLUMN_NAME)

      if (columns.length === 0) {
        throw new Error(
          `Table "${database}.${schema}.${table}" not found or has no columns`
        )
      }

      // Step 2: Get row count
      const countQuery = `SELECT COUNT(*) as count FROM ${database}.${schema}.${table}`
      const countResult = await this.executeQuery(countQuery, warehouse)
      const rowCount = Number(countResult[0]?.COUNT ?? 0)

      // Step 3: Get sample data
      const sampleQuery = `
        SELECT * FROM ${database}.${schema}.${table}
        LIMIT ${Math.max(1, Math.floor(sampleLimit))}
      `
      const rows = await this.executeQuery(sampleQuery, warehouse)

      return {
        name: table,
        schema: columns,
        rows: rows as Record<string, any>[],
        rowCount,
        lastSyncAt: new Date().toISOString(),
      }
    } catch (err) {
      throw new Error(
        `Snowflake ingest failed: ${err instanceof Error ? err.message : 'unknown error'}`
      )
    }
  }

  private async executeQuery(sql: string, warehouse: string): Promise<any[]> {
    const response = await fetch(`${this.getBaseUrl()}/statements`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'User-Agent': 'Crystal/1.0',
      },
      body: JSON.stringify({
        statement: sql,
        warehouse,
        database: this.cfg.database,
        schema: this.cfg.schema || 'PUBLIC',
        timeout: 60,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Query failed: HTTP ${response.status}: ${error}`)
    }

    const data = await response.json() as any
    // Snowflake REST API returns results in the resultSetMetadata and data fields
    if (data.data && Array.isArray(data.data)) {
      return data.data
    }
    return []
  }
}
