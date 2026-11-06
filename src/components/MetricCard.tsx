import { ProgressBar } from './ProgressBar'
import { Button } from './Button'

interface MetricCardProps {
  icon: string
  title: string
  sourceType: 'csv' | 'postgres'
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
  icon,
  title,
  sourceType,
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

  return (
    <article className="group bg-white border border-border rounded-lg shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-smooth flex flex-col h-full">
      <div className="flex items-start gap-3 mb-5">
        <span className="w-10 h-10 rounded-md bg-bg-subtle flex items-center justify-center text-xl flex-shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base text-navy font-semibold leading-snug line-clamp-2" title={title}>{title}</h3>
          <p className="text-xs text-text-light mt-1">
            {sourceType === 'postgres' ? 'PostgreSQL' : 'CSV'} · {rowCount.toLocaleString()} rows · Snapshot {new Date(lastSyncAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-small text-text-dark font-medium">Quality</span>
            <span className="text-small font-mono font-bold text-success">{qualityScore}%</span>
          </div>
          <ProgressBar value={qualityScore} color="success" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-small text-text-dark font-medium">Demo activity index</span>
            <span className="text-small font-mono font-bold text-text-light">{usageScore}%</span>
          </div>
          <ProgressBar value={usageScore} color="primary" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-small text-text-dark font-medium">Outcome</span>
            <span
              className={`text-small font-mono font-bold ${
                !outcomeTracked ? 'text-text-light' : outcomeScore > 50 ? 'text-success' : 'text-warning'
              }`}
            >
              {outcomeTracked ? `${outcomeScore}/100` : 'Not started'}
            </span>
          </div>
          {outcomeTracked ? (
            <ProgressBar value={outcomeScore} color={outcomeScore > 50 ? 'success' : 'warning'} />
          ) : (
            <div className="h-1.5 rounded-sm bg-bg-subtle" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="border-t border-border pt-3 mt-4 flex-1">
        <div className="flex gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <div className="min-w-0">
            <p className="text-small text-text-dark line-clamp-2">{hypothesis}</p>
            <p className="text-small text-text-light mt-1">Outcome status: {status}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="primary" size="sm" onClick={onViewDetails} className="flex-1">
          View Details
        </Button>
        {onAsk && (
          <Button variant="secondary" size="sm" onClick={onAsk} title="Ask Claude">
            💬 Ask
          </Button>
        )}
      </div>
    </article>
  )
}
