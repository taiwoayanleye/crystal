import { NextResponse } from 'next/server'
import { getAllDatasets } from '@/lib/database'
import { calculateOverallQuality } from '@/lib/metrics'

// Reads in-memory state that changes at runtime; never prerender/cache.
export const dynamic = 'force-dynamic'

/**
 * GET /api/datasets
 * Fetch all datasets with summary metrics for the dashboard grid.
 */
export async function GET() {
  try {
    const datasets = await getAllDatasets()

    const response = datasets.map((dataset) => ({
      id: dataset.id,
      icon: dataset.icon,
      title: dataset.name,
      problemStatement: dataset.problemStatement,
      users: dataset.users,
      qualityScore: calculateOverallQuality(dataset.quality),
      // Usage score blends a stable baseline with live chat activity.
      usageScore: Math.min(40 + dataset.metrics.usageCount * 5, 100),
      outcomeScore: dataset.outcome.outcomeScore,
      hypothesis: dataset.outcome.hypothesis,
      status: dataset.outcome.status,
      sourceType: dataset.sourceType,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
      lastSyncAt: dataset.lastSyncAt,
      rowCount: dataset.metadata.rowCount,
      columnCount: dataset.metadata.columnCount,
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch datasets' },
      { status: 500 }
    )
  }
}
