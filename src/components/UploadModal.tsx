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
  name: string
  icon: string
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
  const [name, setName] = useState('')
  const [nameEdited, setNameEdited] = useState(false)
  const [icon, setIcon] = useState('')
  const [problemStatement, setProblemStatement] = useState('')
  const [users, setUsers] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pg, setPg] = useState<PostgresConnection>(EMPTY_PG)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(DEFAULT_METRICS)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setSourceType('csv')
    setName('')
    setNameEdited(false)
    setIcon('')
    setProblemStatement('')
    setUsers('')
    setFile(null)
    setPg(EMPTY_PG)
    setSelectedMetrics(DEFAULT_METRICS)
    setSuggestions([])
    setAiError(null)
    setAnalyzed(false)
    setError(null)
    setSubmitting(false)
    setAnalyzing(false)
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
    setAiError(null)
    setAnalyzed(false)
    if (f && !f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file')
      return
    }
    setFile(f)
    // Seed a reasonable name from the filename until AI (or the user) refines it.
    if (f && !nameEdited) setName(f.name.replace(/\.csv$/i, ''))
  }

  const metricLabel = (s: Suggestion) => (s.description ? `${s.name} — ${s.description}` : s.name)

  const autofillWithAI = async () => {
    setAiError(null)
    setAnalyzing(true)
    try {
      if (sourceType === 'csv') {
        if (!file) throw new Error('Choose a CSV first')
        const { headers, rows } = await parseCSV(file)
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schema: headers, sampleRows: rows.slice(0, 15), problemStatement }),
        })
        if (!res.ok) throw new Error('Could not analyze the data')
        const analysis = await res.json()
        if (!nameEdited && analysis.name) setName(analysis.name)
        if (analysis.icon) setIcon(analysis.icon)
        if (!problemStatement.trim() && analysis.problemStatement) setProblemStatement(analysis.problemStatement)
        if (!users.trim() && analysis.users) setUsers(analysis.users)
        const metrics: Suggestion[] = Array.isArray(analysis.metrics) ? analysis.metrics : []
        setSuggestions(metrics)
        setSelectedMetrics((prev) => Array.from(new Set([...prev, ...metrics.map(metricLabel)])))
        setAnalyzed(true)
      } else if (sourceType === 'postgres') {
        const res = await fetch('/api/connect?analyze=true', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceType: 'postgres', connection: pg, problemStatement }),
        })
        if (!res.ok) throw new Error('Could not analyze the data')
        const { suggestions: sug } = await res.json()
        if (sug) {
          if (!nameEdited && sug.name) setName(sug.name)
          if (sug.icon) setIcon(sug.icon)
          if (!problemStatement.trim() && sug.problemStatement) setProblemStatement(sug.problemStatement)
          if (!users.trim() && sug.users) setUsers(sug.users)
          const metricNames = Array.isArray(sug.metrics) ? sug.metrics : []
          setSelectedMetrics((prev) => Array.from(new Set([...prev, ...metricNames])))
        }
        setAnalyzed(true)
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
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
        name: name.trim(),
        icon: icon.trim(),
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
    'w-full rounded-md border border-border-default bg-surface px-3 py-2 text-small text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent'
  const setPgField = (k: keyof PostgresConnection, v: string | boolean) =>
    setPg((prev) => ({ ...prev, [k]: v }))

  const sparkle = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
      <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2zM19 14l.9 2.4L22 17l-2.1.6L19 20l-.9-2.4L16 17l2.1-.6L19 14zM5 14l.9 2.4L8 17l-2.1.6L5 20l-.9-2.4L2 17l2.1-.6L5 14z" />
    </svg>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-3 backdrop-blur-sm sm:p-6" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border-subtle bg-surface shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-surface px-5 py-4 sm:px-6">
          <div>
            <h2 id="upload-modal-title" className="font-heading text-lg font-semibold text-text-primary">Add a data product</h2>
            <p className="mt-1 text-xs text-text-secondary">Connect a source and describe the value it should create.</p>
          </div>
          <button onClick={close} aria-label="Close dialog" className="w-9 h-9 rounded-md text-text-light hover:bg-bg-subtle hover:text-text-dark text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div>
            <label htmlFor="source-type" className="text-small text-text-dark font-medium block mb-2">Data source</label>
            <select
              id="source-type"
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
                  dragging ? 'border-accent bg-bg-elevated' : file ? 'border-accent bg-bg-elevated' : 'border-border-default bg-bg-elevated'
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
                  <div className="text-text-dark">{file ? `📄 ${file.name}` : 'Drag & Drop CSV Here'}</div>
                  <div className="mt-1 text-small text-text-primary">
                    {file ? 'Click to choose a different file' : 'or Click to Browse'}
                  </div>
                </label>
              </div>
              <p className="text-small text-text-light mt-2">Supports .csv · up to 10MB</p>
            </div>
          )}

          {/* Hero AI action — fills the fields below from the data */}
          {sourceType === 'csv' && (
            <div>
              <button
                type="button"
                onClick={autofillWithAI}
                disabled={!file || analyzing}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-body transition-smooth ${
                  !file
                    ? 'bg-bg-subtle text-text-light cursor-not-allowed'
                    : 'bg-accent text-white hover:bg-accent-light'
                }`}
              >
                {sparkle}
                {analyzing ? 'Analyzing your data…' : analyzed ? 'Re-run AI autofill' : 'Autofill with AI'}
              </button>
              <p className="text-small text-text-light mt-1 text-center">
                {file
                  ? 'Reads your columns + a sample to fill the problem, users, and success metrics.'
                  : 'Attach a CSV above to let AI fill the rest.'}
              </p>
              {aiError && <p className="text-small text-error mt-1 text-center">{aiError}</p>}
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
              <Button
                variant="secondary"
                onClick={autofillWithAI}
                disabled={analyzing || !pg.host || !pg.database || !pg.user || !pg.password || !pg.table}
                className="w-full"
              >
                {analyzing ? 'Analyzing…' : '✨ Autofill with AI'}
              </Button>
            </div>
          )}

          <div>
            <label htmlFor="dataset-name" className="text-small text-text-dark font-medium block mb-2">Dataset name</label>
            <div className="flex gap-2">
              <div className="w-11 flex-shrink-0 flex items-center justify-center border border-border rounded-md text-xl" title="Icon">
                {icon || '📄'}
              </div>
              <input
                id="dataset-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameEdited(true)
                }}
                placeholder="e.g. Telco Customer Churn"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="dataset-problem" className="text-small text-text-dark font-medium block mb-2">
              What problem does this data solve?
            </label>
            <input
              id="dataset-problem"
              type="text"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="e.g. Predict customer churn"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="dataset-users" className="text-small text-text-dark font-medium block mb-2">Who uses this data?</label>
            <input
              id="dataset-users"
              type="text"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              placeholder="e.g. Finance, Product teams"
              className={inputCls}
            />
          </div>

          <div className="border-t border-border pt-4">
            <label className="text-small text-text-dark font-medium block mb-2">
              Define Success Metrics (optional)
            </label>
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

            {suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-small text-text-light mb-2 flex items-center gap-1">{sparkle} AI-suggested for this data</p>
                <div className="space-y-2">
                  {suggestions.map((s) => {
                    const label = metricLabel(s)
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

        <div className="sticky bottom-0 flex gap-3 border-t border-border-subtle bg-surface px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={close} className="flex-1" disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1" disabled={submitting}>
            {submitting ? (sourceType === 'postgres' ? 'Connecting…' : 'Creating…') : 'Create data product'}
          </Button>
        </div>
      </div>
    </div>
  )
}
