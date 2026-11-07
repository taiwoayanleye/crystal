import { NextRequest, NextResponse } from 'next/server'
import { getConnector } from '@/lib/connectors'
import { PostgresConfig } from '@/lib/connectors/postgres'
import { SnowflakeConfig } from '@/lib/connectors/snowflake'
import { BigQueryConfig } from '@/lib/connectors/bigquery'
import { S3Config } from '@/lib/connectors/s3'
import { GCSConfig } from '@/lib/connectors/gcs'
import { saveIngestResult } from '@/lib/ingestion'
import { analyzeDataset } from '@/lib/claude'

export const dynamic = 'force-dynamic'

/**
 * POST /api/connect
 * Ingest a non-file data source (Phase 2). Supports PostgreSQL, Snowflake, BigQuery, S3, and GCS.
 * Snapshot-at-connect: reads schema + a sample, computes quality, persists a
 * dataset. Connection credentials are used only for this request, never stored.
 *
 * Query param: ?analyze=true to generate AI suggestions for name/problem/users/metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceType, problemStatement, users, connection, successMetrics, name, icon } = body
    const analyze = request.nextUrl.searchParams.get('analyze') === 'true'

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

      // Generate AI suggestions if requested
      let aiSuggestions = null
      if (analyze) {
        try {
          const analysis = await analyzeDataset({
            schema: result.schema,
            sampleRows: result.rows,
            problemStatement,
          })
          aiSuggestions = {
            name: analysis.name,
            icon: analysis.icon,
            problemStatement: analysis.problemStatement,
            users: analysis.users,
            metrics: analysis.metrics.map((m: any) => m.name),
          }
        } catch (err) {
          console.warn('AI analysis failed (continuing without):', err)
        }
      }

      const { datasetId } = await saveIngestResult({
        result,
        sourceType: connector.sourceType,
        name: aiSuggestions?.name || (typeof name === 'string' ? name : undefined),
        icon: aiSuggestions?.icon || (typeof icon === 'string' ? icon.trim() || undefined : undefined),
        problemStatement: aiSuggestions?.problemStatement || problemStatement || `PostgreSQL table: ${result.name}`,
        users: aiSuggestions?.users || users || 'Data team',
        successMetrics: aiSuggestions?.metrics || (Array.isArray(successMetrics) ? successMetrics : []),
      })

      return NextResponse.json(
        {
          success: true,
          datasetId,
          rowCount: result.rowCount,
          columnCount: result.schema.length,
          schema: result.schema,
          suggestions: aiSuggestions,
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

      let aiSuggestions = null
      if (analyze) {
        try {
          const analysis = await analyzeDataset({
            schema: result.schema,
            sampleRows: result.rows,
            problemStatement,
          })
          aiSuggestions = {
            name: analysis.name,
            icon: analysis.icon,
            problemStatement: analysis.problemStatement,
            users: analysis.users,
            metrics: analysis.metrics.map((m: any) => m.name),
          }
        } catch (err) {
          console.warn('AI analysis failed (continuing without):', err)
        }
      }

      const { datasetId } = await saveIngestResult({
        result,
        sourceType: connector.sourceType,
        name: aiSuggestions?.name || (typeof name === 'string' ? name : undefined),
        icon: aiSuggestions?.icon || (typeof icon === 'string' ? icon.trim() || undefined : undefined),
        problemStatement: aiSuggestions?.problemStatement || problemStatement || `Snowflake table: ${result.name}`,
        users: aiSuggestions?.users || users || 'Data team',
        successMetrics: aiSuggestions?.metrics || (Array.isArray(successMetrics) ? successMetrics : []),
      })

      return NextResponse.json(
        {
          success: true,
          datasetId,
          rowCount: result.rowCount,
          columnCount: result.schema.length,
          schema: result.schema,
          suggestions: aiSuggestions,
        },
        { status: 201 }
      )
    } else if (sourceType === 'bigquery') {
      const cfg = connection as BigQueryConfig
      for (const field of ['projectId', 'datasetId', 'tableId', 'serviceAccountJson'] as const) {
        if (!cfg?.[field]) {
          return NextResponse.json({ error: `Missing connection field: ${field}` }, { status: 400 })
        }
      }

      const connector = getConnector('bigquery', cfg)
      const result = await connector.ingest(500)
      if (result.schema.length === 0) {
        return NextResponse.json({ error: 'Source has no columns' }, { status: 400 })
      }

      let aiSuggestions = null
      if (analyze) {
        try {
          const analysis = await analyzeDataset({
            schema: result.schema,
            sampleRows: result.rows,
            problemStatement,
          })
          aiSuggestions = {
            name: analysis.name,
            icon: analysis.icon,
            problemStatement: analysis.problemStatement,
            users: analysis.users,
            metrics: analysis.metrics.map((m: any) => m.name),
          }
        } catch (err) {
          console.warn('AI analysis failed (continuing without):', err)
        }
      }

      const { datasetId } = await saveIngestResult({
        result,
        sourceType: connector.sourceType,
        name: aiSuggestions?.name || (typeof name === 'string' ? name : undefined),
        icon: aiSuggestions?.icon || (typeof icon === 'string' ? icon.trim() || undefined : undefined),
        problemStatement: aiSuggestions?.problemStatement || problemStatement || `BigQuery table: ${result.name}`,
        users: aiSuggestions?.users || users || 'Data team',
        successMetrics: aiSuggestions?.metrics || (Array.isArray(successMetrics) ? successMetrics : []),
      })

      return NextResponse.json(
        {
          success: true,
          datasetId,
          rowCount: result.rowCount,
          columnCount: result.schema.length,
          schema: result.schema,
          suggestions: aiSuggestions,
        },
        { status: 201 }
      )
    } else if (sourceType === 's3') {
      const cfg = connection as S3Config
      for (const field of ['bucket', 'key', 'accessKeyId', 'secretAccessKey'] as const) {
        if (!cfg?.[field]) {
          return NextResponse.json({ error: `Missing connection field: ${field}` }, { status: 400 })
        }
      }

      const connector = getConnector('s3', cfg)
      const result = await connector.ingest(500)
      if (result.schema.length === 0) {
        return NextResponse.json({ error: 'Source has no columns' }, { status: 400 })
      }

      let aiSuggestions = null
      if (analyze) {
        try {
          const analysis = await analyzeDataset({
            schema: result.schema,
            sampleRows: result.rows,
            problemStatement,
          })
          aiSuggestions = {
            name: analysis.name,
            icon: analysis.icon,
            problemStatement: analysis.problemStatement,
            users: analysis.users,
            metrics: analysis.metrics.map((m: any) => m.name),
          }
        } catch (err) {
          console.warn('AI analysis failed (continuing without):', err)
        }
      }

      const { datasetId } = await saveIngestResult({
        result,
        sourceType: connector.sourceType,
        name: aiSuggestions?.name || (typeof name === 'string' ? name : undefined),
        icon: aiSuggestions?.icon || (typeof icon === 'string' ? icon.trim() || undefined : undefined),
        problemStatement: aiSuggestions?.problemStatement || problemStatement || `S3 file: ${result.name}`,
        users: aiSuggestions?.users || users || 'Data team',
        successMetrics: aiSuggestions?.metrics || (Array.isArray(successMetrics) ? successMetrics : []),
      })

      return NextResponse.json(
        {
          success: true,
          datasetId,
          rowCount: result.rowCount,
          columnCount: result.schema.length,
          schema: result.schema,
          suggestions: aiSuggestions,
        },
        { status: 201 }
      )
    } else if (sourceType === 'gcs') {
      const cfg = connection as GCSConfig
      for (const field of ['bucket', 'objectName', 'serviceAccountJson'] as const) {
        if (!cfg?.[field]) {
          return NextResponse.json({ error: `Missing connection field: ${field}` }, { status: 400 })
        }
      }

      const connector = getConnector('gcs', cfg)
      const result = await connector.ingest(500)
      if (result.schema.length === 0) {
        return NextResponse.json({ error: 'Source has no columns' }, { status: 400 })
      }

      let aiSuggestions = null
      if (analyze) {
        try {
          const analysis = await analyzeDataset({
            schema: result.schema,
            sampleRows: result.rows,
            problemStatement,
          })
          aiSuggestions = {
            name: analysis.name,
            icon: analysis.icon,
            problemStatement: analysis.problemStatement,
            users: analysis.users,
            metrics: analysis.metrics.map((m: any) => m.name),
          }
        } catch (err) {
          console.warn('AI analysis failed (continuing without):', err)
        }
      }

      const { datasetId } = await saveIngestResult({
        result,
        sourceType: connector.sourceType,
        name: aiSuggestions?.name || (typeof name === 'string' ? name : undefined),
        icon: aiSuggestions?.icon || (typeof icon === 'string' ? icon.trim() || undefined : undefined),
        problemStatement: aiSuggestions?.problemStatement || problemStatement || `GCS file: ${result.name}`,
        users: aiSuggestions?.users || users || 'Data team',
        successMetrics: aiSuggestions?.metrics || (Array.isArray(successMetrics) ? successMetrics : []),
      })

      return NextResponse.json(
        {
          success: true,
          datasetId,
          rowCount: result.rowCount,
          columnCount: result.schema.length,
          schema: result.schema,
          suggestions: aiSuggestions,
        },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { error: `Unsupported source type: ${sourceType}. Supported: postgres, snowflake, bigquery, s3, gcs` },
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
