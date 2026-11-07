'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { ChatPanel } from '@/components/ChatPanel'
import { MetricCard } from '@/components/MetricCard'
import { UploadModal, type UploadSubmit } from '@/components/UploadModal'
import { Button } from '@/components/Button'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Dataset {
  id: string
  icon: string
  title: string
  qualityScore: number
  usageScore: number
  outcomeScore: number
  hypothesis: string
  status: string
  sourceType: 'csv' | 'postgres' | 'snowflake' | 'bigquery' | 's3' | 'gcs'
  syncStatus: 'fresh' | 'stale' | 'syncing' | 'error'
  syncSchedule: string | null
  rowCount: number
  lastSyncAt: string
}

function PortfolioSummary({ datasets }: { datasets: Dataset[] }) {
  if (datasets.length === 0) return null

  const average = (values: number[]) =>
    Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  const averageQuality = average(datasets.map((dataset) => dataset.qualityScore))
  const trackedOutcomes = datasets.filter((dataset) => dataset.status !== 'Not started').length
  const needsAttention = datasets.filter(
    (dataset) => dataset.qualityScore < 70 || (dataset.status !== 'Not started' && dataset.outcomeScore < 30)
  ).length

  const items = [
    { label: 'Data products', value: String(datasets.length), icon: '▤', tone: 'primary' },
    { label: 'Avg. quality', value: `${averageQuality}%`, icon: '✓', tone: 'success' },
    {
      label: 'Outcomes tracked',
      value: `${trackedOutcomes}/${datasets.length}`,
      icon: '↗',
      tone: 'navy',
      hint: 'Products with an outcome status beyond Not started',
    },
    {
      label: 'Needs review',
      value: String(needsAttention),
      icon: '!',
      tone: needsAttention ? 'warning' : 'success',
      hint: 'Quality below 70% or a tracked outcome score below 30',
    },
    {
      label: 'Sources',
      value: (() => {
        const counts: Record<string, number> = {}
        for (const d of datasets) {
          const label = d.sourceType === 'postgres' ? 'PG' : d.sourceType.toUpperCase()
          counts[label] = (counts[label] || 0) + 1
        }
        return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(' · ')
      })(),
      icon: '↔',
      tone: 'navy',
    },
  ] as const

  const toneClasses = {
    success: 'bg-success-dim text-data-green',
    primary: 'bg-bg-elevated text-text-primary',
    navy: 'bg-bg-elevated text-text-primary',
    warning: 'bg-warning-dim text-data-amber',
  }

  return (
    <section
      aria-label="Portfolio summary"
      className="mb-7 grid grid-cols-2 overflow-hidden rounded-xl border border-border-subtle bg-surface sm:grid-cols-3 xl:grid-cols-5"
    >
      {items.map((item) => (
        <div
          key={item.label}
          title={'hint' in item ? item.hint : undefined}
          className="min-w-0 flex items-center gap-3 border-b border-border-subtle px-4 py-3.5 last:border-b-0 sm:px-5 xl:border-b-0 xl:border-r xl:last:border-r-0"
        >
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${toneClasses[item.tone]}`}
          >
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-5 tracking-tight text-text-primary tabular-nums">{item.value}</p>
            <p className="truncate text-[10px] leading-4 text-text-tertiary">{item.label}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [chatDatasetId, setChatDatasetId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDatasets()
    if (new URLSearchParams(window.location.search).get('add') === '1') {
      setIsUploadModalOpen(true)
      window.history.replaceState(null, '', '/dashboard')
    }
  }, [])

  const filteredDatasets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return datasets
    return datasets.filter((dataset) =>
      [dataset.title, dataset.hypothesis, dataset.sourceType]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [datasets, searchQuery])

  const fetchDatasets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/datasets')
      if (!response.ok) throw new Error('Failed to fetch datasets')
      const data = await response.json()
      setDatasets(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load datasets')
      setDatasets([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddDataset = async (form: UploadSubmit) => {
    let response: Response

    if (form.sourceType === 'csv') {
      const data = new FormData()
      if (form.file) data.append('file', form.file)
      data.append('name', form.name)
      data.append('icon', form.icon)
      data.append('problemStatement', form.problemStatement)
      data.append('users', form.users)
      data.append('successMetrics', JSON.stringify(form.successMetrics))
      response = await fetch('/api/upload', { method: 'POST', body: data })
    } else {
      const connection = form.sourceType === 'postgres'
        ? { ...form.connection, port: Number(form.connection.port) || 5432 }
        : form.connection
      response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: form.sourceType,
          name: form.name,
          icon: form.icon,
          problemStatement: form.problemStatement,
          users: form.users,
          successMetrics: form.successMetrics,
          connection,
        }),
      })
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to create dataset')
    }

    const result = await response.json()
    setIsUploadModalOpen(false)
    await fetchDatasets()
    // Take the user straight to the dataset they just created.
    if (result.datasetId) router.push(`/detail/${result.datasetId}`)
  }

  const chatDataset = datasets.find((d) => d.id === chatDatasetId)

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
        <Sidebar
          datasets={datasets.map((d) => ({ id: d.id, name: d.title, icon: d.icon }))}
          onAddDataset={() => setIsUploadModalOpen(true)}
          onSelectDataset={(id) => router.push(`/detail/${id}`)}
          onAskDataset={(id) => setChatDatasetId(id)}
          onDashboard={() => router.push('/dashboard')}
          onDataProducts={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          onLineage={() => datasets[0] && router.push(`/detail/${datasets[0].id}#data-flow`)}
          activeDatasetId={chatDatasetId}
          activeSection="dashboard"
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="mb-4 flex items-center justify-between md:hidden">
                  <a href="/" className="flex items-center gap-2 font-heading text-base font-semibold text-text-primary">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white" aria-hidden="true">◇</span>
                    Crystal
                  </a>
                  <button onClick={() => setIsUploadModalOpen(true)} aria-label="Add data product" className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white">+</button>
                </div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-text-primary sm:text-[26px]">Data Products</h1>
                <p className="mt-1.5 max-w-xl text-[13px] text-text-secondary">
                  Quality signals, outcomes, and source coverage across your portfolio.
                </p>
              </div>
              <div className="flex items-center gap-3 xl:pt-1">
                <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 text-text-tertiary focus-within:border-border-default focus-within:ring-2 focus-within:ring-accent/10 xl:w-64">
                  <span aria-hidden="true" className="text-base">⌕</span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search data products"
                    aria-label="Search data products"
                    className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-tertiary"
                  />
                </label>
                <ThemeToggle />
                <span title="Signed in as Taiwo Ayanleye" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">T</span>
              </div>
            </div>

            {error && (
              <div role="alert" className="mb-5 rounded-lg border border-error/30 bg-error/10 p-3">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-text-light">Loading datasets...</p>
                </div>
              </div>
            )}

            {!loading && datasets.length > 0 && <PortfolioSummary datasets={datasets} />}

            {!loading && datasets.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="mb-2 font-heading text-lg font-semibold text-text-primary">
                    No data products yet
                  </p>
                  <p className="mb-5 text-sm text-text-secondary">Connect a source to start tracking quality and outcomes.</p>
                  <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>Add your first data product</Button>
                </div>
              </div>
            )}

            {!loading && datasets.length > 0 && (
              <div id="products" className="scroll-mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">All data products <span className="ml-1 font-mono">{filteredDatasets.length}</span></h2>
                </div>
                {filteredDatasets.length === 0 ? (
                  <div className="rounded-xl border border-border-subtle bg-surface px-5 py-10 text-center text-sm text-text-secondary">
                    No data products match “{searchQuery}”.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {filteredDatasets.map((dataset) => (
                  <MetricCard
                    key={dataset.id}
                    icon={dataset.icon}
                    title={dataset.title}
                    sourceType={dataset.sourceType}
                    syncStatus={dataset.syncStatus}
                    rowCount={dataset.rowCount}
                    lastSyncAt={dataset.lastSyncAt}
                    qualityScore={dataset.qualityScore}
                    usageScore={dataset.usageScore}
                    outcomeScore={dataset.outcomeScore}
                    hypothesis={dataset.hypothesis}
                    status={dataset.status}
                    onViewDetails={() => router.push(`/detail/${dataset.id}`)}
                    onAsk={() => setChatDatasetId(dataset.id)}
                  />
                ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {chatDatasetId && (
          <ChatPanel
            key={chatDatasetId}
            datasetId={chatDatasetId}
            datasetName={chatDataset?.title}
            onClose={() => setChatDatasetId(null)}
          />
        )}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleAddDataset}
      />
    </div>
  )
}
