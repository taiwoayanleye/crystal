import { CsvConnector } from './csv'
import { PostgresConnector, PostgresConfig } from './postgres'
import { IDataConnector, SourceType } from './types'

export function getConnector(sourceType: 'csv', config: File): IDataConnector
export function getConnector(sourceType: 'postgres', config: PostgresConfig): IDataConnector
export function getConnector(
  sourceType: SourceType,
  config: File | PostgresConfig
): IDataConnector {
  if (sourceType === 'csv') return new CsvConnector(config as File)
  if (sourceType === 'postgres') return new PostgresConnector(config as PostgresConfig)
  throw new Error(`Unsupported source type: ${sourceType}`)
}
