import { QualityMetrics } from './types'

/**
 * Deterministic pseudo-random generator seeded from a string.
 * Ensures a given dataset always produces the same "sample" usage/trend
 * numbers, so the dashboard and detail view stay consistent across reloads.
 */
function seedFromString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Calculate quality metrics for a dataset
 * Quality = average of freshness, completeness, accuracy
 */
export function calculateQualityMetrics(
  data: Record<string, any>[],
  schema: string[]
): QualityMetrics {
  if (data.length === 0) {
    return { freshness: 0, completeness: 0, accuracy: 0 }
  }

  // Freshness: fresh on upload
  const freshness = 95
  const completeness = calculateCompleteness(data, schema)
  const accuracy = calculateAccuracy(data, schema)

  return {
    freshness: Math.round(freshness),
    completeness: Math.round(completeness),
    accuracy: Math.round(accuracy),
  }
}

/**
 * Calculate completeness: % of non-null, non-empty values
 */
function calculateCompleteness(data: Record<string, any>[], schema: string[]): number {
  const totalCells = data.length * schema.length
  if (totalCells === 0) return 0
  let filledCells = 0

  data.forEach((row) => {
    schema.forEach((col) => {
      const value = row[col]
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        filledCells++
      }
    })
  })

  return (filledCells / totalCells) * 100
}

/**
 * Calculate accuracy: estimate from data consistency
 */
function calculateAccuracy(data: Record<string, any>[], schema: string[]): number {
  if (data.length < 2) return 100

  let totalChecks = 0
  let passedChecks = 0

  schema.forEach((col) => {
    const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined && v !== '')
    if (values.length === 0) return

    // Type consistency
    const uniqueTypes = new Set(values.map((v) => typeof v))
    totalChecks++
    if (uniqueTypes.size <= 2) passedChecks++

    // Outlier check
    const numericValues = values
      .map((v) => {
        const num = parseFloat(String(v))
        return isNaN(num) ? null : num
      })
      .filter((v): v is number => v !== null)

    if (numericValues.length > 2) {
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
      const stdDev = Math.sqrt(
        numericValues.reduce((sq, n) => sq + (n - mean) * (n - mean), 0) / numericValues.length
      )
      const withoutOutliers =
        stdDev === 0
          ? numericValues
          : numericValues.filter((v) => Math.abs(v - mean) <= 5 * stdDev)
      totalChecks++
      if (withoutOutliers.length >= numericValues.length * 0.95) passedChecks++
    }
  })

  return totalChecks === 0 ? 100 : (passedChecks / totalChecks) * 100
}

/**
 * Calculate overall quality score (0-100)
 */
export function calculateOverallQuality(metrics: QualityMetrics): number {
  return Math.round((metrics.freshness + metrics.completeness + metrics.accuracy) / 3)
}

export interface UsageMetrics {
  queriesPerDay: number
  uniqueUsers: number
  adoptionPercent: number
}

/**
 * Deterministic usage metrics derived from the dataset id + live usage count.
 * Live chat queries nudge the numbers up so the dashboard feels responsive.
 */
export function getUsageMetrics(datasetId: string, usageCount = 0): UsageMetrics {
  const rand = mulberry32(seedFromString(datasetId))
  return {
    queriesPerDay: Math.floor(rand() * 20) + 5 + usageCount,
    uniqueUsers: Math.floor(rand() * 8) + 2,
    adoptionPercent: Math.floor(rand() * 40) + 25,
  }
}

/**
 * Deterministic 30-day trend seeded from the dataset id.
 */
export function getTrendData(datasetId: string) {
  const rand = mulberry32(seedFromString(datasetId + ':trend'))
  const data: Array<{ date: string; count: number }> = []
  const today = new Date()
  let base = Math.floor(rand() * 8) + 6

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    // gentle upward drift with noise, so it reads like real adoption growth
    base = Math.max(2, base + Math.round((rand() - 0.4) * 4))
    data.push({
      date: date.toISOString().split('T')[0],
      count: base,
    })
  }

  return data
}
