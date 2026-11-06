type Status = 'fresh' | 'stale' | 'error'

interface LineageNode {
  name: string
  description: string
  status: Status
}

interface LineageFlowProps {
  raw: LineageNode
  etl: LineageNode
  transform: LineageNode
  dataset: LineageNode
  usage: { name: string; applications: string[]; status: Status }
}

const STATUS_LABEL: Record<Status, string> = {
  fresh: 'Fresh',
  stale: 'Stale',
  error: 'Error',
}

const STATUS_ICON: Record<Status, string> = {
  fresh: '✓',
  stale: '⚠',
  error: '✗',
}

const STATUS_CHIP: Record<Status, string> = {
  fresh: 'bg-success/10 text-success',
  stale: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
}

function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`text-small font-medium mt-2 px-2 py-1 rounded inline-block ${STATUS_CHIP[status]}`}>
      {STATUS_ICON[status]} {STATUS_LABEL[status]}
    </span>
  )
}

function Stage({
  icon,
  label,
  title,
  description,
  status,
}: {
  icon: string
  label: string
  title: string
  description: string
  status: Status
}) {
  return (
    <div className="w-40 flex-shrink-0 p-4 bg-bg-subtle rounded-lg border border-border text-center">
      <div className="text-small font-medium text-text-dark">
        {icon} {label}
      </div>
      <div className="text-small font-semibold text-navy mt-2 truncate" title={title}>
        {title}
      </div>
      <div className="text-small text-text-light mt-1">{description}</div>
      <StatusChip status={status} />
    </div>
  )
}

export function LineageFlow({ raw, etl, transform, dataset, usage }: LineageFlowProps) {
  const arrow = <div className="text-2xl text-text-light font-light flex-shrink-0">→</div>

  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-section-title text-navy mb-6">Data Lineage</h3>

      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch gap-3 min-w-max">
          <Stage icon="📁" label="Raw Data" title={raw.name} description={raw.description} status={raw.status} />
          {arrow}
          <Stage icon="⚙️" label="ETL" title={etl.name} description={etl.description} status={etl.status} />
          {arrow}
          <Stage icon="🔄" label="Transform" title={transform.name} description={transform.description} status={transform.status} />
          {arrow}
          <Stage icon="📊" label="Dataset" title={dataset.name} description={dataset.description} status={dataset.status} />
          {arrow}
          <div className="w-44 flex-shrink-0 p-4 bg-bg-subtle rounded-lg border border-border">
            <div className="text-small font-medium text-text-dark text-center">📈 {usage.name}</div>
            <ul className="mt-2 space-y-1">
              {usage.applications.map((app) => (
                <li key={app} className="text-small text-text-light truncate" title={app}>
                  • {app}
                </li>
              ))}
            </ul>
            <div className="text-center">
              <StatusChip status={usage.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border pt-6 mt-2">
        <h4 className="text-small font-medium text-text-dark mb-3">Status Legend</h4>
        <div className="flex flex-wrap gap-6">
          {(['fresh', 'stale', 'error'] as Status[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-small font-bold ${
                  s === 'fresh' ? 'bg-success' : s === 'stale' ? 'bg-warning' : 'bg-error'
                }`}
              >
                {STATUS_ICON[s]}
              </span>
              <span className="text-small text-text-light">{STATUS_LABEL[s]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
