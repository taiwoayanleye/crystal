/**
 * Unified data-ingestion layer (Phase 2).
 *
 * Every data source — CSV, PostgreSQL, and future connectors (Snowflake,
 * BigQuery, S3/GCS) — implements the same interface, so the rest of the app
 * (metrics, storage, chat) stays source-agnostic.
 */

export type SourceType = 'csv' | 'postgres'

export interface IngestResult {
  /** A human-readable name for the resulting dataset. */
  name: string
  /** Ordered column names. */
  schema: string[]
  /** A capped sample of rows used for metrics, preview, and chat context. */
  rows: Record<string, any>[]
  /** Total row count in the source (may exceed the sampled rows). */
  rowCount: number
}

export interface IDataConnector {
  readonly sourceType: SourceType
  /** Throws a descriptive Error if the source can't be reached. */
  testConnection(): Promise<void>
  /** Pull schema + a capped sample + the total row count. */
  ingest(sampleLimit?: number): Promise<IngestResult>
}
