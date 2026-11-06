import { Button } from './Button'

interface SidebarProps {
  datasets?: Array<{ id: string; name: string; icon?: string }>
  onAddDataset?: () => void
  onSelectDataset?: (datasetId: string) => void
  onAskDataset?: (datasetId: string) => void
  activeDatasetId?: string | null
}

export function Sidebar({
  datasets = [],
  onAddDataset,
  onSelectDataset,
  onAskDataset,
  activeDatasetId,
}: SidebarProps) {
  return (
    <aside className="hidden md:flex md:w-60 flex-shrink-0 bg-white border-r border-border p-4 flex-col gap-6 overflow-y-auto">
      <div className="flex items-center gap-2">
        <span className="text-xl">📊</span>
        <span className="text-small font-medium text-text-dark">Dashboard</span>
      </div>

      <Button variant="primary" size="md" onClick={onAddDataset} className="w-full justify-center">
        + Add Dataset
      </Button>

      <div className="flex-1">
        <p className="text-small font-medium text-text-light uppercase tracking-wide mb-2 px-1">
          Datasets
        </p>
        <nav className="space-y-1">
          {datasets.length === 0 && (
            <p className="text-small text-text-light px-3 py-2">No datasets yet.</p>
          )}
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className={`group flex items-center rounded-md transition-smooth ${
                activeDatasetId === dataset.id ? 'bg-primary/10' : 'hover:bg-white'
              }`}
            >
              <button
                onClick={() => onSelectDataset?.(dataset.id)}
                className="flex-1 text-left px-3 py-2 text-small text-text-dark truncate"
                title={dataset.name}
              >
                <span className="mr-1">{dataset.icon ?? '•'}</span>
                {dataset.name}
              </button>
              <button
                onClick={() => onAskDataset?.(dataset.id)}
                title="Ask Claude about this dataset"
                className="px-2 py-2 text-text-light hover:text-primary opacity-0 group-hover:opacity-100 transition-smooth"
              >
                💬
              </button>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-border pt-4 text-small text-text-light">
        <p>CSV and PostgreSQL sources are available.</p>
      </div>
    </aside>
  )
}
