import { IDataConnector, IngestResult, SourceType } from './types'
import { createHmac } from 'crypto'

export interface S3Config {
  bucket: string
  key: string // S3 object key (path)
  accessKeyId: string
  secretAccessKey: string
  region?: string // default: us-east-1
}

/**
 * Snapshot-at-connect S3 connector: reads CSV files from S3 buckets.
 * Credentials are used once and never stored.
 *
 * Uses AWS S3 REST API with Signature Version 4 signing.
 */
export class S3Connector implements IDataConnector {
  readonly sourceType: SourceType = 's3'
  private cfg: S3Config

  constructor(cfg: S3Config) {
    this.cfg = { ...cfg, region: cfg.region || 'us-east-1' }
  }

  private async signRequest(
    method: string,
    path: string,
    query?: string
  ): Promise<{ Authorization: string; 'X-Amz-Date': string }> {
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z'
    const dateStamp = amzDate.split('T')[0]

    const host = `${this.cfg.bucket}.s3.${this.cfg.region}.amazonaws.com`
    const fullPath = `/${this.cfg.key}${query ? `?${query}` : ''}`

    // Create canonical request
    const canonicalRequest = [
      method,
      `/${this.cfg.key}`,
      query || '',
      `host:${host}\nx-amz-date:${amzDate}\n`,
      'host;x-amz-date',
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // empty payload hash
    ].join('\n')

    const canonicalRequestHash = createHmac('sha256', '').update(canonicalRequest).digest('hex')

    // Create string to sign
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      `${dateStamp}/${this.cfg.region}/s3/aws4_request`,
      canonicalRequestHash,
    ].join('\n')

    // Calculate signature
    const kDate = createHmac('sha256', `AWS4${this.cfg.secretAccessKey}`)
      .update(dateStamp)
      .digest()
    const kRegion = createHmac('sha256', kDate).update(this.cfg.region).digest()
    const kService = createHmac('sha256', kRegion).update('s3').digest()
    const kSigning = createHmac('sha256', kService).update('aws4_request').digest()
    const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

    const authHeader = [
      'AWS4-HMAC-SHA256 Credential=' +
        `${this.cfg.accessKeyId}/${dateStamp}/${this.cfg.region}/s3/aws4_request`,
      `SignedHeaders=host;x-amz-date`,
      `Signature=${signature}`,
    ].join(', ')

    return {
      Authorization: authHeader,
      'X-Amz-Date': amzDate,
    }
  }

  async testConnection(): Promise<void> {
    try {
      const headers = await this.signRequest('HEAD', '')
      const host = `${this.cfg.bucket}.s3.${this.cfg.region}.amazonaws.com`

      const response = await fetch(`https://${host}/${this.cfg.key}`, {
        method: 'HEAD',
        headers: {
          ...headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (err) {
      throw new Error(`Could not connect to S3: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }

  async ingest(sampleLimit = 500): Promise<IngestResult> {
    try {
      // Fetch the CSV file from S3
      const headers = await this.signRequest('GET', '')
      const host = `${this.cfg.bucket}.s3.${this.cfg.region}.amazonaws.com`

      const response = await fetch(`https://${host}/${this.cfg.key}`, {
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
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
        name: this.cfg.key.split('/').pop() || 'data',
        schema: headers_row,
        rows,
        rowCount,
        lastSyncAt: new Date().toISOString(),
      }
    } catch (err) {
      throw new Error(`S3 ingest failed: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }
}
