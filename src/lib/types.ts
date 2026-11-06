// Data types used throughout the application

export type FreshnessStatus = 'fresh' | 'stale' | 'error'

export interface QualityMetrics {
  freshness: number // 0-100
  completeness: number // 0-100
  accuracy: number // 0-100
}

export interface OutcomeMetrics {
  hypothesis: string
  status: string // e.g. "Testing (Week 1 of 4)"
  businessImpact: string
  outcomeScore: number // 0-100
}

export interface Dataset {
  id: string
  name: string
  icon: string
  sourceType: 'csv' | 'postgres'
  problemStatement: string
  users: string
  schema: string[]
  metadata: {
    rowCount: number
    columnCount: number
  }
  quality: QualityMetrics
  outcome: OutcomeMetrics
  successMetrics: string[]
  createdAt: string
  updatedAt: string
}

export interface DatasetMetrics {
  id: string
  datasetId: string
  qualityScore: number // 0-100
  usageCount: number
  outcomeScore: number // 0-100
  updatedAt: string
}

export interface CSVParseResult {
  headers: string[]
  rows: Record<string, any>[]
  metadata: {
    rowCount: number
    columnCount: number
  }
}

export interface UploadResponse {
  success: boolean
  datasetId: string
  rowCount: number
  columnCount: number
  schema: string[]
}

export interface DatasetWithMetrics extends Dataset {
  metrics: DatasetMetrics
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
