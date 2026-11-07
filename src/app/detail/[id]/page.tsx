'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { ChatPanel } from '@/components/ChatPanel'
import { Button } from '@/components/Button'
import { ProgressBar } from '@/components/ProgressBar'
import { TrendChart } from '@/components/TrendChart'
import { LineageFlow } from '@/components/LineageFlow'

type Status = 'fresh' | 'stale' | 'error'

interface LineageNode {
  name: string
  description: string
  status: Status
}

interface DetailData {
  id: string
  name: string
  icon: string
  problemStatement: string
  users: string
  metadata: { rowCount: number; columnCount: number }
  schema: string[]
  successMetrics: string[]
  metrics: {
    quality: { freshness: number; completeness: number; accuracy: number }
    usage: { queriesPerDay: number; uniqueUsers: number; adoptionPercent: number }
    outcome: { hypothesis: string; status: string; businessImpact: string; outcomeScore: number }
  }
  trendData: Array<{ date: string; count: number }>
  sampleRows: Record<string, any>[]
  profile: {
    sampledRows: number
    columns: Array<{
      name: string
      type: 'numeric' | 'categorical' | 'empty'
      filledPercent: number
      distinct: number
      min?: number
      max?: number
      avg?: number
      top?: Array<{ value: string; count: number }>
    }>
  }
  lineage: {
    raw: LineageNode
    etl: LineageNode
    transform: LineageNode
    dataset: LineageNode
    usage: { name: string; applications: string[]; status: Status }
  }
  createdAt: string
  updatedAt: string
  sourceType: 'csv' | 'postgres' | 'snowflake' | 'bigquery' | 's3' | 'gcs'
  lastSyncAt: string
  syncSchedule?: string | null
}

function qualityColor(value: number): 'success' | 'warning' | 'error' {
  if (value >= 85) return 'success'
  if (value >= 70) return 'warning'
  return 'error'
}

