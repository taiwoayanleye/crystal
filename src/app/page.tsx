'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LandingDataset {
  qualityScore: number
  rowCount: number
}

const REPOSITORY_URL = 'https://github.com/taiwoayanleye/crystal'

function formatRows(value: number) {
  if (value >= 1000) return `${Math.floor(value / 1000)}K+`
  return value.toLocaleString()
}

export default function HomePage() {
  const [datasets, setDatasets] = useState<LandingDataset[] | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/datasets')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load portfolio stats')
        return response.json()
      })
      .then((items: LandingDataset[]) => {
        if (active) setDatasets(items)
      })
      .catch(() => {
        if (active) setDatasets([])
      })
    return () => {
      active = false
    }
  }, [])

  const dataProductCount = datasets?.length ?? null
  const averageQuality = datasets?.length
    ? Math.round(datasets.reduce((sum, item) => sum + item.qualityScore, 0) / datasets.length)
    : datasets ? 0 : null
  const rowsManaged = datasets
    ? formatRows(datasets.reduce((sum, item) => sum + item.rowCount, 0))
    : null

  const stats = [
    { value: dataProductCount === null ? '—' : String(dataProductCount), label: 'Data products' },
    { value: averageQuality === null ? '—' : `${averageQuality}%`, label: 'Avg. quality estimate' },
    { value: rowsManaged ?? '—', label: 'Rows managed' },
  ]

  return (
    <main className="flex min-h-screen flex-col bg-bg-base text-text-primary">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border-subtle bg-surface px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Crystal homepage">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-heading text-lg text-white" aria-hidden="true">◇</span>
          <span className="font-heading text-xl font-semibold tracking-tight">Crystal</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-4 text-xs text-text-secondary sm:gap-7 sm:text-sm">
          <a href={`${REPOSITORY_URL}#readme`} className="hidden transition-colors hover:text-text-primary sm:inline">Docs</a>
          <a href={REPOSITORY_URL} className="hidden transition-colors hover:text-text-primary sm:inline">GitHub</a>
          <a href={`${REPOSITORY_URL}/commits/main/`} className="hidden transition-colors hover:text-text-primary md:inline">Changelog</a>
          <Link href="/dashboard" className="rounded-md bg-accent px-3.5 py-2 font-medium text-white transition-colors hover:bg-accent-light sm:px-5">
            Open Dashboard
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-20">
        <div className="flex w-full max-w-4xl flex-col items-center gap-6 sm:gap-7">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-text-secondary sm:text-xs">
            DATA-AS-A-PRODUCT PLATFORM
          </p>
          <h1 className="whitespace-pre-line font-heading text-[44px] font-bold leading-[1.02] tracking-[-0.045em] text-text-primary sm:text-6xl lg:text-[72px]">
            {'Treat data like\na product.'}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-text-secondary sm:text-lg sm:leading-7">
            Quality signals. Outcome tracking. Source lineage.
            <br className="hidden sm:block" /> One dashboard for every dataset your team ships.
          </p>

          <div className="mt-1 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light sm:px-7">
              Go to Dashboard <span aria-hidden="true">→</span>
            </Link>
            <a href={`${REPOSITORY_URL}#readme`} className="inline-flex items-center justify-center rounded-lg border border-border-default bg-surface px-6 py-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated sm:px-7">
              View Docs
            </a>
          </div>

          <div aria-label="Portfolio snapshot" className="mt-7 flex w-full max-w-[600px] items-center justify-center divide-x divide-border-default border-t border-border-subtle pt-7 sm:mt-10 sm:pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-1 flex-col items-center gap-1 px-3 sm:px-8">
                <span className="font-mono text-xl font-semibold tabular-nums text-text-primary sm:text-[28px]">
                  {stat.value}
                </span>
                <span className="text-[10px] text-text-secondary sm:text-[13px]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
