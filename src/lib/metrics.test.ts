import { describe, it, expect } from 'vitest'
import {
  calculateQualityMetrics,
  calculateOverallQuality,
  getUsageMetrics,
  getTrendData,
} from './metrics'

describe('calculateQualityMetrics', () => {
  const schema = ['id', 'revenue', 'segment']

  it('reports 100% completeness when no values are missing', () => {
    const data = [
      { id: 'C1', revenue: '100', segment: 'Ent' },
      { id: 'C2', revenue: '200', segment: 'SMB' },
    ]
    expect(calculateQualityMetrics(data, schema).completeness).toBe(100)
  })

  it('reflects missing values in completeness', () => {
    // 1 empty cell out of 6 → ~83%
    const data = [
      { id: 'C1', revenue: null, segment: 'Ent' },
      { id: 'C2', revenue: '200', segment: 'SMB' },
    ]
    expect(calculateQualityMetrics(data, schema).completeness).toBe(83)
  })

  it('returns zeroes for empty data', () => {
    expect(calculateQualityMetrics([], schema)).toEqual({
      freshness: 0,
      completeness: 0,
      accuracy: 0,
    })
  })
})

describe('calculateOverallQuality', () => {
  it('averages the three sub-scores', () => {
    expect(
      calculateOverallQuality({ freshness: 90, completeness: 90, accuracy: 60 })
    ).toBe(80)
  })
})

describe('getUsageMetrics', () => {
  it('is deterministic for the same dataset id', () => {
    expect(getUsageMetrics('dataset_abc')).toEqual(getUsageMetrics('dataset_abc'))
  })

  it('differs across dataset ids', () => {
    const a = getUsageMetrics('dataset_a')
    const b = getUsageMetrics('dataset_b')
    expect(a).not.toEqual(b)
  })

  it('adds live usage count to queries/day', () => {
    const base = getUsageMetrics('dataset_x', 0).queriesPerDay
    expect(getUsageMetrics('dataset_x', 5).queriesPerDay).toBe(base + 5)
  })
})

describe('getTrendData', () => {
  it('returns 30 days, deterministic per id', () => {
    const t = getTrendData('dataset_x')
    expect(t).toHaveLength(30)
    expect(t).toEqual(getTrendData('dataset_x'))
    expect(t[0]).toHaveProperty('date')
    expect(t[0]).toHaveProperty('count')
  })
})
