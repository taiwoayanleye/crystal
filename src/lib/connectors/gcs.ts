import { IDataConnector, IngestResult, SourceType } from './types'

export interface GCSConfig {
  bucket: string
  objectName: string // GCS object path
  serviceAccountJson: string // JSON stringified service account key
}

/**
 * Snapshot-at-connect GCS connector: reads CSV files from Google Cloud Storage.
 * Uses OAuth2 JWT authentication (same as BigQuery).
 * Credentials are used once and never stored.
 *
 * Uses Google Cloud Storage REST API:
 * https://cloud.google.com/storage/docs/json_api
 */
export class GCSConnector implements IDataConnector {
  readonly sourceType: SourceType = 'gcs'
  private cfg: GCSConfig
  private accessToken: string | null = null

  constructor(cfg: GCSConfig) {
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
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const message = `${headerB64}.${payloadB64}`

    const crypto = await import('crypto')
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(message)
    const signature = signer.sign(sa.private_key, 'base64')
    const jwt = `${message}.${signature}`

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
        `https://www.googleapis.com/storage/v1/b/${this.cfg.bucket}/o/${encodeURIComponent(this.cfg.objectName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (err) {
      throw new Error(`Could not connect to GCS: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }

  async ingest(sampleLimit = 500): Promise<IngestResult> {
    try {
      const token = await this.getAccessToken()

      // Fetch the object from GCS
      const response = await fetch(
        `https://www.googleapis.com/storage/v1/b/${this.cfg.bucket}/o/${encodeURIComponent(this.cfg.objectName)}?alt=media`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch object: ${response.statusText}`)
      }

      const content = await response.text()

      // Parse CSV content
      const lines = content.trim().split('\n')
      if (lines.length === 0) {
        throw new Error('File is empty')
      }

      // Parse header
      const headers_row = lines[0]
        .split(',')
        .map((h) => h.trim().replace(/^"|"$/g, ''))

      if (headers_row.length === 0) {
        throw new Error('No columns found')
      }

      // Parse rows
      const rows: Record<string, any>[] = []
      const limit = Math.min(sampleLimit, lines.length - 1)

      for (let i = 1; i <= limit; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
        const row: Record<string, any> = {}
        headers_row.forEach((header, idx) => {
          row[header] = values[idx] || null
        })
        rows.push(row)
      }

      // Count total rows (excluding header)
      const rowCount = Math.max(0, lines.length - 1)

      return {
        name: this.cfg.objectName.split('/').pop() || 'data',
        schema: headers_row,
        rows,
        rowCount,
        lastSyncAt: new Date().toISOString(),
      }
    } catch (err) {
      throw new Error(`GCS ingest failed: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }
}
