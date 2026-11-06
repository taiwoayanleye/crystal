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
          problemStatement: form.problemStatement,
          users: form.users,
          connection: {
            ...form.connection,
            port: Number(form.connection.port) || 5432,
          },
        }),
      })
    } else {
      const data = new FormData()
      if (form.file) data.append('file', form.file)
      data.append('problemStatement', form.problemStatement)
      data.append('users', form.users)
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

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-page-title text-navy">
                  Data Products ({datasets.length})
                </h1>
                <p className="text-small text-text-light mt-1">
                  Measure whether each dataset creates real business value.
                </p>
              </div>
              <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                + Add Dataset
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset) => (
                  <MetricCard
                    key={dataset.id}
                    icon={dataset.icon}
                    title={dataset.title}
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
