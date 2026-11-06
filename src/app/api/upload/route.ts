import { NextRequest, NextResponse } from 'next/server'
import { parseCSV, validateCSVFile } from '@/lib/csvParser'
import { saveDataset } from '@/lib/database'
import { calculateQualityMetrics } from '@/lib/metrics'
import { UploadResponse } from '@/lib/types'

/**
 * POST /api/upload
 * Upload a CSV file and create a new dataset
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
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

    const validation = validateCSVFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Parse CSV
    const { headers, rows, metadata } = await parseCSV(file)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV has headers but no data rows' },
        { status: 400 }
      )
    }

    // Calculate quality metrics from the real data
    const quality = calculateQualityMetrics(rows, headers)

    // Save to database
    const datasetId = await saveDataset({
      name: nameOverride || file.name.replace(/\.csv$/i, ''),
      icon,
      problemStatement,
      users,
      schema: headers,
      metadata,
      quality,
      rows,
      successMetrics: Array.isArray(successMetrics) ? successMetrics : [],
    })

    const response: UploadResponse = {
      success: true,
      datasetId,
      rowCount: metadata.rowCount,
      columnCount: metadata.columnCount,
      schema: headers,
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
