'use client'

import AppLayout from '@/components/layout/AppLayout'
import { ShoppingBag, AlertTriangle, QrCode, WifiOff, UserPlus, CheckCircle } from 'lucide-react'

interface Notification {
  id: number
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  tag?: { label: string; color: string; bg: string }
  time: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: 1,
    icon: <ShoppingBag size={14} />, iconBg: '#EBF8FF',
    title: 'New Order Request [Kin]',
    subtitle: 'Order #17295 — Blue: 13,000 pcs pending approval',
    tag: { label: 'Approved', color: '#276749', bg: '#C6F6D5' },
    time: '10m ago', read: false,
  },
  {
    id: 2,
    icon: <AlertTriangle size={14} />, iconBg: '#FEEBC8',
    title: 'New Defect Category',
    subtitle: 'Category "Finishing Defector" submitted for approval',
    time: '20m ago', read: false,
  },
  {
    id: 3,
    icon: <QrCode size={14} />, iconBg: '#EBF8FF',
    title: 'QR Scan Request',
    subtitle: 'QR for Buyer: Kath | Style: Jogger Pants pending sign-of',
    time: '20m ago', read: false,
  },
  {
    id: 4,
    icon: <WifiOff size={14} />, iconBg: '#FED7D7',
    title: 'TLS Device Offline',
    subtitle: 'QR for Buyer: Kath | Style: Jogger Pants pending sign-of',
    time: '30m ago', read: true,
  },
  {
    id: 5,
    icon: <UserPlus size={14} />, iconBg: '#C6F6D5',
    title: 'New Employee Registration',
    subtitle: 'EMP-042 — Shia Dev | Sewing Operator pending approval',
    time: '40m ago', read: true,
  },
  {
    id: 6,
    icon: <QrCode size={14} />, iconBg: '#EBF8FF',
    title: 'QR scan',
    subtitle: 'QR #1333 | Legging | appended approval',
    time: '50m ago', read: true,
  },
  {
    id: 7,
    icon: <CheckCircle size={14} />, iconBg: '#C6F6D5',
    title: 'New Account created',
    subtitle: 'Last Administrator: A/c 11:1',
    time: '90m ago', read: true,
  },
]

export default function NotificationsPage() {
  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Order Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Notifications</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Notifications</h1>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#2DB3A0', fontFamily: 'inherit', padding: 0 }}>
          Mark all as read &#10003;
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {notifications.map((n, i) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '14px 18px',
              borderBottom: i < notifications.length - 1 ? '1px solid #EDF2F7' : 'none',
              backgroundColor: n.read ? '#fff' : 'rgba(45,179,160,0.03)',
            }}
          >
            {/* Icon */}
            <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4A5568' }}>
              {n.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: n.read ? 500 : 600, color: '#2D3748' }}>{n.title}</p>
                {n.tag && (
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 10, backgroundColor: n.tag.bg, color: n.tag.color }}>
                    {n.tag.label}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>{n.subtitle}</p>
            </div>

            {/* Time + unread dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#A0AEC0', whiteSpace: 'nowrap' }}>{n.time}</span>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#2DB3A0' }} />}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
