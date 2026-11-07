import { NextRequest, NextResponse } from 'next/server'
import { getDatasetsSyncScheduled, getDataset } from '@/lib/database'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/sync
 * Returns datasets scheduled for sync at the current UTC hour.
 * Designed to be called by an external cron service (e.g., EasyCron, AWS EventBridge).
 * External service should then call POST /api/refresh/[id] for each returned dataset.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify auth token if provided
    const authToken = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    if (expectedToken && authToken !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentHour = String(now.getUTCHours()).padStart(2, '0')
    const currentMinute = String(now.getUTCMinutes()).padStart(2, '0')
    const currentTime = `${currentHour}:00` // Match to hour boundary

    // Get all datasets with schedules
    const datasetsWithSchedules = await getDatasetsSyncScheduled()

    // Filter those that should sync now (within the current hour)
    const toSync = datasetsWithSchedules.filter((ds) => {
      if (!ds.syncSchedule) return false
      // Schedule format: "HH:MM" (e.g., "09:00")
      const [schedHour] = ds.syncSchedule.split(':')
      return schedHour === currentHour
    })

    return NextResponse.json({
      currentTimeUTC: now.toISOString(),
      scheduledForSync: toSync.map((ds) => ({
        id: ds.id,
        name: ds.name,
        sourceType: ds.sourceType,
        syncSchedule: ds.syncSchedule,
        lastSyncAt: ds.lastSyncAt,
      })),
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron check failed' },
      { status: 500 }
    )
  }
}
