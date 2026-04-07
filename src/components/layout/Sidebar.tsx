'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown, ChevronRight, LayoutDashboard, X } from 'lucide-react'

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

  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(navSections.map(s => [s.title, s.defaultOpen ?? false]))
  )

  const isActive = (route: string) => pathname === route

  const handleNav = (route: string) => {
    router.push(route)
    if (isMobile) onClose()
  }

  const mobileClass = isMobile
    ? `fixed top-0 left-0 h-full w-[220px] z-50 transition-transform duration-300 ease-in-out
       ${isOpen ? 'translate-x-0 shadow-[4px_0_20px_rgba(0,0,0,0.15)]' : '-translate-x-full'}`
    : 'w-[200px] min-w-[200px] max-w-[200px] h-full shrink-0'

  return (
    <div
      id="iq-sidebar"
      className={`flex flex-col overflow-hidden bg-sidebar border-r border-sidebar-line transition-colors duration-300 ${mobileClass}`}
    >

      {/* Logo */}
      <div className="px-4 h-14 flex items-center gap-2 shrink-0 justify-between border-b border-sidebar-line">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={28} height={28} />
          <span className="text-brand font-bold text-[15px] tracking-wide">iQ2 TLS</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-1 flex items-center text-t-lighter">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 bg-sidebar transition-colors duration-300">

        {/* Dashboard */}
        <div
          onClick={() => handleNav('/dashboard')}
          className={`mx-2.5 my-1 px-3 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors
            ${pathname === '/dashboard' ? 'bg-accent' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
        >
          <LayoutDashboard size={16} className={pathname === '/dashboard' ? 'text-white' : 'text-brand'} />
          <span className={`text-[13px] font-semibold ${pathname === '/dashboard' ? 'text-white' : 'text-brand'}`}>
            Dashboard
          </span>
        </div>

        {/* Sections */}
        {navSections.map(section => (
          <div key={section.title} className="mt-2">
            <button
              onClick={() => setOpen(p => ({ ...p, [section.title]: !p[section.title] }))}
              className="w-full px-4 pt-2 pb-1 bg-transparent border-none cursor-pointer flex items-center justify-between"
            >
              <span className="text-t-lighter text-[10px] font-bold tracking-[0.1em]">
                {section.title}
              </span>
              {open[section.title]
                ? <ChevronDown size={12} className="text-t-lighter" />
                : <ChevronRight size={12} className="text-t-lighter" />}
            </button>

            {open[section.title] && section.items.map(item => {
              const active = isActive(item.route)
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.route)}
                  className={`w-full py-[7px] pr-3 pl-5 bg-transparent border-none cursor-pointer
                    flex items-center gap-2 text-left font-inherit transition-colors
                    border-l-[3px] ${active
                      ? 'border-l-accent bg-accent/[0.08]'
                      : 'border-l-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <span className={`text-[11px] ${active ? 'text-accent' : 'text-t-lighter'}`}>&#8226;</span>
                  <span className={`text-[13px] ${active ? 'text-accent font-semibold' : 'text-t-secondary font-normal'}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )
}
