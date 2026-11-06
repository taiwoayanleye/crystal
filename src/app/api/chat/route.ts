import { NextRequest, NextResponse } from 'next/server'
import { askClaude } from '@/lib/claude'
import { getDataset, getDatasetRows, incrementUsageCount } from '@/lib/database'
import { getUsageMetrics } from '@/lib/metrics'

/**
 * POST /api/chat
 * Send a message and get Claude AI response
 */
export async function POST(request: NextRequest) {
  try {
    const { message, datasetId } = await request.json()

    if (!message || !datasetId) {
      return NextResponse.json(
        { error: 'Missing message or datasetId' },
        { status: 400 }
      )
    }

    // Fetch dataset context
    const dataset = await getDataset(datasetId)
    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Get sample rows for context
    const sampleRows = await getDatasetRows(datasetId, 5)

    // Increment usage counter (feeds the live usage score)
    await incrementUsageCount(datasetId)

    // Prepare context for Claude from the dataset's real metrics
    const context = {
      name: dataset.name,
      problemStatement: dataset.problemStatement,
      users: dataset.users,
      metrics: {
        quality: dataset.quality,
        usage: getUsageMetrics(datasetId, dataset.metrics.usageCount),
      },
      sampleRows,
    }

    // Ask Claude
    const response = await askClaude(message, context)

    return NextResponse.json({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat error:', error)

    // Provide fallback response if Claude API is unavailable
    if (error instanceof Error && error.message.includes('Claude API error')) {
      return NextResponse.json(
        {
          role: 'assistant',
          content: 'Based on your dataset: It appears you have strong data quality metrics (95% freshness, 98% completeness). With 60% org adoption and 12 queries/day, this dataset is gaining traction. Consider tracking the hypothesis impact metric to measure business value. (Claude API unavailable - using sample insight)',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    )
  }
}
