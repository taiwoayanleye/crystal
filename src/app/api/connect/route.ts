import { NextRequest, NextResponse } from 'next/server'
import { saveDataset } from '@/lib/database'
import { calculateQualityMetrics } from '@/lib/metrics'
import { PostgresConnector, PostgresConfig } from '@/lib/connectors/postgres'
import { IDataConnector } from '@/lib/connectors/types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/connect
 * Ingest a non-file data source (Phase 2). Currently supports PostgreSQL.
 * Snapshot-at-connect: reads schema + a sample, computes quality, persists a
 * dataset. Connection credentials are used only for this request, never stored.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceType, problemStatement, users, connection, successMetrics } = body

    if (sourceType !== 'postgres') {
      return NextResponse.json(
        { error: `Unsupported source type: ${sourceType}` },
        { status: 400 }
      )
    }

    const cfg = connection as PostgresConfig
    for (const field of ['host', 'database', 'user', 'password', 'table'] as const) {
      if (!cfg?.[field]) {
        return NextResponse.json({ error: `Missing connection field: ${field}` }, { status: 400 })
      }
    }

    const connector: IDataConnector = new PostgresConnector(cfg)

    // Pull schema + sample + total count.
    const result = await connector.ingest(500)
    if (result.schema.length === 0) {
      return NextResponse.json({ error: 'Source has no columns' }, { status: 400 })
    }

    const quality = calculateQualityMetrics(result.rows, result.schema)

    const datasetId = await saveDataset({
      name: result.name,
      sourceType: 'postgres',
      problemStatement: problemStatement || `PostgreSQL table: ${result.name}`,
      users: users || 'Data team',
      schema: result.schema,
      metadata: { rowCount: result.rowCount, columnCount: result.schema.length },
      quality,
      rows: result.rows,
      successMetrics: Array.isArray(successMetrics) ? successMetrics : [],
    })

    return NextResponse.json(
      {
        success: true,
        datasetId,
        rowCount: result.rowCount,
        columnCount: result.schema.length,
        schema: result.schema,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 }
    )
  }
}
