'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Moon, Lock, Settings, Bell, ChevronDown, Menu, LogOut } from 'lucide-react'
import { clearAuthCookies, getAuthUser } from '@/lib/cookies'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  isMobile: boolean
  onMenuToggle: () => void
}

export default function Header({ isMobile, onMenuToggle }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = mounted ? now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const timeStr = mounted ? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''
  const shift = useMemo(() => {
    if (!mounted) return ''
    const h = now.getHours()
    if (h >= 6 && h < 14) return 'Morning'
    if (h >= 14 && h < 22) return 'Evening'
    return 'Night'
  }, [now, mounted])

  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const user = mounted ? getAuthUser() : null
  const userName = (user?.name as string) || (user?.username as string) || 'Admin User'
  const userRole = (user?.role as string) || 'Super Admin'
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    clearAuthCookies()
    router.push('/login')
  }

  return (
    <div style={{
      height: 56,
      flexShrink: 0,
      backgroundColor: 'var(--color-header-bg)',
      borderBottom: '1px solid var(--color-header-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 12px' : '0 20px',
      gap: 12,
    }}>
      {/* Left: hamburger (mobile) + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isMobile && (
          <button
            onClick={onMenuToggle}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: '#4A5568', display: 'flex', alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 13 : 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            Operations Dashboard
          </h1>
          {!isMobile && (
            <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0' }}>Line Real-time monitoring</p>
          )}
        </div>
      </div>

      {/* Right: meta + icons + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
        {/* Date / time / shift — hide on mobile */}
        {!isMobile && (
          <span style={{ fontSize: 12, color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>
            {dateStr} &nbsp;|&nbsp; {timeStr} &nbsp;|&nbsp; Shift: {shift}
          </span>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: isDark ? '#F6AD55' : '#718096', display: 'flex', alignItems: 'center',
            transition: 'color 0.2s',
          }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Other icon buttons */}
        {(isMobile ? [Bell] : [Lock, Settings, Bell]).map((Icon, i) => (
          <button
            key={i}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: 'var(--color-text-light)', display: 'flex', alignItems: 'center',
            }}
          >
            <Icon size={17} />
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--color-header-border)' }} />

        {/* User with dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, cursor: 'pointer' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: '#2DB3A0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{initials}</span>
            </div>
            {!isMobile && (
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>{userName}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--color-text-lighter)' }}>{userRole}</p>
              </div>
            )}
            <ChevronDown size={14} color="#A0AEC0" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              backgroundColor: 'var(--color-dropdown-bg)',
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              border: '1px solid var(--color-border)',
              minWidth: 180,
              zIndex: 200,
              overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-table-border)' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{userName}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-lighter)' }}>{userRole}</p>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: '#E53E3E',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFF5F5')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
