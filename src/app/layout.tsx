import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Crystal — Data-as-a-Product Platform',
  description: 'Treat data like a product with quality signals, outcome tracking, and source lineage.',
  openGraph: {
    title: 'Crystal — Data-as-a-Product Platform',
    description: 'Quality signals, outcome tracking, and source lineage for every dataset.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crystal — Data-as-a-Product Platform',
    description: 'Quality signals, outcome tracking, and source lineage for every dataset.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
