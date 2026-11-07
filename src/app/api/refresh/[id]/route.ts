import { NextRequest, NextResponse } from 'next/server'
import { getDataset } from '@/lib/database'
import { logSync, updateDatasetFromIngest } from '@/lib/database'
import { getConnector } from '@/lib/connectors'
import { calculateQualityMetrics } from '@/lib/metrics'
import { PostgresConfig } from '@/lib/connectors/postgres'
import { SnowflakeConfig } from '@/lib/connectors/snowflake'
import { BigQueryConfig } from '@/lib/connectors/bigquery'
import { S3Config } from '@/lib/connectors/s3'
import { GCSConfig } from '@/lib/connectors/gcs'

export const dynamic = 'force-dynamic'

type ConnectorConfig = PostgresConfig | SnowflakeConfig | BigQueryConfig | S3Config | GCSConfig

/**
 * POST /api/refresh/[id]
 * Manually trigger a dataset refresh. Re-ingests data and updates metrics.
 * Requires the original connector configuration in the request body.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { sourceType, connection } = body

    const dataset = await getDataset(id)
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // Validate source type matches
    if (sourceType !== dataset.sourceType) {
      return NextResponse.json(
        { error: `Source type mismatch: expected ${dataset.sourceType}, got ${sourceType}` },
        { status: 400 }
      )
    }

    // Re-ingest data
    let connector: any
    if (sourceType === 'postgres') {
      connector = getConnector('postgres', connection as PostgresConfig)
    } else if (sourceType === 'snowflake') {
      connector = getConnector('snowflake', connection as SnowflakeConfig)
    } else if (sourceType === 'bigquery') {
      connector = getConnector('bigquery', connection as BigQueryConfig)
    } else if (sourceType === 's3') {
      connector = getConnector('s3', connection as S3Config)
    } else if (sourceType === 'gcs') {
      connector = getConnector('gcs', connection as GCSConfig)
    } else {
      return NextResponse.json({ error: 'Unsupported source type' }, { status: 400 })
    }

    const result = await connector.ingest(500)

    if (result.schema.length === 0) {
      await logSync({
        datasetId: id,
        status: 'error',
        rowsSynced: 0,
        errorMessage: 'Source has no columns',
      })
      return NextResponse.json({ error: 'Source has no columns' }, { status: 400 })
    }

    // Calculate metrics
    const quality = calculateQualityMetrics(result.schema, result.rows, result.lastSyncAt)

    // Update dataset
    await updateDatasetFromIngest({
      id,
      result: {
        schema: result.schema,
        rows: result.rows,
        rowCount: result.rowCount,
      },
      quality,
    })

    // Log successful sync
    await logSync({
      datasetId: id,
      status: 'success',
      rowsSynced: result.rowCount,
    })

    return NextResponse.json({
      success: true,
      datasetId: id,
      rowCount: result.rowCount,
      columnCount: result.schema.length,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    const datasetId = params.id
    await logSync({
      datasetId,
      status: 'error',
      rowsSynced: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }).catch(() => {}) // Ignore logging errors

    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Refresh failed' },
      { status: 500 }
    )
  }
}
