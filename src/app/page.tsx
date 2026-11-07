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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-24">
        <div className="flex w-full max-w-4xl flex-col items-center gap-6 sm:gap-8">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-text-secondary sm:text-xs">
            DATA-AS-A-PRODUCT PLATFORM
          </p>
          <h1 className="whitespace-pre-line font-heading text-[44px] font-bold leading-[1.02] tracking-[-0.045em] text-text-primary sm:text-6xl lg:text-[72px]">
            {'Turn raw data\ninto products.'}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-lg sm:leading-7">
            Connect any data source. Autofill with AI. Schedule refreshes. Track quality & outcomes.
            <br className="hidden sm:block" /> One platform for teams that ship data.
          </p>

          <div className="mt-2 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light sm:px-7">
              Go to Dashboard <span aria-hidden="true">→</span>
            </Link>
            <a href={`${REPOSITORY_URL}#readme`} className="inline-flex items-center justify-center rounded-lg border border-border-default bg-surface px-6 py-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated sm:px-7">
              View Docs
            </a>
          </div>

          <div aria-label="Portfolio snapshot" className="mt-8 flex w-full max-w-[600px] items-center justify-center divide-x divide-border-default border-t border-border-subtle pt-8 sm:mt-12 sm:pt-10">
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

      {/* Data Sources Section */}
      <section className="border-t border-border-subtle bg-surface px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-12 sm:mb-16">
            <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-text-secondary sm:text-xs">
              CONNECT ANYWHERE
            </p>
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Your data, your platform
            </h2>
            <p className="max-w-xl text-sm text-text-secondary text-center sm:text-base">
              Connect 5+ enterprise data sources. AI infers names, problem statements, and success metrics. Scheduled refreshes keep everything current.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 mb-12">
            {[
              {
                label: 'PostgreSQL',
                desc: 'Relational',
                logo: (
                  <svg viewBox="0 0 100 100" className="w-8 h-8" fill="currentColor">
                    <circle cx="50" cy="50" r="48" fill="#336791" opacity="0.1" />
                    <g fill="#336791">
                      <ellipse cx="50" cy="35" rx="12" ry="15" />
                      <path d="M50 20 Q62 25 62 40 Q62 55 50 60 Q38 55 38 40 Q38 25 50 20 M45 40 Q45 45 50 45 Q55 45 55 40 Q55 35 50 35 Q45 35 45 40" />
                      <circle cx="30" cy="60" r="6" />
                      <circle cx="70" cy="60" r="6" />
                    </g>
                  </svg>
                ),
              },
              {
                label: 'Snowflake',
                desc: 'Warehouse',
                logo: (
                  <svg viewBox="0 0 100 100" className="w-8 h-8" fill="currentColor">
                    <circle cx="50" cy="50" r="48" fill="#29b5e8" opacity="0.1" />
                    <path d="M50 10 L65 35 L60 35 L75 50 L60 50 L65 65 L50 90 L35 65 L40 65 L25 50 L40 50 L35 35 L50 10" fill="#29b5e8" strokeWidth="1" stroke="#29b5e8" />
                  </svg>
                ),
              },
              {
                label: 'BigQuery',
                desc: 'Google Cloud',
                logo: (
                  <svg viewBox="0 0 100 100" className="w-8 h-8" fill="currentColor">
                    <circle cx="50" cy="50" r="48" fill="#1f73e8" opacity="0.1" />
                    <rect x="35" y="30" width="30" height="40" fill="#1f73e8" rx="4" />
                    <circle cx="42" cy="42" r="3" fill="white" />
                    <circle cx="58" cy="42" r="3" fill="white" />
                    <circle cx="42" cy="58" r="3" fill="white" />
                    <circle cx="58" cy="58" r="3" fill="white" />
                  </svg>
                ),
              },
              {
                label: 'S3',
                desc: 'AWS Storage',
                logo: (
                  <svg viewBox="0 0 100 100" className="w-8 h-8" fill="currentColor">
                    <circle cx="50" cy="50" r="48" fill="#ff9900" opacity="0.1" />
                    <path d="M30 65 L50 30 L70 65 Z" fill="#ff9900" />
                    <rect x="35" y="65" width="30" height="20" fill="#ff9900" rx="2" />
                  </svg>
                ),
              },
              {
                label: 'GCS',
                desc: 'Cloud Storage',
                logo: (
                  <svg viewBox="0 0 100 100" className="w-8 h-8" fill="currentColor">
                    <circle cx="50" cy="50" r="48" fill="#ea4335" opacity="0.1" />
                    <path d="M50 25 L65 35 L65 60 Q65 70 50 75 Q35 70 35 60 L35 35 Z" fill="#4285f4" />
                    <path d="M35 35 L50 25 L50 50 L35 60 Z" fill="#34a853" />
                    <path d="M65 35 L50 25 L50 50 L65 60 Z" fill="#fbbc04" />
                  </svg>
                ),
              },
            ].map(({ label, desc, logo }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-bg-base border border-border-subtle hover:border-border-default transition-colors">
                <div className="text-2xl">{logo}</div>
                <span className="font-medium text-xs sm:text-sm text-center text-text-primary">{label}</span>
                <span className="text-[10px] text-text-secondary text-center">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {[
              {
                icon: '⟡',
                title: 'Connect Anywhere',
                description: 'Ingest from CSV, PostgreSQL, Snowflake, BigQuery, S3, or GCS. One unified interface for all enterprise data sources.',
              },
              {
                icon: '◆',
                title: 'AI Autofill',
                description: 'Claude analyzes your data and auto-generates dataset names, problem statements, and success metrics in seconds.',
              },
              {
                icon: '⟡',
                title: 'Keep Data Fresh',
                description: 'Set daily refresh schedules. Automatic syncs with full history, error tracking, and manual refresh on demand.',
              },
              {
                icon: '◆',
                title: 'Measure Business Impact',
                description: 'Track the outcome hypothesis for each dataset. Document what problem it solves and measure the business results.',
              },
            ].map(({ icon, title, description }) => (
              <div key={title} className="flex flex-col gap-3 p-5 rounded-lg border border-border-subtle bg-bg-base hover:border-border-default transition-colors">
                <div className="text-xl font-semibold text-accent">{icon}</div>
                <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-6">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border-subtle bg-surface px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl mb-4">
            Ready to ship data products?
          </h2>
          <p className="text-text-secondary mb-8">
            Start with CSV. Scale to enterprise data warehouses. Crystal grows with your data maturity.
          </p>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-light">
            Open Dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
