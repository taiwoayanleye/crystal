import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--color-bg-base)',
        surface: 'var(--color-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-hover': 'var(--color-bg-hover)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-default': 'var(--color-border-default)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        accent: 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        'data-green': 'var(--color-data-green)',
        'data-blue': 'var(--color-data-blue)',
        'data-amber': 'var(--color-data-amber)',
        'success-dim': 'var(--color-success-dim)',
        'warning-dim': 'var(--color-warning-dim)',
        'error-dim': 'var(--color-error-dim)',
        primary: 'var(--color-primary)',
        navy: 'var(--color-navy)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        'text-dark': 'var(--color-text-dark)',
        'text-light': 'var(--color-text-light)',
        'bg-subtle': 'var(--color-bg-subtle)',
        white: 'var(--color-white)',
        border: 'var(--color-border)',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'page-title': ['32px', { fontWeight: '700', lineHeight: '1.2' }],
        'section-title': ['20px', { fontWeight: '600', lineHeight: '1.3' }],
        'body': ['14px', { fontWeight: '400', lineHeight: '1.5' }],
        'small': ['12px', { fontWeight: '400', lineHeight: '1.4' }],
        'metric': ['24px', { fontWeight: '700', lineHeight: '1.2', fontFamily: 'monospace' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px var(--shadow-alpha, rgba(0,0,0,0.05))',
        'md': '0 4px 6px var(--shadow-alpha, rgba(0,0,0,0.1))',
        'lg': '0 10px 15px var(--shadow-alpha, rgba(0,0,0,0.1))',
      },
    },
  },
  plugins: [],
}
export default config
