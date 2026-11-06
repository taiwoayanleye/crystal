'use client'

import { useState } from 'react'
import { Button } from './Button'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    file: File | null
    problemStatement: string
    users: string
    successMetrics: string[]
  }) => Promise<void> | void
}

export function UploadModal({ isOpen, onClose, onSubmit }: UploadModalProps) {
  const [problemStatement, setProblemStatement] = useState('')
  const [users, setUsers] = useState('')
  const [successMetrics, setSuccessMetrics] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setProblemStatement('')
    setUsers('')
    setSuccessMetrics([])
    setFile(null)
    setError(null)
    setSubmitting(false)
  }

  const close = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const pickFile = (f: File | null) => {
    setError(null)
    if (f && !f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file')
      return
    }
    setFile(f)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!file) {
      setError('A CSV file is required')
      return
    }
    if (!problemStatement.trim()) {
      setError('Describe the problem this data solves')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ file, problemStatement, users: users || 'Data team', successMetrics })
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={close}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-section-title text-navy font-semibold">Add New Dataset</h2>
          <button onClick={close} className="text-text-light hover:text-text-dark text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-small text-text-dark font-medium block mb-2">
              What problem does this data solve?
            </label>
            <input
              type="text"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="e.g., Predict customer lifetime value"
              className="w-full px-3 py-2 border border-border rounded-md text-small focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-small text-text-dark font-medium block mb-2">Who uses this?</label>
            <input
              type="text"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              placeholder="e.g., Finance, Product teams"
              className="w-full px-3 py-2 border border-border rounded-md text-small focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-small text-text-dark font-medium block mb-2">Upload CSV File</label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                pickFile(e.dataTransfer.files?.[0] ?? null)
              }}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth ${
                dragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer block">
                <div className={file ? 'text-text-dark font-medium' : 'text-text-light'}>
                  {file ? `📄 ${file.name}` : 'Drag & drop a CSV here'}
                </div>
                <div className="text-small text-primary mt-1">
                  {file ? 'Click to choose a different file' : 'or click to browse'}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="text-small text-text-dark font-medium block mb-2">
              Define Success Metrics (optional)
            </label>
            <div className="space-y-2">
              {['Adoption %', 'Query Volume', 'Business Impact ($)'].map((metric) => (
                <label key={metric} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={successMetrics.includes(metric)}
                    onChange={(e) =>
                      setSuccessMetrics((prev) =>
                        e.target.checked ? [...prev, metric] : prev.filter((m) => m !== metric)
                      )
                    }
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-small text-text-dark">{metric}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-small text-error">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={close} className="flex-1" disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Dataset'}
          </Button>
        </div>
      </div>
    </div>
  )
}
