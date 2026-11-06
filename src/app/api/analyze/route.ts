import { NextRequest, NextResponse } from 'next/server'
import { analyzeDataset } from '@/lib/claude'

export const dynamic = 'force-dynamic'

/**
 * POST /api/analyze
 * Inspect a dataset's schema + sample and return an AI analysis:
 * a problem statement, the teams who'd use it, and specific success metrics.
 */
export async function POST(request: NextRequest) {
  try {
    const { schema, sampleRows, problemStatement } = await request.json()
    if (!Array.isArray(schema) || schema.length === 0) {
      return NextResponse.json({ error: 'schema is required' }, { status: 400 })
    }
    const analysis = await analyzeDataset({
      schema,
      sampleRows: Array.isArray(sampleRows) ? sampleRows : [],
      problemStatement,
    })
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('analyze error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze' },
      { status: 500 }
    )
  }
}
