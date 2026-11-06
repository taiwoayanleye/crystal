interface LineageNode {
  name: string
  description: string
}

interface LineageFlowProps {
  raw: LineageNode
  etl: LineageNode
  transform: LineageNode
  dataset: LineageNode
  usage: { name: string; applications: string[]; status?: string }
}

function Stage({
  icon,
  label,
  title,
  description,
}: {
  icon: string
  label: string
  title: string
  description: string
}) {
  return (
    <div className="w-44 flex-shrink-0 rounded-lg border border-border-subtle bg-bg-elevated p-4 text-left">
      <div className="text-[10px] font-mono font-medium uppercase tracking-wide text-text-tertiary">
        {icon} {label}
      </div>
      <div className="mt-3 truncate text-sm font-semibold text-text-primary" title={title}>
        {title}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</div>
    </div>
  )
}

export function LineageFlow({ raw, etl, transform, dataset, usage }: LineageFlowProps) {
  const arrow = <div className="flex-shrink-0 self-center font-mono text-sm text-text-tertiary" aria-hidden="true">→</div>

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="font-heading text-base font-semibold text-text-primary">Data flow</h3>
        <p className="mt-1 text-xs text-text-secondary">Observed source and Crystal processing steps.</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch gap-3 min-w-max">
          <Stage icon="📁" label="Source" title={raw.name} description={raw.description} />
          {arrow}
          <Stage icon="⚙️" label="Ingestion" title={etl.name} description={etl.description} />
          {arrow}
          <Stage icon="🔄" label="Profile" title={transform.name} description={transform.description} />
          {arrow}
          <Stage icon="📊" label="Data product" title={dataset.name} description={dataset.description} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">Intended audience</p>
          <p className="mt-1 text-xs font-medium text-text-primary">{usage.name}</p>
        </div>
        <span className="rounded-md border border-border-subtle bg-bg-elevated px-2.5 py-1 font-mono text-[10px] text-text-secondary">Not connected</span>
      </div>
    </div>
  )
}
