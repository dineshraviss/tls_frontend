'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown, ChevronRight, LayoutDashboard, X } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

const TEAL      = '#2DB3A0'
const ACTIVE_BG = 'rgba(45,179,160,0.12)'

const navSections = [
  {
    title: 'MASTERS',
    defaultOpen: true,
    items: [
      { label: 'Company Master',    route: '/masters/company-master' },
      { label: 'Branch Master',     route: '/masters/branch-master' },
      { label: 'Zone Master',       route: '/masters/zone-master' },
      { label: 'Shift Master',      route: '/masters/shift-master' },
      { label: 'Work List Master',  route: '/masters/work-list-master' },
      { label: 'Machine Hub',       route: '/masters/machine-hub' },
      { label: 'Operation Master',  route: '/masters/operation-master' },
      { label: 'Line Master',       route: '/masters/line-master' },
      { label: 'Order Master',      route: '/masters/order-master' },
      { label: 'Style Master',      route: '/masters/style-master' },
      { label: 'Employee Master',   route: '/masters/employee-master' },
      { label: 'Defect Master',     route: '/masters/defect-master' },
    ],
  },
  {
    title: 'CONFIGURATION',
    defaultOpen: false,
    items: [
      { label: 'TLS ID Registration', route: '/configuration/tls-id-registration' },
      { label: 'TLS & Line Mapping',  route: '/configuration/tls-line-mapping' },
    ],
  },
  {
    title: 'EXECUTION',
    defaultOpen: false,
    items: [
      { label: 'Notifications',    route: '/notifications' },
      { label: 'Approval Centre',  route: '/approval-centre' },
    ],
  },
  {
    title: 'TRACKERS',
    defaultOpen: false,
    items: [],
  },
  {
    title: 'REPORTS',
    defaultOpen: false,
    items: [],
  },
]

interface SidebarProps {
  isOpen: boolean
  isMobile: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, isMobile, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const BG      = isDark ? '#141620' : 'rgb(237, 242, 247)'
  const NAVY    = isDark ? '#CBD5E0' : '#1B3A6B'
  const MUTED   = isDark ? '#8B95A5' : '#718096'
  const SECTION = isDark ? '#6B7688' : '#A0AEC0'

  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(navSections.map(s => [s.title, s.defaultOpen ?? false]))
  )

  const isActive = (route: string) => pathname === route

  const handleNav = (route: string) => {
    router.push(route)
    if (isMobile) onClose()
  }

  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0, left: 0,
        height: '100%',
        width: 220,
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        background: BG,
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none',
        borderRight: '1px solid var(--color-sidebar-border)',
      }
    : {
        width: 200,
        minWidth: 200,
        maxWidth: 200,
        height: '100%',
        background: BG,
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        borderRight: '1px solid var(--color-sidebar-border)',
      }

  return (
    <div id="iq-sidebar" style={sidebarStyle}>

      {/* Logo */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid var(--color-sidebar-border)',
        flexShrink: 0,
        background: BG,
        backgroundColor: BG,
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="" width={26} height={26} />
          <span style={{ color: NAVY, fontWeight: 700, fontSize: 14, letterSpacing: '0.04em' }}>
            iQ2 TLS
          </span>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: MUTED, display: 'flex', alignItems: 'center' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 0', background: BG, backgroundColor: BG }}>

        {/* Dashboard */}
        <div
          onClick={() => handleNav('/dashboard')}
          style={{
            margin: '4px 10px',
            padding: '8px 12px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: pathname === '/dashboard' ? TEAL : 'transparent',
            cursor: 'pointer',
          }}
        >
          <LayoutDashboard size={14} color={pathname === '/dashboard' ? '#fff' : NAVY} />
          <span style={{ color: pathname === '/dashboard' ? '#fff' : NAVY, fontSize: 13, fontWeight: 500 }}>
            Dashboard
          </span>
        </div>

        {/* Sections */}
        {navSections.map(section => (
          <div key={section.title} style={{ marginTop: 4, background: BG, backgroundColor: BG }}>

            <button
              onClick={() => setOpen(p => ({ ...p, [section.title]: !p[section.title] }))}
              style={{
                width: '100%',
                padding: '7px 16px 4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: SECTION, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
                {section.title}
              </span>
              {open[section.title]
                ? <ChevronDown size={11} color={SECTION} />
                : <ChevronRight size={11} color={SECTION} />}
            </button>

            {open[section.title] && section.items.map(item => (
              <button
                key={item.label}
                onClick={() => handleNav(item.route)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 22px',
                  background: isActive(item.route) ? ACTIVE_BG : 'none',
                  border: 'none',
                  borderLeft: isActive(item.route) ? `3px solid ${TEAL}` : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ color: isActive(item.route) ? TEAL : MUTED, fontSize: 11 }}>&#8226;</span>
                <span style={{
                  fontSize: 12.5,
                  color: isActive(item.route) ? TEAL : NAVY,
                  fontWeight: isActive(item.route) ? 600 : 400,
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  )
}
