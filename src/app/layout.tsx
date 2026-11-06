import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Crystal — Data-as-a-Product Platform',
  description: 'Treat data like a product with quality signals, outcome tracking, and source lineage.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-text-dark antialiased">
        {children}
      </body>
    </html>
  )
}
