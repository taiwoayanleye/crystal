import { NextRequest, NextResponse } from 'next/server'
import { getConnector } from '@/lib/connectors'
import type { IngestResult } from '@/lib/connectors/types'
import { saveIngestResult } from '@/lib/ingestion'
import { UploadResponse } from '@/lib/types'

/**
 * POST /api/upload
 * Upload a CSV file and create a new dataset
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const fileEntry = formData.get('file')
    const file = fileEntry instanceof File ? fileEntry : null
    const problemStatement = (formData.get('problemStatement') as string) || 'Dataset analysis'
    const users = (formData.get('users') as string) || 'Data team'
    const nameOverride = (formData.get('name') as string | null)?.trim() || ''
    const icon = (formData.get('icon') as string | null)?.trim() || undefined
    let successMetrics: string[] = []
    try {
      const raw = formData.get('successMetrics') as string | null
      if (raw) successMetrics = JSON.parse(raw)
    } catch {
      successMetrics = []
    }

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const connector = getConnector('csv', file)
    let result: IngestResult
    try {
      result = await connector.ingest(500)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Could not read CSV file' },
        { status: 400 }
      )
    }

    if (result.schema.length === 0) {
      return NextResponse.json({ error: 'CSV has no columns' }, { status: 400 })
    }
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'CSV has headers but no data rows' },
        { status: 400 }
      )
    }

    const { datasetId } = await saveIngestResult({
      result,
      sourceType: connector.sourceType,
      name: nameOverride,
      icon,
      problemStatement,
      users,
      successMetrics: Array.isArray(successMetrics) ? successMetrics : [],
    })

    const response: UploadResponse = {
      success: true,
      datasetId,
      rowCount: result.rowCount,
      columnCount: result.schema.length,
      schema: result.schema,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
