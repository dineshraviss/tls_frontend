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
    <div className="fixed inset-0 flex font-[Inter,system-ui,sans-serif] bg-page transition-colors duration-300">
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/45 z-40"
        />
      )}

      <Sidebar
        isOpen={!isMobile || sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-card">
        <Header
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen(s => !s)}
        />
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'px-5 py-4'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
