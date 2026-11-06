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
    <div className="w-40 flex-shrink-0 p-4 bg-bg-subtle rounded-lg border border-border text-center">
      <div className="text-small font-medium text-text-dark">
        {icon} {label}
      </div>
      <div className="text-small font-semibold text-navy mt-2 truncate" title={title}>
        {title}
      </div>
      <div className="text-small text-text-light mt-1">{description}</div>
    </div>
  )
}

export function LineageFlow({ raw, etl, transform, dataset, usage }: LineageFlowProps) {
  const arrow = <div className="text-2xl text-text-light font-light flex-shrink-0">→</div>

  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <div className="mb-5">
        <h3 className="text-section-title text-navy">Data flow</h3>
        <p className="text-small text-text-light mt-1">Observed source and Crystal processing steps. Downstream consumers are not connected yet.</p>
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
      <div className="border-t border-border pt-4 mt-2">
        <p className="text-small font-medium text-text-dark mb-2">👥 {usage.name}</p>
        <div className="flex flex-wrap gap-2">
          {usage.applications.map((person) => (
            <span key={person} className="px-2.5 py-1 rounded-full bg-bg-subtle border border-border text-small text-text-dark">
              {person}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
