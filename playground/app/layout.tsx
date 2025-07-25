import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MORK Playground',
  description: 'UI playground to play with MORK.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
