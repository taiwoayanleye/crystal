import {
  Dataset,
  DatasetWithMetrics,
  QualityMetrics,
  OutcomeMetrics,
} from './types'
import { calculateOverallQuality } from './metrics'
import { getSql } from './db'

/**
 * Postgres-backed data store (Neon via the Vercel Marketplace).
 *
 * Datasets persist across deploys and serverless instances. Nested shapes
 * (schema/metadata/quality/outcome) and the capped sample rows are stored as
 * JSONB. `usage_count` drives the live usage score.
 */

interface DatasetRow {
  id: string
  name: string
  icon: string
  source_type: 'csv' | 'postgres'
  success_metrics: string[]
  problem_statement: string
  users: string
  schema: string[]
  metadata: { rowCount: number; columnCount: number }
  quality: QualityMetrics
  outcome: OutcomeMetrics
  rows: Record<string, any>[]
  usage_count: number
  created_at: string
  updated_at: string
  last_sync_at: string
}

const ICONS = ['📊', '📈', '📦', '🧬', '💊', '🔬']

function iconFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return ICONS[h % ICONS.length]
}

function generateSampleRows(count: number, schema: string[]): Record<string, any>[] {
  const rows = []
  const cap = Math.min(count, 500)
  for (let i = 0; i < cap; i++) {
    const row: Record<string, any> = {}
    schema.forEach((col, j) => {
      if (j === 0) row[col] = `ID_${i + 1000}`
      else if (col.match(/amount|revenue|value|price/i)) row[col] = Math.floor(Math.random() * 10000)
      else if (col.match(/date|time/i))
        row[col] = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      else row[col] = ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)]
    })
    rows.push(row)
  }
  return rows
}

// --- schema + seed bootstrap (runs once per process) ---

let ready: Promise<void> | null = null

function ensureReady(): Promise<void> {
  if (!ready) ready = bootstrap()
  return ready
}

