import { ProgressBar } from './ProgressBar'

interface MetricCardProps {
  icon: string
  title: string
  sourceType: 'csv' | 'postgres' | 'snowflake' | 'bigquery' | 's3' | 'gcs'
  syncStatus?: 'fresh' | 'stale' | 'syncing' | 'error'
  rowCount: number
  lastSyncAt: string
  qualityScore: number
  usageScore: number
  outcomeScore: number
  hypothesis: string
  status: string
  onViewDetails?: () => void
  onAsk?: () => void
}

export function MetricCard({
  title,
  sourceType,
  syncStatus = 'fresh',
  rowCount,
  lastSyncAt,
  qualityScore,
  usageScore,
  outcomeScore,
  hypothesis,
  status,
  onViewDetails,
  onAsk,
}: MetricCardProps) {
  const outcomeTracked = status !== 'Not started'
  const snapshotDate = new Date(lastSyncAt)

  return (
    <article className="flex h-full flex-col rounded-xl border border-border-subtle bg-surface transition-smooth hover:border-border-default hover:shadow-sm">
      <div className="flex items-start justify-between gap-4 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-text-primary" title={title}>{title}</h2>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-text-tertiary">
            <span className="truncate">
              {{ csv: 'CSV', postgres: 'PostgreSQL', snowflake: 'Snowflake', bigquery: 'BigQuery', s3: 'S3', gcs: 'GCS' }[sourceType]} <span aria-hidden="true">--</span> {rowCount.toLocaleString()} rows <span aria-hidden="true">--</span> {snapshotDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {syncStatus === 'stale' && (
              <span className="shrink-0 rounded-full bg-warning-dim px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-data-amber" title="Scheduled sync window passed — refresh to update">Stale</span>
            )}
            {syncStatus === 'syncing' && (
              <span className="shrink-0 rounded-full bg-bg-elevated px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent" title="Sync in progress">Syncing</span>
            )}
            {syncStatus === 'error' && (
              <span className="shrink-0 rounded-full bg-error-dim px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-error" title="Last sync failed">Error</span>
            )}
          </p>
        </div>
        <span className="shrink-0 font-mono text-2xl font-medium leading-none text-data-green" title="Calculated quality score; includes heuristic estimates">
          {qualityScore}%
        </span>
      </div>

      <div className="space-y-2.5 px-5 py-4">
        <Metric label="Quality" value={`${qualityScore}%`} progress={qualityScore} color="success" />
        <Metric label="Demo activity index" value={`${usageScore}%`} progress={usageScore} color="primary" />
        <Metric
          label="Outcome"
          value={outcomeTracked ? `${outcomeScore}/100` : 'Not started'}
          progress={outcomeTracked ? outcomeScore : undefined}
          color={outcomeScore > 50 ? 'success' : 'warning'}
        />
      </div>

      <footer className="mt-auto flex min-h-[68px] items-center justify-between gap-3 rounded-b-xl bg-bg-elevated px-5 py-3">
        <p className="flex min-w-0 items-center gap-2 text-xs text-text-secondary" title={hypothesis}>
          <svg className="shrink-0 text-text-tertiary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M8.2 14.5a6.5 6.5 0 1 1 7.6 0c-.9.6-1.3 1.4-1.5 2.5h-4.6c-.2-1.1-.6-1.9-1.5-2.5z" /></svg>
          <span className="truncate">{hypothesis || 'No outcome hypothesis added'}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onViewDetails} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-light">
            View <span aria-hidden="true">→</span>
          </button>
          {onAsk && (
            <button type="button" onClick={onAsk} className="inline-flex items-center gap-2 rounded-lg bg-bg-hover px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-border-default" aria-label={`Ask about ${title}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></svg>
              Ask
            </button>
          )}
        </div>
      </footer>
    </article>
  )
}

function Metric({
  label,
  value,
  progress,
  color,
}: {
  label: string
  value: string
  progress?: number
  color: 'success' | 'primary' | 'warning'
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-[11px] text-text-secondary">{label}</span>
        <span className="font-mono text-[10px] tabular-nums text-text-secondary">{value}</span>
      </div>
      {progress === undefined ? (
        <div className="h-1 rounded-sm bg-bg-elevated" aria-hidden="true" />
      ) : (
        <ProgressBar value={progress} color={color} />
      )}
    </div>
  )
}