function QualityRow({
  label,
  value,
  note,
}: {
  label: string
  value: number
  note: string
}) {
  const color = qualityColor(value)
  const textColor =
    color === 'success' ? 'text-data-green' : color === 'warning' ? 'text-data-amber' : 'text-error'
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-small text-text-dark font-medium">{label}</span>
        <span className={`font-mono text-metric ${textColor}`}>{value}%</span>
      </div>
      <ProgressBar value={value} color={color} />
      <p className="text-small text-text-light mt-2">{note}</p>
    </div>
  )
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const datasetId = params.id as string

  const [data, setData] = useState<DetailData | null>(null)
  const [sidebarDatasets, setSidebarDatasets] = useState<Array<{ id: string; title: string; icon: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingOutcome, setEditingOutcome] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [savingOutcome, setSavingOutcome] = useState(false)
  const [outcomeDraft, setOutcomeDraft] = useState({
    hypothesis: '',
    status: 'Not started',
    businessImpact: '',
    outcomeScore: 0,
  })
  const [syncSchedule, setSyncSchedule] = useState('')
  const [syncHistory, setSyncHistory] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true)
        const [response, listResponse] = await Promise.all([
          fetch(`/api/datasets/${datasetId}`),
          fetch('/api/datasets'),
        ])
        if (!response.ok) throw new Error('Dataset not found')
        setData(await response.json())
        if (listResponse.ok) {
          const list = await listResponse.json()
          setSidebarDatasets(list.map((item: { id: string; title: string; icon: string }) => ({ id: item.id, title: item.title, icon: item.icon })))
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dataset')
      } finally {
        setLoading(false)
      }
    }
    fetchDataset()
  }, [datasetId])

  useEffect(() => {
    if (data && window.location.hash === '#data-flow') {
      requestAnimationFrame(() => document.getElementById('data-flow')?.scrollIntoView({ behavior: 'smooth' }))
    }
  }, [data])

  useEffect(() => {
    if (!data?.id) return
    const fetchSyncData = async () => {
      try {
        setSyncSchedule(data.syncSchedule || '')
        const res = await fetch(`/api/datasets/${data.id}/sync`)
        if (res.ok) {
          const { syncHistory } = await res.json()
          setSyncHistory(syncHistory || [])
        }
      } catch (err) {
        console.warn('Failed to fetch sync history:', err)
      }
    }
    fetchSyncData()
  }, [data?.id, data?.syncSchedule])

  const startEditOutcome = () => {
    if (!data) return
    setOutcomeDraft({
      hypothesis: data.metrics.outcome.hypothesis,
      status: ['Not started', 'Testing', 'Validated', 'Rejected'].includes(data.metrics.outcome.status)
        ? data.metrics.outcome.status
        : 'Testing',
      businessImpact: data.metrics.outcome.businessImpact === 'Not set' ? '' : data.metrics.outcome.businessImpact,
      outcomeScore: data.metrics.outcome.outcomeScore,
    })
    setEditingOutcome(true)
  }

  const saveOutcome = async () => {
    setSavingOutcome(true)
    try {
      const res = await fetch(`/api/datasets/${datasetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: outcomeDraft }),
      })
      if (!res.ok) throw new Error('Save failed')
      const { outcome } = await res.json()
      setData((prev) => (prev ? { ...prev, metrics: { ...prev.metrics, outcome } } : prev))
      setEditingOutcome(false)
    } catch {
      // keep the form open on failure
    } finally {
      setSavingOutcome(false)
    }
  }

  const saveSyncSchedule = async () => {
    if (!data?.id || !syncSchedule.match(/^\d{2}:\d{2}$/)) return
    setSavingSchedule(true)
    try {
      const res = await fetch(`/api/datasets/${data.id}/sync`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: syncSchedule }),
      })
      if (!res.ok) throw new Error('Failed to save schedule')
    } catch (err) {
      console.error('Schedule save error:', err)
    } finally {
      setSavingSchedule(false)
    }
  }

  const manualRefresh = async () => {
    if (!data?.id || data.sourceType === 'csv') return
    setRefreshing(true)
    try {
      const res = await fetch(`/api/refresh/${data.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType: data.sourceType, connection: {} }),
      })
      if (res.ok) {
        const refreshRes = await fetch(`/api/datasets/${data.id}/sync`)
        if (refreshRes.ok) {
          const { syncHistory } = await refreshRes.json()
          setSyncHistory(syncHistory || [])
        }
      }
    } catch (err) {
      console.error('Refresh error:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/datasets/${datasetId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const navigation = (
    <Sidebar
      datasets={sidebarDatasets.map((dataset) => ({ id: dataset.id, name: dataset.title, icon: dataset.icon }))}
      activeDatasetId={datasetId}
      activeSection="data-products"
      onSelectDataset={(id) => router.push(`/detail/${id}`)}
      onDashboard={() => router.push('/dashboard')}
      onDataProducts={() => router.push(`/detail/${datasetId}`)}
      onLineage={() => document.getElementById('data-flow')?.scrollIntoView({ behavior: 'smooth' })}
      onAskDataset={() => setChatOpen(true)}
      onAddDataset={() => router.push('/dashboard?add=1')}
    />
  )

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-bg-base">
        {navigation}
        <main className="flex min-w-0 flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-7 w-7 animate-spin rounded-full border-[3px] border-border-subtle border-t-accent"></div>
            <p className="text-sm text-text-secondary">Loading data product…</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen overflow-hidden bg-bg-base">
        {navigation}
        <main className="flex min-w-0 flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-sm text-error">{error}</p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const { quality, usage, outcome } = data.metrics

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {navigation}
      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
        <div className="mx-auto max-w-[1440px]">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <button type="button" onClick={() => router.push('/dashboard')} className="mb-2 text-[11px] text-text-tertiary hover:text-text-primary">← Dashboard</button>
                <h1 className="flex items-center gap-3 font-heading text-2xl font-semibold tracking-tight text-text-primary sm:text-[26px]">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-bg-elevated text-xl">{data.icon}</span>
                  <span className="truncate">{data.name}</span>
                </h1>
                <p className="mt-1.5 max-w-3xl text-[13px] text-text-secondary">{data.problemStatement}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 font-mono text-[10px] text-text-secondary">
                  {data.sourceType === 'postgres' ? 'PostgreSQL snapshot' : 'CSV snapshot'}
                </span>
                <Button variant="primary" size="sm" onClick={() => setChatOpen(true)}>Ask about this data</Button>
              </div>
            </div>

          {/* Metadata */}
          <div className="mb-8 overflow-hidden rounded-xl border border-border-subtle bg-surface">
            <div className="grid grid-cols-2 gap-px bg-surface md:grid-cols-3 xl:grid-cols-5">
              <div className="border-b border-r border-border-subtle bg-surface px-4 py-3.5">
                <p className="text-[10px] text-text-tertiary mb-1">Owner</p>
                <p className="text-xs text-text-primary font-medium">{data.users}</p>
              </div>
              <div className="border-b border-r border-border-subtle bg-surface px-4 py-3.5">
                <p className="text-[10px] text-text-tertiary mb-1">Rows × Cols</p>
                <p className="text-xs text-text-primary font-medium">
                  {data.metadata.rowCount.toLocaleString()} × {data.metadata.columnCount}
                </p>
              </div>
              <div className="border-b border-border-subtle bg-surface px-4 py-3.5 md:border-r">
                <p className="text-[10px] text-text-tertiary mb-1">Source</p>
                <p className="text-xs text-text-primary font-medium">
                  {data.sourceType === 'postgres' ? 'PostgreSQL' : 'CSV upload'}
                </p>
              </div>
              <div className="border-r border-border-subtle bg-surface px-4 py-3.5 md:border-b-0">
                <p className="text-[10px] text-text-tertiary mb-1">Created</p>
                <p className="text-xs text-text-primary font-medium">
                  {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-surface px-4 py-3.5">
                <p className="text-[10px] text-text-tertiary mb-1">Last synced</p>
                <p className="text-xs text-text-primary font-medium">
                  {new Date(data.lastSyncAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="mb-10">
            <div className="mb-5">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Quality signals</h2>
              <p className="mt-1 text-xs text-text-secondary">Completeness comes from the stored sample. Freshness and accuracy are heuristic estimates.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QualityRow label="Freshness estimate" value={quality.freshness} note="Heuristic snapshot score; not a source SLA." />
              <QualityRow label="Completeness" value={quality.completeness} note="Share of sampled cells with a value." />
              <QualityRow label="Accuracy estimate" value={quality.accuracy} note="Pattern-based estimate; not independently verified." />
            </div>
          </div>

          {/* Data Profile — computed from the real sampled rows */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Data profile</h2>
              <span className="text-xs text-text-secondary">
                computed from {data.profile.sampledRows.toLocaleString()} sampled rows
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
              <table className="w-full text-small">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-elevated text-left text-text-secondary">
                    <th className="px-4 py-2 font-medium">Column</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Filled</th>
                    <th className="px-4 py-2 font-medium">Distinct</th>
                    <th className="px-4 py-2 font-medium">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {data.profile.columns.map((c) => (
                    <tr key={c.name} className="border-b border-border-subtle last:border-0">
                      <td className="px-4 py-2 font-mono text-text-primary">{c.name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            c.type === 'numeric'
                              ? 'bg-bg-elevated text-data-blue'
                              : c.type === 'categorical'
                              ? 'bg-success-dim text-data-green'
                              : 'bg-bg-elevated text-text-secondary'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-text-primary">{c.filledPercent}%</td>
                      <td className="px-4 py-2 text-text-primary">{c.distinct.toLocaleString()}</td>
                      <td className="px-4 py-2 text-text-secondary">
                        {c.type === 'numeric' && (
                          <span className="font-mono">
                            min {c.min} · max {c.max} · avg {c.avg}
                          </span>
                        )}
                        {c.type === 'categorical' &&
                          c.top?.map((t) => `${t.value} (${t.count})`).join(' · ')}
                        {c.type === 'empty' && '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Data preview */}
          {data.sampleRows.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Sample data</h2>
              <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
                <table className="w-full text-small whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border-subtle bg-bg-elevated text-left text-text-secondary">
                      {data.profile.columns.map((c) => (
                        <th key={c.name} className="px-4 py-2 font-medium font-mono">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.sampleRows.map((row, i) => (
                      <tr key={i} className="border-b border-border-subtle last:border-0">
                        {data.profile.columns.map((c) => (
                          <td key={c.name} className="px-4 py-2 text-text-primary">
                            {row[c.name] === null || row[c.name] === undefined || row[c.name] === ''
                              ? '—'
                              : String(row[c.name])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Usage Metrics */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Demo activity</h2>
              <span className="text-[10px] font-mono uppercase tracking-wide text-text-tertiary">illustrative</span>
            </div>
            <p className="mb-6 text-xs text-text-secondary">
              Usage and the 30-day trend are illustrative — a real deployment populates them from
              query logs. Quality, the data profile, lineage, and the (editable) outcome below all
              reflect this dataset.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-border-subtle bg-surface p-4 text-center">
                <p className="font-mono text-2xl text-data-blue">{usage.queriesPerDay}</p>
                <p className="mt-2 text-xs text-text-secondary">queries / day</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface p-4 text-center">
                <p className="font-mono text-2xl text-data-blue">{usage.uniqueUsers}</p>
                <p className="mt-2 text-xs text-text-secondary">unique users</p>
                <p className="mt-1 text-xs text-text-secondary">{data.users}</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface p-4 text-center">
                <p className="font-mono text-2xl text-data-blue">{usage.adoptionPercent}%</p>
                <p className="mt-2 text-xs text-text-secondary">org adoption</p>
              </div>
            </div>
            <TrendChart data={data.trendData} />
          </div>

          {/* Outcome Tracking — user-owned, editable */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Outcome tracking</h2>
              {!editingOutcome && (
                <Button variant="secondary" size="sm" onClick={startEditOutcome}>
                  Edit
                </Button>
              )}
            </div>

            {!editingOutcome ? (
              <div className="space-y-4 rounded-xl border border-border-subtle bg-surface p-5">
                <div>
                  <p className="text-small text-text-light">Hypothesis</p>
                  <p className="text-body text-text-dark font-medium">{outcome.hypothesis || '—'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-small text-text-light">Status</p>
                    <p className="text-body text-text-dark font-medium">{outcome.status}</p>
                  </div>
                  <div>
                    <p className="text-small text-text-light">Business Impact</p>
                    <p className="text-body text-text-dark font-medium">{outcome.businessImpact}</p>
                  </div>
                </div>
                {data.successMetrics.length > 0 && (
                  <div>
                    <p className="text-small text-text-light mb-2">Success metrics</p>
                    <ul className="space-y-1">
                      {data.successMetrics.map((m) => (
                        <li key={m} className="text-small text-text-dark flex gap-2">
                          <span className="text-success">✓</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="text-small text-text-light mb-2">
                    Outcome Score — {outcome.status === 'Not started' ? 'Not scored' : `${outcome.outcomeScore}/100`}
                  </p>
                  {outcome.status !== 'Not started' && (
                    <ProgressBar
                      value={outcome.outcomeScore}
                      color={outcome.outcomeScore > 50 ? 'success' : 'warning'}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-border-subtle bg-surface p-5">
                <div>
                  <label className="text-small text-text-light block mb-1">Hypothesis</label>
                  <textarea
                    value={outcomeDraft.hypothesis}
                    onChange={(e) => setOutcomeDraft({ ...outcomeDraft, hypothesis: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-md text-small focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="What are we trying to prove with this data?"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-small text-text-light block mb-1">Status</label>
                    <select
                      value={outcomeDraft.status}
                      onChange={(e) => setOutcomeDraft({ ...outcomeDraft, status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md text-small focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {['Not started', 'Testing', 'Validated', 'Rejected'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-small text-text-light block mb-1">Business Impact</label>
                    <input
                      value={outcomeDraft.businessImpact}
                      onChange={(e) => setOutcomeDraft({ ...outcomeDraft, businessImpact: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md text-small focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., $500K ARR if validated"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-small text-text-light block mb-2">
                    Outcome Score — {outcomeDraft.outcomeScore}/100
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={outcomeDraft.outcomeScore}
                    onChange={(e) => setOutcomeDraft({ ...outcomeDraft, outcomeScore: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="primary" size="sm" onClick={saveOutcome} disabled={savingOutcome}>
                    {savingOutcome ? 'Saving…' : 'Save'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditingOutcome(false)} disabled={savingOutcome}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sync Schedule */}
          {data.sourceType !== 'csv' && (
            <div className="mb-8">
              <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">Sync schedule</h2>
              <div className="rounded-lg border border-border-subtle bg-surface p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-text-secondary block mb-2">Daily refresh time (UTC)</label>
                    <input
                      type="time"
                      value={syncSchedule}
                      onChange={(e) => setSyncSchedule(e.target.value)}
                      className="w-full px-3 py-2 border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={saveSyncSchedule} disabled={savingSchedule || !syncSchedule.match(/^\d{2}:\d{2}$/)}>
                      {savingSchedule ? 'Saving…' : 'Save'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={manualRefresh} disabled={refreshing}>
                      {refreshing ? 'Syncing…' : 'Refresh now'}
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-text-tertiary mt-3">External cron service will automatically trigger refreshes at this time daily.</p>
              </div>
            </div>
          )}

          {/* Sync History */}
          {syncHistory.length > 0 && (
            <div className="mb-8">
              <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">Sync history</h2>
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-sm">
                  <thead className="border-b border-border-subtle bg-surface">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Rows</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {syncHistory.slice(0, 10).map((sync: any, i: number) => (
                      <tr key={i} className="bg-bg-base hover:bg-bg-elevated">
                        <td className="px-4 py-3 text-xs text-text-primary">{new Date(sync.completedAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded px-2 py-1 text-[10px] font-medium ${sync.status === 'success' ? 'bg-data-green/10 text-data-green' : 'bg-error/10 text-error'}`}>
                            {sync.status === 'success' ? '✓ Success' : '✗ Failed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-primary">{sync.rowsSynced.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[10px] text-text-secondary truncate">{sync.errorMessage || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Lineage */}
          <div id="data-flow" className="mb-8 scroll-mt-6">
            <LineageFlow
              raw={data.lineage.raw}
              etl={{
                ...data.lineage.etl,
                description: `${data.sourceType === 'postgres' ? 'PostgreSQL' : 'CSV'} connector · on ${data.sourceType === 'postgres' ? 'connect' : 'upload'} · stores ${data.profile.sampledRows.toLocaleString()} sample rows`,
              }}
              transform={{
                ...data.lineage.transform,
                description: `${data.profile.sampledRows.toLocaleString()} sampled rows · ${data.profile.columns.length} columns profiled`,
              }}
              dataset={{
                ...data.lineage.dataset,
                description: `Quality estimate ${Math.round((quality.freshness + quality.completeness + quality.accuracy) / 3)}% · ${data.metadata.rowCount.toLocaleString()} rows`,
              }}
              usage={{ ...data.lineage.usage, name: data.users }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-8">
            {!confirmingDelete ? (
              <>
                <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                  Back
                </Button>
                <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                  Delete
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-small text-text-dark">Delete this dataset?</span>
                <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      {chatOpen && (
        <ChatPanel
          key={data.id}
          datasetId={data.id}
          datasetName={data.name}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}
