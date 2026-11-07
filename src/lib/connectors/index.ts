import { CsvConnector } from './csv'
import { PostgresConnector, PostgresConfig } from './postgres'
import { SnowflakeConnector, SnowflakeConfig } from './snowflake'
import { BigQueryConnector, BigQueryConfig } from './bigquery'
import { IDataConnector, SourceType } from './types'

export function getConnector(sourceType: 'csv', config: File): IDataConnector
export function getConnector(sourceType: 'postgres', config: PostgresConfig): IDataConnector
export function getConnector(sourceType: 'snowflake', config: SnowflakeConfig): IDataConnector
export function getConnector(sourceType: 'bigquery', config: BigQueryConfig): IDataConnector
export function getConnector(
  sourceType: SourceType,
  config: File | PostgresConfig | SnowflakeConfig | BigQueryConfig
): IDataConnector {
  if (sourceType === 'csv') return new CsvConnector(config as File)
  if (sourceType === 'postgres') return new PostgresConnector(config as PostgresConfig)
  if (sourceType === 'snowflake') return new SnowflakeConnector(config as SnowflakeConfig)
  if (sourceType === 'bigquery') return new BigQueryConnector(config as BigQueryConfig)
  throw new Error(`Unsupported source type: ${sourceType}`)
}
