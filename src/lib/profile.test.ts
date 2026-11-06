import { describe, it, expect } from 'vitest'
import { computeProfile } from './profile'

describe('computeProfile', () => {
  const rows = [
    { id: 'C1', charge: '10', churn: 'Yes' },
    { id: 'C2', charge: '20', churn: 'No' },
    { id: 'C3', charge: '30', churn: 'No' },
    { id: 'C4', charge: '', churn: 'No' },
  ]
  const schema = ['id', 'charge', 'churn']

  it('reports the sampled row count', () => {
    expect(computeProfile(rows, schema).sampledRows).toBe(4)
  })

  it('classifies a numeric column with min/max/avg', () => {
    const col = computeProfile(rows, schema).columns.find((c) => c.name === 'charge')!
    expect(col.type).toBe('numeric')
    expect(col.min).toBe(10)
    expect(col.max).toBe(30)
    expect(col.avg).toBe(20) // avg of the 3 filled values
    expect(col.filledPercent).toBe(75) // 3 of 4 filled
  })

  it('classifies a categorical column with top values', () => {
    const col = computeProfile(rows, schema).columns.find((c) => c.name === 'churn')!
    expect(col.type).toBe('categorical')
    expect(col.distinct).toBe(2)
    expect(col.top?.[0]).toEqual({ value: 'No', count: 3 })
  })

  it('treats an id-like column as categorical (all distinct)', () => {
    const col = computeProfile(rows, schema).columns.find((c) => c.name === 'id')!
    expect(col.type).toBe('categorical')
    expect(col.distinct).toBe(4)
  })

  it('handles an entirely empty column', () => {
    const p = computeProfile([{ a: '' }, { a: null }], ['a'])
    expect(p.columns[0].type).toBe('empty')
    expect(p.columns[0].filledPercent).toBe(0)
  })
})
