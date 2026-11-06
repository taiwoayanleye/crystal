/**
 * Column profiling computed from a dataset's real (sampled) rows.
 *
 * This is the "make sense of my data" layer: unlike the illustrative usage
 * and trend numbers, everything here is derived from the actual uploaded /
 * connected data.
 */

export interface ColumnProfile {
  name: string
  type: 'numeric' | 'categorical' | 'empty'
  filledPercent: number // 0-100
  distinct: number
  // numeric
  min?: number
  max?: number
  avg?: number
  // categorical
  top?: Array<{ value: string; count: number }>
}

export interface DataProfile {
  sampledRows: number
  columns: ColumnProfile[]
}

function isFilled(v: any): boolean {
  return v !== null && v !== undefined && String(v).trim() !== ''
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

export function computeProfile(rows: Record<string, any>[], schema: string[]): DataProfile {
  const total = rows.length
  const columns = schema.map<ColumnProfile>((col) => {
    const values = rows.map((r) => r[col])
    const filled = values.filter(isFilled)
    const filledPercent = total === 0 ? 0 : Math.round((filled.length / total) * 100)
    const distinct = new Set(filled.map((v) => String(v))).size

    if (filled.length === 0) {
      return { name: col, type: 'empty', filledPercent: 0, distinct: 0 }
    }

    // Numeric only if the WHOLE value is a number — not a parseable prefix.
    // (parseFloat("7590-VHVEG") === 7590 would wrongly flag IDs as numeric;
    // Number("7590-VHVEG") === NaN does not.)
    const nums = filled
      .map((v) => {
        if (typeof v === 'number') return v
        const s = String(v).trim()
        if (s === '') return NaN
        const n = Number(s)
        return Number.isFinite(n) ? n : NaN
      })
      .filter((n) => Number.isFinite(n))
    const numericRatio = nums.length / filled.length

    if (numericRatio >= 0.8 && nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0)
      return {
        name: col,
        type: 'numeric',
        filledPercent,
        distinct,
        min: round(Math.min(...nums)),
        max: round(Math.max(...nums)),
        avg: round(sum / nums.length),
      }
    }

    // Categorical: top values by frequency.
    const counts = new Map<string, number>()
    for (const v of filled) {
      const key = String(v)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([value, count]) => ({ value, count }))

    return { name: col, type: 'categorical', filledPercent, distinct, top }
  })

  return { sampledRows: total, columns }
}
