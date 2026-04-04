import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'

export const metadata: Metadata = {
  title: 'iQ2 TLS',
  description: 'iQ2 Thread Locked Stitches - Operations Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
