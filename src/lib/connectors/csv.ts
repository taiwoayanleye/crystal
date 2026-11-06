import { parseCSV, validateCSVFile } from '../csvParser'
import { IDataConnector, IngestResult } from './types'

/** Snapshot connector for uploaded CSV files. */
export class CsvConnector implements IDataConnector {
  readonly sourceType = 'csv' as const

  constructor(private readonly file: File) {}

  async testConnection(): Promise<void> {
    const validation = validateCSVFile(this.file)
    if (!validation.valid) throw new Error(validation.error || 'Invalid CSV file')
  }

  async ingest(sampleLimit = 500): Promise<IngestResult> {
    await this.testConnection()

    try {
      const parsed = await parseCSV(this.file)
      const limit = Math.max(1, Math.floor(sampleLimit))
      return {
        name: this.file.name.replace(/\.csv$/i, ''),
        schema: parsed.headers,
        rows: parsed.rows.slice(0, limit),
        rowCount: parsed.metadata.rowCount,
        lastSyncAt: new Date().toISOString(),
      }
    } catch (error) {
      throw new Error(`CSV ingest failed: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
  }
}
