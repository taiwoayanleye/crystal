/**
 * Synthetic trend generation for realistic demo usage patterns.
 * Creates S-curve adoption and time-based query trends without external dependencies.
 */

interface TrendPoint {
  date: string
  count: number
}

/**
 * Generate an S-curve adoption pattern (0% → 100% over time).
 * Models typical SaaS adoption: slow start, rapid growth, plateau.
 */
function sCurveAdoption(days: number, startDay = 0, maxAdoption = 100): number[] {
  const curve = []
  const inflectionPoint = Math.max(5, Math.floor(days * 0.4))
  const steepness = 0.15

  for (let i = 0; i < days; i++) {
    const x = (i - inflectionPoint) * steepness
    const sigmoid = 1 / (1 + Math.exp(-x))
    curve.push(Math.round(sigmoid * maxAdoption))
  }
  return curve
}

/**
 * Add realistic daily variance to a trend (±20% fluctuation).
 */
function addVariance(values: number[], seed: number): number[] {
  return values.map((v, i) => {
    const hash = Math.sin(seed + i * 12.9898) * 43758.5453
    const noise = (hash - Math.floor(hash)) * 0.4 - 0.2
    return Math.max(0, Math.round(v * (1 + noise)))
  })
}

/**
 * Generate trend data for a dataset based on its creation date.
 * Creates realistic query volume with adoption curve + seasonal variation.
 */
export function generateTrendData(createdAt: string, days = 90): TrendPoint[] {
  const created = new Date(createdAt)
  const now = new Date()
  const elapsedMs = now.getTime() - created.getTime()
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24))
  const dataPoints = Math.min(elapsedDays + 1, days)

  // Seed from dataset creation time for determinism
  const seed = created.getTime() % 1000

  // Base adoption S-curve (0-150 queries/day)
  const adoption = sCurveAdoption(dataPoints, Math.floor(dataPoints * 0.2), 150)

  // Add variance + seasonal pattern (higher midweek)
  const variance = addVariance(adoption, seed)
  const withSeason = variance.map((v, i) => {
    const dayOfWeek = (i + created.getDay()) % 7
    const seasonalFactor = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.15 : 0.85
    return Math.round(v * seasonalFactor)
  })

  // Generate date range
  const result: TrendPoint[] = []
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(created)
    date.setDate(date.getDate() + i)
    result.push({
      date: date.toISOString().split('T')[0],
      count: Math.max(1, withSeason[i]),
    })
  }

  return result
}

/**
 * Calculate realistic user count based on adoption and queries.
 * Assumes average user makes 5-20 queries per session.
 */
export function estimateUsers(queriesPerDay: number, seed: number): number {
  const avgQueriesPerUser = 8 + (((seed * 7) % 100) / 100) * 12
  return Math.max(1, Math.round(queriesPerDay / avgQueriesPerUser))
}

/**
 * Calculate adoption percentage (0-100) based on creation date.
 */
export function adoptionPercent(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  const elapsedDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

  // Reaches 80% adoption at 60 days, 95% at 120 days
  const normalized = Math.min(elapsedDays / 60, 2)
  const sigmoid = 1 / (1 + Math.exp(-(normalized * 3 - 1.5)))

  return Math.round(sigmoid * 100)
}
