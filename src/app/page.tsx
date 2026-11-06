'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { ChatPanel } from '@/components/ChatPanel'
import { MetricCard } from '@/components/MetricCard'
import { UploadModal, type UploadSubmit } from '@/components/UploadModal'
import { Button } from '@/components/Button'

interface Dataset {
  id: string
  icon: string
  title: string
  qualityScore: number
  usageScore: number
  outcomeScore: number
  hypothesis: string
  status: string
  sourceType: 'csv' | 'postgres'
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
      value: `${datasets.filter((dataset) => dataset.sourceType === 'csv').length} CSV · ${datasets.filter((dataset) => dataset.sourceType === 'postgres').length} Postgres`,
      icon: '↔',
      tone: 'navy',
    },
  ] as const

  const toneClasses = {
    success: 'bg-success/10 text-success',
    primary: 'bg-primary/10 text-primary',
    navy: 'bg-navy/10 text-navy',
    warning: 'bg-warning/10 text-warning',
  }

  return (
    <section
      aria-label="Portfolio summary"
      className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5"
    >
      {items.map((item) => (
        <div
          key={item.label}
          title={'hint' in item ? item.hint : undefined}
          className="min-w-0 flex items-center gap-3 rounded-lg border border-border bg-white p-4 shadow-sm"
        >
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base font-semibold ${toneClasses[item.tone]}`}
          >
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-6 tracking-tight text-navy tabular-nums">{item.value}</p>
            <p className="truncate text-xs leading-4 text-text-light">{item.label}</p>
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

  useEffect(() => {
    fetchDatasets()
  }, [])

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

    if (form.sourceType === 'postgres') {
      response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'postgres',
          name: form.name,
          icon: form.icon,
          problemStatement: form.problemStatement,
          users: form.users,
          successMetrics: form.successMetrics,
          connection: {
            ...form.connection,
            port: Number(form.connection.port) || 5432,
          },
        }),
      })
    } else {
      const data = new FormData()
      if (form.file) data.append('file', form.file)
      data.append('name', form.name)
      data.append('icon', form.icon)
      data.append('problemStatement', form.problemStatement)
      data.append('users', form.users)
      data.append('successMetrics', JSON.stringify(form.successMetrics))
      response = await fetch('/api/upload', { method: 'POST', body: data })
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
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          datasets={datasets.map((d) => ({ id: d.id, name: d.title, icon: d.icon }))}
          onAddDataset={() => setIsUploadModalOpen(true)}
          onSelectDataset={(id) => router.push(`/detail/${id}`)}
          onAskDataset={(id) => setChatDatasetId(id)}
          activeDatasetId={chatDatasetId}
        />

        <div className="flex-1 overflow-y-auto bg-bg-subtle p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-light mb-2">Portfolio</p>
                <h1 className="text-page-title text-navy">Data products</h1>
                <p className="text-small text-text-light mt-2 max-w-xl">
                  Quality signals, intended outcomes, and source coverage across your data products.
                </p>
              </div>
              <Button variant="primary" onClick={() => setIsUploadModalOpen(true)} className="self-start sm:self-auto">
                <span aria-hidden="true" className="mr-2">+</span>Add data product
              </Button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-error text-small">{error}</p>
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
                  <p className="text-text-light mb-6">
                    No datasets yet. Create one to get started.
                  </p>
                  <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                    + Add Your First Dataset
                  </Button>
                </div>
              </div>
            )}

            {!loading && datasets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-5">
                {datasets.map((dataset) => (
                  <MetricCard
                    key={dataset.id}
                    icon={dataset.icon}
                    title={dataset.title}
                    sourceType={dataset.sourceType}
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
        </div>

        {chatDatasetId && (
          <ChatPanel
            key={chatDatasetId}
            datasetId={chatDatasetId}
            datasetName={chatDataset?.title}
            onClose={() => setChatDatasetId(null)}
          />
        )}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleAddDataset}
      />
    </div>
  )
}