async function bootstrap(): Promise<void> {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      users TEXT NOT NULL,
      schema JSONB NOT NULL,
      metadata JSONB NOT NULL,
      quality JSONB NOT NULL,
      outcome JSONB NOT NULL,
      rows JSONB NOT NULL DEFAULT '[]'::jsonb,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  // Added after initial release; keep existing rows working.
  await sql`ALTER TABLE datasets ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'csv'`
  await sql`ALTER TABLE datasets ADD COLUMN IF NOT EXISTS success_metrics JSONB NOT NULL DEFAULT '[]'::jsonb`
  await sql`ALTER TABLE datasets ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ`
  await sql`UPDATE datasets SET last_sync_at = created_at WHERE last_sync_at IS NULL`
  await sql`ALTER TABLE datasets ALTER COLUMN last_sync_at SET DEFAULT now()`
  await sql`ALTER TABLE datasets ALTER COLUMN last_sync_at SET NOT NULL`
  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM datasets`) as { count: number }[]
  if (count === 0) await seed()
}

async function insertDataset(d: {
  id: string
  name: string
  icon?: string
  sourceType?: 'csv' | 'postgres'
  successMetrics?: string[]
  problemStatement: string
  users: string
  schema: string[]
  metadata: { rowCount: number; columnCount: number }
  quality: QualityMetrics
  outcome: OutcomeMetrics
  rows: Record<string, any>[]
  createdAt?: string
  updatedAt?: string
  lastSyncAt?: string
}) {
  const sql = getSql()
  const created = d.createdAt ?? new Date().toISOString()
  const updated = d.updatedAt ?? created
  const lastSync = d.lastSyncAt ?? created
  await sql`
    INSERT INTO datasets
      (id, name, icon, source_type, success_metrics, problem_statement, users, schema, metadata, quality, outcome, rows, usage_count, created_at, updated_at, last_sync_at)
    VALUES (
      ${d.id}, ${d.name}, ${d.icon || iconFor(d.id)}, ${d.sourceType ?? 'csv'}, ${JSON.stringify(d.successMetrics ?? [])},
      ${d.problemStatement}, ${d.users},
      ${JSON.stringify(d.schema)}, ${JSON.stringify(d.metadata)},
      ${JSON.stringify(d.quality)}, ${JSON.stringify(d.outcome)},
      ${JSON.stringify(d.rows)}, 0, ${created}, ${updated}, ${lastSync}
    )
    ON CONFLICT (id) DO NOTHING
  `
}

async function seed(): Promise<void> {
  const now = Date.now()
  await insertDataset({
    id: 'dataset_1',
    name: 'Customer Revenue Dataset',
    problemStatement: 'Predict customer lifetime value',
    users: 'Finance, Product',
    schema: ['customer_id', 'revenue', 'segment', 'retention'],
    metadata: { rowCount: 5000, columnCount: 4 },
    quality: { freshness: 95, completeness: 98, accuracy: 70 },
    outcome: {
      hypothesis: 'LTV scoring lets Finance prioritize high-value accounts',
      status: 'Testing (Week 1 of 4)',
      businessImpact: 'If confirmed: $500K ARR impact',
      outcomeScore: 40,
    },
    rows: generateSampleRows(5000, ['customer_id', 'revenue', 'segment', 'retention']),
    createdAt: new Date(now - 7 * 864e5).toISOString(),
    updatedAt: new Date(now - 2 * 36e5).toISOString(),
  })

  await insertDataset({
    id: 'dataset_2',
    name: 'Transactions Dataset',
    problemStatement: 'Improve fraud detection accuracy',
    users: 'Risk, Operations',
    schema: ['transaction_id', 'amount', 'merchant', 'timestamp', 'fraud_flag'],
    metadata: { rowCount: 15000, columnCount: 5 },
    quality: { freshness: 97, completeness: 96, accuracy: 88 },
    outcome: {
      hypothesis: 'Real-time scoring cuts fraud losses without blocking good users',
      status: 'Active (Week 3 of 4)',
      businessImpact: 'Confirmed: $1.2M fraud losses prevented',
      outcomeScore: 85,
    },
    rows: generateSampleRows(15000, ['transaction_id', 'amount', 'merchant', 'timestamp', 'fraud_flag']),
    createdAt: new Date(now - 14 * 864e5).toISOString(),
    updatedAt: new Date(now - 1 * 36e5).toISOString(),
  })

  await insertDataset({
    id: 'dataset_3',
    name: 'Orders Dataset',
    problemStatement: 'Predict churn risk for at-risk accounts',
    users: 'Sales, Customer Success',
    schema: ['order_id', 'user_id', 'amount', 'status', 'order_date'],
    metadata: { rowCount: 8000, columnCount: 5 },
    quality: { freshness: 82, completeness: 94, accuracy: 76 },
    outcome: {
      hypothesis: 'Churn scores let CS intervene 30 days before cancellation',
      status: 'Testing (Week 2 of 4)',
      businessImpact: 'If confirmed: 8% reduction in logo churn',
      outcomeScore: 55,
    },
    rows: generateSampleRows(8000, ['order_id', 'user_id', 'amount', 'status', 'order_date']),
    createdAt: new Date(now - 30 * 864e5).toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

// --- mapping ---

function toDataset(r: DatasetRow): Dataset {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    sourceType: r.source_type ?? 'csv',
    problemStatement: r.problem_statement,
    users: r.users,
    schema: r.schema,
    metadata: r.metadata,
    quality: r.quality,
    outcome: r.outcome,
    successMetrics: r.success_metrics ?? [],
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
    lastSyncAt: new Date(r.last_sync_at).toISOString(),
  }
}

function toWithMetrics(r: DatasetRow): DatasetWithMetrics {
  return {
    ...toDataset(r),
    metrics: {
      id: `metric_${r.id}`,
      datasetId: r.id,
      qualityScore: calculateOverallQuality(r.quality),
      usageCount: r.usage_count,
      outcomeScore: r.outcome.outcomeScore,
      updatedAt: new Date(r.updated_at).toISOString(),
    },
  }
}

// --- public API ---

export async function saveDataset(input: {
  name: string
  icon?: string
  sourceType?: 'csv' | 'postgres'
  lastSyncAt?: string
  successMetrics?: string[]
  problemStatement: string
  users: string
  schema: string[]
  metadata: { rowCount: number; columnCount: number }
  quality: QualityMetrics
  rows: Record<string, any>[]
}): Promise<string> {
  await ensureReady()
  const id = `dataset_${Date.now()}`
  await insertDataset({
    id,
    name: input.name,
    icon: input.icon,
    sourceType: input.sourceType ?? 'csv',
    lastSyncAt: input.lastSyncAt,
    successMetrics: input.successMetrics ?? [],
    problemStatement: input.problemStatement,
    users: input.users,
    schema: input.schema,
    metadata: input.metadata,
    quality: input.quality,
    // Honest starting point: outcome is user-owned and not yet tracked.
    outcome: {
      hypothesis: input.problemStatement,
      status: 'Not started',
      businessImpact: 'Not set',
      outcomeScore: 0,
    },
    rows: input.rows,
  })
  return id
}

export async function updateOutcome(id: string, outcome: OutcomeMetrics): Promise<boolean> {
  await ensureReady()
  const sql = getSql()
  const updated = (await sql`
    UPDATE datasets SET outcome = ${JSON.stringify(outcome)}, updated_at = now()
    WHERE id = ${id} RETURNING id
  `) as { id: string }[]
  return updated.length > 0
}

// All columns except the heavy `rows` JSONB, which list/detail never use
// (only getDatasetRows needs it). Keeping it out avoids shipping hundreds of
// sample rows over Neon's HTTP driver on every list/detail read.
const COLS = `id, name, icon, source_type, success_metrics, problem_statement, users, schema, metadata, quality, outcome, usage_count, created_at, updated_at, last_sync_at`

export async function getAllDatasets(): Promise<DatasetWithMetrics[]> {
  await ensureReady()
  const sql = getSql()
  const rows = (await sql.query(
    `SELECT ${COLS} FROM datasets ORDER BY created_at DESC`
  )) as DatasetRow[]
  return rows.map(toWithMetrics)
}

export async function getDataset(id: string): Promise<DatasetWithMetrics | null> {
  await ensureReady()
  const sql = getSql()
  const rows = (await sql.query(
    `SELECT ${COLS} FROM datasets WHERE id = $1 LIMIT 1`,
    [id]
  )) as DatasetRow[]
  return rows[0] ? toWithMetrics(rows[0]) : null
}

export async function getDatasetRows(id: string, limit = 100): Promise<Record<string, any>[]> {
  await ensureReady()
  const sql = getSql()
  const rows = (await sql`SELECT rows FROM datasets WHERE id = ${id} LIMIT 1`) as { rows: Record<string, any>[] }[]
  return (rows[0]?.rows ?? []).slice(0, limit)
}

export async function deleteDataset(id: string): Promise<boolean> {
  await ensureReady()
  const sql = getSql()
  const deleted = (await sql`DELETE FROM datasets WHERE id = ${id} RETURNING id`) as { id: string }[]
  return deleted.length > 0
}

export async function incrementUsageCount(id: string): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`UPDATE datasets SET usage_count = usage_count + 1, updated_at = now() WHERE id = ${id}`
}
