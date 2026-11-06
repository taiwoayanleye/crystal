import { NextRequest, NextResponse } from 'next/server'
import { getDataset, getDatasetRows, deleteDataset } from '@/lib/database'
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

    const sizeMb = Math.max(1, Math.round(dataset.metadata.rowCount / 100))
    const applications = Array.from(
      new Set(
        dataset.users
          .split(/[,/]/)
          .map((u) => `${u.trim()} Dashboard`)
          .filter((u) => u.length > 12)
      )
    )
    if (applications.length === 0) applications.push('Analytics Dashboard')

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
        raw: {
          name: 'S3 CSV',
          description: `${dataset.metadata.rowCount.toLocaleString()} rows · ${sizeMb}MB`,
          status: freshnessStatus,
        },
        etl: {
          name: 'Parse & Store',
          description: 'Schema + type inference on upload',
          status: 'fresh',
        },
        transform: {
          name: 'Semantic Layer',
          description: `${dataset.metadata.columnCount} columns cleaned`,
          status: 'fresh',
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
