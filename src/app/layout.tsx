import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Crystal — Data-as-a-Product Dashboard',
  description: 'Measure whether your datasets create business value',
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
