import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

/**
 * Lazy Neon Postgres client.
 *
 * `neon()` throws if DATABASE_URL is missing, and Next.js evaluates module
 * top-level code at build time — so we initialise on first use, never at
 * import, to keep `next build` safe before env vars are wired.
 */
let _sql: NeonQueryFunction<false, false> | null = null

export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    // Next.js patches global fetch and caches it; the Neon HTTP driver uses
    // fetch, so without no-store, reads return stale data after writes.
    _sql = neon(url, { fetchOptions: { cache: 'no-store' } })
  }
  return _sql
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL)
}
