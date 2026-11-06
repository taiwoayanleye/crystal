import { ProgressBar } from './ProgressBar'
import { Button } from './Button'

interface MetricCardProps {
  icon: string
  title: string
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
  qualityScore,
  usageScore,
  outcomeScore,
  hypothesis,
  status,
  onViewDetails,
  onAsk,
}: MetricCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg shadow-sm p-5 hover:shadow-md transition-smooth flex flex-col h-full">
      <div className="flex items-start gap-2 mb-4">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <h3 className="text-base text-navy font-semibold leading-snug line-clamp-2">{title}</h3>
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
            <span className="text-small text-text-dark font-medium">Usage</span>
            <span className="text-small font-mono font-bold text-primary">{usageScore}%</span>
          </div>
          <ProgressBar value={usageScore} color="primary" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-small text-text-dark font-medium">Outcome</span>
            <span
              className={`text-small font-mono font-bold ${
                outcomeScore > 50 ? 'text-success' : 'text-warning'
              }`}
            >
              {outcomeScore}/100
            </span>
          </div>
          <ProgressBar value={outcomeScore} color={outcomeScore > 50 ? 'success' : 'warning'} />
        </div>
      </div>

      <div className="border-t border-border pt-3 mt-4 flex-1">
        <div className="flex gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <div className="min-w-0">
            <p className="text-small text-text-dark line-clamp-2">{hypothesis}</p>
            <p className="text-small text-text-light mt-1">Status: {status}</p>
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
    </div>
  )
}
