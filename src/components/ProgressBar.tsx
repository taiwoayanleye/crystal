interface ProgressBarProps {
  value: number // 0-100
  color?: 'success' | 'primary' | 'warning' | 'error'
  height?: 'sm' | 'md' | 'lg'
  label?: string
}

export function ProgressBar({ value, color = 'success', height = 'sm', label }: ProgressBarProps) {
  const colorMap = {
    success: 'bg-success',
    primary: 'bg-primary',
    warning: 'bg-warning',
    error: 'bg-error',
  }

  const heightMap = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  }

  const clampedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div>
      {label && <p className="text-small text-text-light mb-xs">{label}</p>}
      <div className="w-full bg-border rounded-sm overflow-hidden" style={{ height: '6px' }}>
        <div
          className={`${colorMap[color]} rounded-sm transition-smooth`}
          style={{ width: `${clampedValue}%`, height: '100%' }}
        />
      </div>
    </div>
  )
}
