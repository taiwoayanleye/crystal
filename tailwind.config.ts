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
        primary: '#0066FF',
        navy: '#001A4D',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        'text-dark': '#1F2937',
        'text-light': '#6B7280',
        'bg-subtle': '#F5F7FA',
        border: '#E5E7EB',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
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
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
export default config
