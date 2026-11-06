import { describe, it, expect } from 'vitest'
import { parseCSV, validateCSVFile } from './csvParser'

function csvFile(contents: string, name = 'test.csv', type = 'text/csv') {
  return new File([contents], name, { type })
}

describe('parseCSV', () => {
  it('parses headers and rows', async () => {
    const file = csvFile('a,b,c\n1,2,3\n4,5,6\n')
    const result = await parseCSV(file)
    expect(result.headers).toEqual(['a', 'b', 'c'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ a: '1', b: '2', c: '3' })
    expect(result.metadata).toEqual({ rowCount: 2, columnCount: 3 })
  })

  it('keeps columns aligned when a cell is empty (the bug we fixed)', async () => {
    // Middle value missing — columns must not shift left.
    const file = csvFile('id,revenue,segment\nC1,,Enterprise\n')
    const result = await parseCSV(file)
    expect(result.rows[0]).toEqual({ id: 'C1', revenue: null, segment: 'Enterprise' })
  })

  it('handles quoted values containing commas', async () => {
    const file = csvFile('name,note\n"Doe, John","a, b, c"\n')
    const result = await parseCSV(file)
    expect(result.rows[0]).toEqual({ name: 'Doe, John', note: 'a, b, c' })
  })

  it('ignores blank lines', async () => {
    const file = csvFile('a,b\n1,2\n\n3,4\n')
    const result = await parseCSV(file)
    expect(result.rows).toHaveLength(2)
  })
})

describe('validateCSVFile', () => {
  it('accepts a .csv file', () => {
    expect(validateCSVFile(csvFile('a\n1')).valid).toBe(true)
  })

  it('rejects an empty file', () => {
    expect(validateCSVFile(csvFile('')).valid).toBe(false)
  })

  it('rejects a non-csv file', () => {
    expect(validateCSVFile(csvFile('x', 'notes.txt', 'text/plain')).valid).toBe(false)
  })
})
