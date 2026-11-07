import { CsvConnector } from './csv'
import { PostgresConnector, PostgresConfig } from './postgres'
import { SnowflakeConnector, SnowflakeConfig } from './snowflake'
import { BigQueryConnector, BigQueryConfig } from './bigquery'
import { S3Connector, S3Config } from './s3'
import { GCSConnector, GCSConfig } from './gcs'
import { IDataConnector, SourceType } from './types'

export function getConnector(sourceType: 'csv', config: File): IDataConnector
export function getConnector(sourceType: 'postgres', config: PostgresConfig): IDataConnector
export function getConnector(sourceType: 'snowflake', config: SnowflakeConfig): IDataConnector
export function getConnector(sourceType: 'bigquery', config: BigQueryConfig): IDataConnector
export function getConnector(sourceType: 's3', config: S3Config): IDataConnector
export function getConnector(sourceType: 'gcs', config: GCSConfig): IDataConnector
export function getConnector(
  sourceType: SourceType,
  config: File | PostgresConfig | SnowflakeConfig | BigQueryConfig | S3Config | GCSConfig
): IDataConnector {
  if (sourceType === 'csv') return new CsvConnector(config as File)
  if (sourceType === 'postgres') return new PostgresConnector(config as PostgresConfig)
  if (sourceType === 'snowflake') return new SnowflakeConnector(config as SnowflakeConfig)
  if (sourceType === 'bigquery') return new BigQueryConnector(config as BigQueryConfig)
  if (sourceType === 's3') return new S3Connector(config as S3Config)
  if (sourceType === 'gcs') return new GCSConnector(config as GCSConfig)
  throw new Error(`Unsupported source type: ${sourceType}`)
}
