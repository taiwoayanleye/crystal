import { CsvConnector } from './csv'
import { PostgresConnector, PostgresConfig } from './postgres'
import { SnowflakeConnector, SnowflakeConfig } from './snowflake'
import { IDataConnector, SourceType } from './types'

export function getConnector(sourceType: 'csv', config: File): IDataConnector
export function getConnector(sourceType: 'postgres', config: PostgresConfig): IDataConnector
export function getConnector(sourceType: 'snowflake', config: SnowflakeConfig): IDataConnector
export function getConnector(
  sourceType: SourceType,
  config: File | PostgresConfig | SnowflakeConfig
): IDataConnector {
  if (sourceType === 'csv') return new CsvConnector(config as File)
  if (sourceType === 'postgres') return new PostgresConnector(config as PostgresConfig)
  if (sourceType === 'snowflake') return new SnowflakeConnector(config as SnowflakeConfig)
  throw new Error(`Unsupported source type: ${sourceType}`)
}
