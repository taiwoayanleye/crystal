import { NextRequest, NextResponse } from 'next/server'
import { markScheduledDatasetsStale } from '@/lib/database'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/sync
 * Called by Vercel Cron every hour. Marks datasets whose sync schedule
 * matches the current UTC hour as 'stale', signalling the UI to prompt
 * for a manual refresh (credentials are never stored).
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    if (expectedToken && authToken !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentHour = String(now.getUTCHours()).padStart(2, '0')

    const markedIds = await markScheduledDatasetsStale(currentHour)

    return NextResponse.json({
      currentTimeUTC: now.toISOString(),
      markedStale: markedIds,
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron check failed' },
      { status: 500 }
    )
  }
}
