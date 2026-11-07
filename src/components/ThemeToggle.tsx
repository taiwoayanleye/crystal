'use client'

import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crystal-theme') as Theme | null
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)
        document.documentElement.setAttribute('data-theme', saved)
      }
    } catch {}
  }, [])

  const cycle = () => {
    const next: Theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system'
    setTheme(next)
    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme')
      try { localStorage.removeItem('crystal-theme') } catch {}
    } else {
      document.documentElement.setAttribute('data-theme', next)
      try { localStorage.setItem('crystal-theme', next) } catch {}
    }
  }

  const icons: Record<Theme, string> = { system: '◐', dark: '●', light: '○' }
  const labels: Record<Theme, string> = { system: 'System theme', dark: 'Dark mode', light: 'Light mode' }

  return (
    <button
      type="button"
      onClick={cycle}
      title={labels[theme]}
      aria-label={labels[theme]}
      className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-smooth"
    >
      {icons[theme]}
    </button>
  )
}
