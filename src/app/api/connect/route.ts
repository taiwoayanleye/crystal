import { NextRequest, NextResponse } from 'next/server'
import { getConnector } from '@/lib/connectors'
import { PostgresConfig } from '@/lib/connectors/postgres'
import { SnowflakeConfig } from '@/lib/connectors/snowflake'
import { saveIngestResult } from '@/lib/ingestion'

export const dynamic = 'force-dynamic'

/**
 * POST /api/connect
 * Ingest a non-file data source (Phase 2). Supports PostgreSQL and Snowflake.
 * Snapshot-at-connect: reads schema + a sample, computes quality, persists a
 * dataset. Connection credentials are used only for this request, never stored.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceType, problemStatement, users, connection, successMetrics, name, icon } = body

    if (sourceType === 'postgres') {
      const cfg = connection as PostgresConfig
      for (const field of ['host', 'database', 'user', 'password', 'table'] as const) {
        if (!cfg?.[field]) {
          return NextResponse.json({ error: `Missing connection field: ${field}` }, { status: 400 })
        }
      }

      const connector = getConnector('postgres', cfg)
      const result = await connector.ingest(500)
      if (result.schema.length === 0) {
        return NextResponse.json({ error: 'Source has no columns' }, { status: 400 })
      }

      const { datasetId } = await saveIngestResult({
        result,
        sourceType: connector.sourceType,
        name: typeof name === 'string' ? name : undefined,
        icon: typeof icon === 'string' ? icon.trim() || undefined : undefined,
        problemStatement: problemStatement || `PostgreSQL table: ${result.name}`,
        users: users || 'Data team',
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
    } else if (sourceType === 'snowflake') {
      const cfg = connection as SnowflakeConfig
      for (const field of ['accountId', 'user', 'password', 'warehouse', 'database', 'table'] as const) {
        if (!cfg?.[field]) {
          return NextResponse.json({ error: `Missing connection field: ${field}` }, { status: 400 })
        }
      }

      const connector = getConnector('snowflake', cfg)
      const result = await connector.ingest(500)
      if (result.schema.length === 0) {
        return NextResponse.json({ error: 'Source has no columns' }, { status: 400 })
      }

      const { datasetId } = await saveIngestResult({
        result,
        sourceType: connector.sourceType,
        name: typeof name === 'string' ? name : undefined,
        icon: typeof icon === 'string' ? icon.trim() || undefined : undefined,
        problemStatement: problemStatement || `Snowflake table: ${result.name}`,
        users: users || 'Data team',
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
    } else {
      return NextResponse.json(
        { error: `Unsupported source type: ${sourceType}. Supported: postgres, snowflake` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 }
    )
  }
}
