'use client'

import { useState } from 'react'
import { Button } from './Button'
import { parseCSV } from '@/lib/csvParser'

export type SourceType = 'csv' | 'postgres'

export interface PostgresConnection {
  host: string
  port: string
  database: string
  user: string
  password: string
  table: string
  schema: string
  ssl: boolean
}

export interface UploadSubmit {
  sourceType: SourceType
  problemStatement: string
  users: string
  file: File | null
  connection: PostgresConnection
  successMetrics: string[]
}

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UploadSubmit) => Promise<void> | void
}

interface Suggestion {
  name: string
  description: string
}

const EMPTY_PG: PostgresConnection = {
  host: '',
  port: '5432',
  database: '',
  user: '',
  password: '',
  table: '',
  schema: 'public',
  ssl: true,
}

const DEFAULT_METRICS = ['Adoption %', 'Query Volume', 'Business Impact ($)']

export function UploadModal({ isOpen, onClose, onSubmit }: UploadModalProps) {
  const [sourceType, setSourceType] = useState<SourceType>('csv')
  const [problemStatement, setProblemStatement] = useState('')
  const [users, setUsers] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pg, setPg] = useState<PostgresConnection>(EMPTY_PG)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setSourceType('csv')
    setProblemStatement('')
    setUsers('')
    setFile(null)
    setPg(EMPTY_PG)
    setSelectedMetrics([])
    setSuggestions([])
    setSuggestError(null)
    setError(null)
    setSubmitting(false)
    setSuggesting(false)
  }

  const close = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const toggleMetric = (m: string) =>
    setSelectedMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))

  const pickFile = (f: File | null) => {
    setError(null)
    setSuggestions([])
    setSuggestError(null)
    if (f && !f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file')
      return
    }
    setFile(f)
  }

  const suggestWithAI = async () => {
    setSuggestError(null)
    setSuggesting(true)
    try {
      if (!file) throw new Error('Choose a CSV first')
      const { headers, rows } = await parseCSV(file)
      const res = await fetch('/api/suggest-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: headers,
          sampleRows: rows.slice(0, 15),
          problemStatement,
        }),
      })
      if (!res.ok) throw new Error('Could not get suggestions')
      const { metrics } = await res.json()
      setSuggestions(Array.isArray(metrics) ? metrics : [])
      if (!metrics?.length) setSuggestError('No suggestions returned — try a clearer problem statement.')
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : 'Suggestion failed')
    } finally {
      setSuggesting(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!problemStatement.trim()) {
      setError('Describe the problem this data solves')
      return
    }
    if (sourceType === 'csv' && !file) {
      setError('A CSV file is required')
      return
    }
    if (sourceType === 'postgres') {
      for (const [k, label] of [
        ['host', 'Host'],
        ['database', 'Database'],
        ['user', 'User'],
        ['password', 'Password'],
        ['table', 'Table'],
      ] as const) {
        if (!pg[k].trim()) {
          setError(`${label} is required`)
          return
        }
      }
    }

    setSubmitting(true)
    try {
      await onSubmit({
        sourceType,
        problemStatement,
        users: users || 'Data team',
        file,
        connection: pg,
        successMetrics: selectedMetrics,
      })
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dataset')
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const inputCls =
    'w-full px-3 py-2 border border-border rounded-md text-small focus:outline-none focus:ring-2 focus:ring-primary'
  const setPgField = (k: keyof PostgresConnection, v: string | boolean) =>
    setPg((prev) => ({ ...prev, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={close}>
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
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
            <label className="text-small text-text-dark font-medium block mb-2">Data source</label>
            <select
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value as SourceType)
                setError(null)
              }}
              className={inputCls}
            >
              <option value="csv">CSV file</option>
              <option value="postgres">PostgreSQL database</option>
            </select>
          </div>

          <div>
            <label className="text-small text-text-dark font-medium block mb-2">
              What problem does this data solve?
            </label>
            <input
              type="text"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="e.g. Predict customer churn"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-small text-text-dark font-medium block mb-2">Who uses this data?</label>
            <input
              type="text"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              placeholder="e.g. Finance, Product teams"
              className={inputCls}
            />
          </div>

          {sourceType === 'csv' && (
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
                  dragging ? 'border-primary bg-primary/5' : file ? 'border-primary/60 bg-primary/5' : 'border-border'
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
                  <svg
                    className="mx-auto mb-2 text-text-light"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div className={file ? 'text-text-dark font-medium' : 'text-text-dark'}>
                    {file ? `📄 ${file.name}` : 'Drag & Drop CSV Here'}
                  </div>
                  <div className="text-small text-primary mt-1">
                    {file ? 'Click to choose a different file' : 'or Click to Browse'}
                  </div>
                </label>
              </div>
              <p className="text-small text-text-light mt-2">Supports .csv · up to 10MB</p>
            </div>
          )}

          {sourceType === 'postgres' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-small text-text-light block mb-1">Host</label>
                  <input className={inputCls} value={pg.host} onChange={(e) => setPgField('host', e.target.value)} placeholder="db.example.com" />
                </div>
                <div>
                  <label className="text-small text-text-light block mb-1">Port</label>
                  <input className={inputCls} value={pg.port} onChange={(e) => setPgField('port', e.target.value)} placeholder="5432" />
                </div>
              </div>
              <div>
                <label className="text-small text-text-light block mb-1">Database</label>
                <input className={inputCls} value={pg.database} onChange={(e) => setPgField('database', e.target.value)} placeholder="analytics" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-small text-text-light block mb-1">User</label>
                  <input className={inputCls} value={pg.user} onChange={(e) => setPgField('user', e.target.value)} placeholder="readonly" />
                </div>
                <div>
                  <label className="text-small text-text-light block mb-1">Password</label>
                  <input type="password" className={inputCls} value={pg.password} onChange={(e) => setPgField('password', e.target.value)} placeholder="••••••••" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-small text-text-light block mb-1">Schema</label>
                  <input className={inputCls} value={pg.schema} onChange={(e) => setPgField('schema', e.target.value)} placeholder="public" />
                </div>
                <div>
                  <label className="text-small text-text-light block mb-1">Table</label>
                  <input className={inputCls} value={pg.table} onChange={(e) => setPgField('table', e.target.value)} placeholder="customers" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={pg.ssl} onChange={(e) => setPgField('ssl', e.target.checked)} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                <span className="text-small text-text-dark">Require SSL (recommended for hosted Postgres)</span>
              </label>
              <p className="text-small text-text-light">Credentials are used once to read schema and a sample — they are not stored.</p>
            </div>
          )}

          {/* Define Success Metrics (optional) + AI suggestions */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-small text-text-dark font-medium">Define Success Metrics (optional)</label>
              {sourceType === 'csv' && (
                <button
                  type="button"
                  onClick={suggestWithAI}
                  disabled={!file || suggesting}
                  className="text-small text-primary font-medium disabled:opacity-40 hover:opacity-80"
                  title={file ? 'Inspect the data and suggest metrics' : 'Choose a CSV first'}
                >
                  {suggesting ? 'Inspecting…' : '✨ Suggest with AI'}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {DEFAULT_METRICS.map((metric) => (
                <label key={metric} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={() => toggleMetric(metric)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-small text-text-dark">{metric}</span>
                </label>
              ))}
            </div>

            {suggestError && <p className="text-small text-text-light mt-2">{suggestError}</p>}

            {suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-small text-text-light mb-2">✨ AI-suggested for this data</p>
                <div className="space-y-2">
                  {suggestions.map((s) => {
                    const label = s.description ? `${s.name} — ${s.description}` : s.name
                    return (
                      <label key={label} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(label)}
                          onChange={() => toggleMetric(label)}
                          className="w-4 h-4 mt-0.5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-small text-text-dark">
                          <span className="font-medium">{s.name}</span>
                          {s.description ? <span className="text-text-light"> — {s.description}</span> : null}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-small text-error">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={close} className="flex-1" disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1" disabled={submitting}>
            {submitting ? (sourceType === 'postgres' ? 'Connecting…' : 'Creating…') : 'Create Dataset'}
          </Button>
        </div>
      </div>
    </div>
  )
}
