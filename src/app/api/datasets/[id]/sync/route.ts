import { NextRequest, NextResponse } from 'next/server'
import { setSyncSchedule, getSyncHistory } from '@/lib/database'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/datasets/[id]/sync
 * Set the daily sync schedule (UTC time) for a dataset.
 * Body: { schedule: "HH:MM" | null }
 *
 * GET /api/datasets/[id]/sync
 * Get the sync history for a dataset.
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { schedule } = body

    // Validate schedule format if provided
    if (schedule !== null && !/^\d{2}:\d{2}$/.test(schedule)) {
      return NextResponse.json(
        { error: 'Invalid schedule format. Use HH:MM (UTC, 00:00-23:59)' },
        { status: 400 }
      )
    }

    const updated = await setSyncSchedule(id, schedule)
    if (!updated) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      datasetId: id,
      syncSchedule: schedule,
    })
  } catch (error) {
    console.error('Set sync schedule error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set schedule' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const history = await getSyncHistory(id, 50)

    return NextResponse.json({
      datasetId: id,
      syncHistory: history,
    })
  } catch (error) {
    console.error('Get sync history error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get history' },
      { status: 500 }
    )
  }
}
