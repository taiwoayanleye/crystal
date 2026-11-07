import { Button } from './Button'

type SidebarSection = 'dashboard' | 'data-products' | 'lineage'

interface SidebarProps {
  datasets?: Array<{ id: string; name: string; icon?: string }>
  onAddDataset?: () => void
  onSelectDataset?: (datasetId: string) => void
  onAskDataset?: (datasetId: string) => void
  onDashboard?: () => void
  onDataProducts?: () => void
  onLineage?: () => void
  activeDatasetId?: string | null
  activeSection?: SidebarSection
}

const navItems: Array<{ id: SidebarSection | 'settings'; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'data-products', label: 'Data Products', icon: '▤' },
  { id: 'lineage', label: 'Lineage', icon: '⌘' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export function Sidebar({
  datasets = [],
  onAddDataset,
  onSelectDataset,
  onAskDataset,
  onDashboard,
  onDataProducts,
  onLineage,
  activeDatasetId,
  activeSection = 'dashboard',
}: SidebarProps) {
  const handlers: Record<SidebarSection, (() => void) | undefined> = {
    dashboard: onDashboard,
    'data-products': onDataProducts,
    lineage: onLineage,
  }

  return (
    <aside className="hidden w-[260px] flex-shrink-0 flex-col border-r border-border-subtle bg-surface px-5 py-6 md:flex">
      <a href="/" className="flex items-center gap-2.5 px-1 text-text-primary" aria-label="Crystal home">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-white" aria-hidden="true">◇</span>
        <span className="font-heading text-lg font-semibold tracking-tight">Crystal</span>
      </a>

      <nav aria-label="Main navigation" className="mt-10 space-y-1">
        {navItems.map((item) => {
          const active = item.id === activeSection
          const isSettings = item.id === 'settings'
          return (
            <button
              key={item.id}
              type="button"
              onClick={isSettings ? undefined : handlers[item.id]}
              disabled={isSettings}
              aria-current={active ? 'page' : undefined}
              title={isSettings ? 'Settings are not available yet' : undefined}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-smooth ${
                active
                  ? 'bg-bg-elevated text-text-primary font-medium'
                  : isSettings
                    ? 'cursor-not-allowed text-text-tertiary'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }`}
            >
              <span className="w-4 text-center text-base leading-none" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-8">
        <p className="px-3 text-[11px] font-semibold tracking-[0.12em] text-text-tertiary">DATA PRODUCTS</p>
        <nav aria-label="Data products" className="mt-2 space-y-1">
          {datasets.length === 0 && (
            <p className="px-3 py-2 text-xs text-text-tertiary">No data products yet.</p>
          )}
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className={`group flex items-center rounded-md ${activeDatasetId === dataset.id ? 'bg-bg-elevated' : 'hover:bg-bg-elevated'}`}
            >
              <button
                type="button"
                onClick={() => onSelectDataset?.(dataset.id)}
                className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-[13px] ${activeDatasetId === dataset.id ? 'text-text-primary' : 'text-text-secondary'}`}
                title={dataset.name}
              >
                <span className="mr-2" aria-hidden="true">{dataset.icon ?? '•'}</span>
                {dataset.name}
              </button>
              {onAskDataset && (
                <button
                  type="button"
                  onClick={() => onAskDataset(dataset.id)}
                  title={`Ask about ${dataset.name}`}
                  aria-label={`Ask about ${dataset.name}`}
                  className="mr-2 rounded px-1.5 py-1 text-xs text-text-tertiary opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100 focus-visible:opacity-100"
                >
                  ✦
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-6">
        <p className="mb-3 px-1 text-xs leading-5 text-text-tertiary">CSV, PostgreSQL, Snowflake, BigQuery, S3, and GCS sources available.</p>
        <Button variant="primary" onClick={onAddDataset} className="w-full justify-center">
          <span aria-hidden="true" className="mr-2">+</span>Add data product
        </Button>
      </div>
    </aside>
  )
}
