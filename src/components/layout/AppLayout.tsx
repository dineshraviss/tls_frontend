'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useWindowSize } from '@/hooks/useWindowSize'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const width = useWindowSize()
  const isMobile = width < 768
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: 'var(--color-bg)',
      transition: 'background-color 0.3s',
    }}>
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 40,
          }}
        />
      )}

      <Sidebar
        isOpen={!isMobile || sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
        <Header
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen(s => !s)}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '16px 20px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
