import { NextRequest, NextResponse } from 'next/server'
import { getDataset, getDatasetRows, deleteDataset, updateOutcome } from '@/lib/database'
import type { OutcomeMetrics } from '@/lib/types'
import { getTrendData, getUsageMetrics } from '@/lib/metrics'
import { computeProfile } from '@/lib/profile'

/**
 * GET /api/datasets/[id]
 * Fetch a single dataset with detailed metrics, trend, and lineage.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const dataset = await getDataset(id)

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // Profile over the full stored sample; preview shows the first rows.
    const sampledRows = await getDatasetRows(id, 500)
    const profile = computeProfile(sampledRows, dataset.schema)
    const sampleRows = sampledRows.slice(0, 8)
    const usage = getUsageMetrics(id, dataset.metrics.usageCount)
    const trendData = getTrendData(id)

    const freshnessStatus =
      dataset.quality.freshness >= 90
        ? 'fresh'
        : dataset.quality.freshness >= 70
        ? 'stale'
        : 'error'

    const applications = Array.from(
      new Set(
        dataset.users
          .split(/[,/]/)
          .map((u) => `${u.trim()} Dashboard`)
          .filter((u) => u.length > 12)
      )
    )
    if (applications.length === 0) applications.push('Analytics Dashboard')

    // Lineage built from the dataset's real source + shape (no fabricated size).
    const isPg = dataset.sourceType === 'postgres'
    const rowsLabel = `${dataset.metadata.rowCount.toLocaleString()} rows · ${dataset.metadata.columnCount} cols`
    const rawStage = isPg
      ? { name: 'PostgreSQL', description: rowsLabel, status: freshnessStatus }
      : { name: 'CSV upload', description: rowsLabel, status: freshnessStatus }
    const etlStage = isPg
      ? { name: 'Introspect & sample', description: 'Schema from information_schema', status: 'fresh' as const }
      : { name: 'Parse & store', description: 'Schema + type inference on upload', status: 'fresh' as const }

    const response = {
      id: dataset.id,
      name: dataset.name,
      icon: dataset.icon,
      problemStatement: dataset.problemStatement,
      users: dataset.users,
      schema: dataset.schema,
      metadata: dataset.metadata,
      metrics: {
        quality: dataset.quality,
        usage,
        outcome: dataset.outcome,
      },
      trendData,
      sampleRows,
      profile,
      lineage: {
        raw: rawStage,
        etl: etlStage,
        transform: {
          name: 'Profile',
          description: `${dataset.metadata.columnCount} columns profiled`,
          status: 'fresh' as const,
        },
        dataset: {
          name: dataset.name,
          description: 'Governed data product',
          status: freshnessStatus,
        },
        usage: {
          name: 'Used By',
          applications,
          status: 'fresh' as const,
        },
      },
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch dataset' },
      { status: 500 }
    )
  }
}

const ALLOWED_STATUS = ['Not started', 'Testing', 'Validated', 'Rejected']

/**
 * PATCH /api/datasets/[id]
 * Update the (user-owned) outcome tracking for a dataset.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const o = body?.outcome
    if (!o || typeof o !== 'object') {
      return NextResponse.json({ error: 'Missing outcome' }, { status: 400 })
    }

    const score = Number(o.outcomeScore)
    const outcome: OutcomeMetrics = {
      hypothesis: String(o.hypothesis ?? '').slice(0, 500),
      status: ALLOWED_STATUS.includes(o.status) ? o.status : 'Not started',
      businessImpact: String(o.businessImpact ?? '').slice(0, 500) || 'Not set',
      outcomeScore: Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0,
    }

    const ok = await updateOutcome(params.id, outcome)
    if (!ok) return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    return NextResponse.json({ success: true, outcome })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/datasets/[id]
 * Remove a dataset (used by the detail page "Delete" action).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteDataset(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
