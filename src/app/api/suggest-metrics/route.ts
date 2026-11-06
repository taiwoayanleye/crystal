import { NextRequest, NextResponse } from 'next/server'
import { suggestSuccessMetrics } from '@/lib/claude'

export const dynamic = 'force-dynamic'

/**
 * POST /api/suggest-metrics
 * Inspect a dataset's schema + sample and return AI-proposed success metrics.
 */
export async function POST(request: NextRequest) {
  try {
    const { schema, sampleRows, problemStatement } = await request.json()
    if (!Array.isArray(schema) || schema.length === 0) {
      return NextResponse.json({ error: 'schema is required' }, { status: 400 })
    }
    const metrics = await suggestSuccessMetrics({
      schema,
      sampleRows: Array.isArray(sampleRows) ? sampleRows : [],
      problemStatement,
    })
    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('suggest-metrics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to suggest metrics' },
      { status: 500 }
    )
  }
}
