import { saveDataset } from './database'
import { calculateQualityMetrics } from './metrics'
import { IngestResult, SourceType } from './connectors/types'

export async function saveIngestResult(input: {
  result: IngestResult
  sourceType: SourceType
  name?: string
  icon?: string
  problemStatement: string
  users: string
  successMetrics?: string[]
}): Promise<{ datasetId: string }> {
  const { result } = input
  const quality = calculateQualityMetrics(result.rows, result.schema)
  const datasetId = await saveDataset({
    name: input.name?.trim() || result.name,
    icon: input.icon,
    sourceType: input.sourceType,
    lastSyncAt: result.lastSyncAt,
    problemStatement: input.problemStatement,
    users: input.users,
    schema: result.schema,
    metadata: { rowCount: result.rowCount, columnCount: result.schema.length },
    quality,
    rows: result.rows,
    successMetrics: input.successMetrics,
  })
  return { datasetId }
}
