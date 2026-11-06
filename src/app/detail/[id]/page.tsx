'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
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
  metrics: {
    quality: { freshness: number; completeness: number; accuracy: number }
    usage: { queriesPerDay: number; uniqueUsers: number; adoptionPercent: number }
    outcome: { hypothesis: string; status: string; businessImpact: string; outcomeScore: number }
  }
  trendData: Array<{ date: string; count: number }>
  lineage: {
    raw: LineageNode
    etl: LineageNode
    transform: LineageNode
    dataset: LineageNode
    usage: { name: string; applications: string[]; status: Status }
  }
  createdAt: string
  updatedAt: string
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
    color === 'success' ? 'text-success' : color === 'warning' ? 'text-warning' : 'text-error'
  return (
    <div className="bg-white border border-border rounded-lg p-4">
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/datasets/${datasetId}`)
        if (!response.ok) throw new Error('Dataset not found')
        setData(await response.json())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dataset')
      } finally {
        setLoading(false)
      }
    }
    fetchDataset()
  }, [datasetId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/datasets/${datasetId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-text-light">Loading dataset...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error mb-4">{error}</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { quality, usage, outcome } = data.metrics

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="text-primary text-small font-medium mb-4 hover:opacity-80"
            >
              ← Back to dashboard
            </button>
            <h1 className="text-page-title text-navy mb-2">
              <span className="mr-2">{data.icon}</span>
              {data.name}
            </h1>
            <p className="text-body text-text-light">{data.problemStatement}</p>
          </div>

          {/* Metadata */}
          <div className="bg-bg-subtle rounded-lg p-6 mb-8 border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-small text-text-light mb-1">Owner</p>
                <p className="text-body text-text-dark font-medium">{data.users}</p>
              </div>
              <div>
                <p className="text-small text-text-light mb-1">Rows × Cols</p>
                <p className="text-body text-text-dark font-medium">
                  {data.metadata.rowCount.toLocaleString()} × {data.metadata.columnCount}
                </p>
              </div>
              <div>
                <p className="text-small text-text-light mb-1">Created</p>
                <p className="text-body text-text-dark font-medium">
                  {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-small text-text-light mb-1">Last Updated</p>
                <p className="text-body text-text-dark font-medium">
                  {new Date(data.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="mb-8">
            <h2 className="text-section-title text-navy mb-6">Quality Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QualityRow label="Freshness" value={quality.freshness} note="Time since last refresh" />
              <QualityRow label="Completeness" value={quality.completeness} note="Non-empty values" />
              <QualityRow label="Accuracy" value={quality.accuracy} note="Inferred from patterns" />
            </div>
          </div>

          {/* Usage Metrics */}
          <div className="mb-8">
            <h2 className="text-section-title text-navy mb-6">Usage Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <p className="text-metric font-mono text-primary">{usage.queriesPerDay}</p>
                <p className="text-small text-text-light mt-2">queries / day</p>
              </div>
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <p className="text-metric font-mono text-primary">{usage.uniqueUsers}</p>
                <p className="text-small text-text-light mt-2">unique users</p>
                <p className="text-small text-text-light mt-1">{data.users}</p>
              </div>
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <p className="text-metric font-mono text-primary">{usage.adoptionPercent}%</p>
                <p className="text-small text-text-light mt-2">org adoption</p>
              </div>
            </div>
            <TrendChart data={data.trendData} />
          </div>

          {/* Outcome Tracking */}
          <div className="mb-8">
            <h2 className="text-section-title text-navy mb-6">Outcome Tracking</h2>
            <div className="bg-white border border-border rounded-lg p-6 space-y-4">
              <div>
                <p className="text-small text-text-light">Hypothesis</p>
                <p className="text-body text-text-dark font-medium">{outcome.hypothesis}</p>
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
              <div>
                <p className="text-small text-text-light mb-2">
                  Outcome Score — {outcome.outcomeScore}/100
                </p>
                <ProgressBar
                  value={outcome.outcomeScore}
                  color={outcome.outcomeScore > 50 ? 'success' : 'warning'}
                />
              </div>
            </div>
          </div>

          {/* Data Lineage */}
          <div className="mb-8">
            <LineageFlow
              raw={data.lineage.raw}
              etl={data.lineage.etl}
              transform={data.lineage.transform}
              dataset={data.lineage.dataset}
              usage={data.lineage.usage}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-8">
            {!confirmingDelete ? (
              <>
                <Button variant="secondary" onClick={() => router.push('/')}>
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
      </div>
    </div>
  )
}
