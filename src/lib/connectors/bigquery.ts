import { IDataConnector, IngestResult, SourceType } from './types'

export interface BigQueryConfig {
  projectId: string
  datasetId: string
  tableId: string
  serviceAccountJson: string // JSON stringified service account key
}

/**
 * Snapshot-at-connect BigQuery connector: reads schema + a capped sample at
 * creation time using BigQuery's REST API. Does not persist credentials.
 * Live/scheduled sync is a later task (see TAI-32).
 *
 * Uses BigQuery REST API:
 * https://cloud.google.com/bigquery/docs/reference/rest
 */
export class BigQueryConnector implements IDataConnector {
  readonly sourceType: SourceType = 'bigquery'
  private cfg: BigQueryConfig
  private accessToken: string | null = null

  constructor(cfg: BigQueryConfig) {
    this.cfg = cfg
  }

  private parseServiceAccount(): { client_email: string; private_key: string } {
    try {
      return JSON.parse(this.cfg.serviceAccountJson)
    } catch (err) {
      throw new Error('Invalid service account JSON')
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken

    const sa = this.parseServiceAccount()
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    }
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/bigquery',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    // Create JWT (simplified - in production use a proper JWT library)
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const message = `${headerB64}.${payloadB64}`

    // Sign with private key
    const crypto = await import('crypto')
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(message)
    const signature = signer.sign(sa.private_key, 'base64')
    const jwt = `${message}.${signature}`

    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data = (await response.json()) as { access_token: string }
    this.accessToken = data.access_token
    return this.accessToken
  }

  async testConnection(): Promise<void> {
    try {
      const token = await this.getAccessToken()
      const response = await fetch(
        `https://www.googleapis.com/bigquery/v2/projects/${this.cfg.projectId}/datasets/${this.cfg.datasetId}/tables/${this.cfg.tableId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (err) {
      throw new Error(
        `Could not connect to BigQuery: ${err instanceof Error ? err.message : 'unknown error'}`
      )
    }
  }

  async ingest(sampleLimit = 500): Promise<IngestResult> {
    try {
      const token = await this.getAccessToken()

      // Get table metadata for schema
      const tableResponse = await fetch(
        `https://www.googleapis.com/bigquery/v2/projects/${this.cfg.projectId}/datasets/${this.cfg.datasetId}/tables/${this.cfg.tableId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!tableResponse.ok) {
        throw new Error(`Failed to fetch table metadata: ${tableResponse.statusText}`)
      }

      const tableData = (await tableResponse.json()) as any
      const columns = (tableData.schema?.fields || []).map((f: any) => f.name)

      if (columns.length === 0) {
        throw new Error('Table has no columns')
      }

      // Query for row count
      const countQuery = `SELECT COUNT(*) as count FROM \`${this.cfg.projectId}.${this.cfg.datasetId}.${this.cfg.tableId}\``
      const countResult = await this.executeQuery(token, countQuery)
      const rowCount = Number(countResult[0]?.count || 0)

      // Query for sample data
      const sampleQuery = `SELECT * FROM \`${this.cfg.projectId}.${this.cfg.datasetId}.${this.cfg.tableId}\` LIMIT ${Math.max(
        1,
        Math.floor(sampleLimit)
      )}`
      const rows = await this.executeQuery(token, sampleQuery)

      return {
        name: this.cfg.tableId,
        schema: columns,
        rows,
        rowCount,
        lastSyncAt: new Date().toISOString(),
      }
    } catch (err) {
      throw new Error(
        `BigQuery ingest failed: ${err instanceof Error ? err.message : 'unknown error'}`
      )
    }
  }

  private async executeQuery(token: string, query: string): Promise<Record<string, any>[]> {
    const response = await fetch(
      `https://www.googleapis.com/bigquery/v2/projects/${this.cfg.projectId}/queries`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          useLegacySql: false,
          timeoutMs: 30000,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Query failed: ${error}`)
    }

    const data = (await response.json()) as any
    return data.rows || []
  }
}
