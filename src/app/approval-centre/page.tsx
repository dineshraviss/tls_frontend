'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { AlertTriangle, QrCode, WifiOff, UserPlus } from 'lucide-react'

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

interface ApprovalItem {
  id: number
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  meta: string
  status: ApprovalStatus
}

const items: ApprovalItem[] = [
  { id: 1, icon: <AlertTriangle size={14} />, iconBg: '#FEEBC8', title: 'New Defect Category', subtitle: 'Category "Finishing Defects" submitted for approval', meta: 'Defect Master | 30 Sec', status: 'Pending' },
  { id: 2, icon: <QrCode size={14} />,       iconBg: '#EBF8FF', title: 'QR Save Request',     subtitle: 'QR for Buyer: Kath | Style: Jogger Pants pending sign-of', meta: 'QR Save | 30 Sec', status: 'Pending' },
  { id: 3, icon: <QrCode size={14} />,       iconBg: '#EBF8FF', title: 'QR Save Request',     subtitle: 'QR for Buyer: Kath | Style: Jogger Pants pending sign-of', meta: 'QR Save | 30 Sec', status: 'Pending' },
  { id: 4, icon: <WifiOff size={14} />,      iconBg: '#FED7D7', title: 'TLS Device Offline',  subtitle: 'TLS-007 on Line 3 has not synced in 45 minutes...', meta: 'TLS Alert | Pending', status: 'Pending' },
  { id: 5, icon: <UserPlus size={14} />,     iconBg: '#C6F6D5', title: 'New Employee',        subtitle: 'EMP-042 — Shia Dev | Sewing Operator pending approval', meta: 'Employee | Pending', status: 'Pending' },
]

const stats = [
  { label: 'Pending',  value: 5,   color: '#DD6B20', bg: '#FEEBC8' },
  { label: 'Approved', value: 486, color: '#276749', bg: '#C6F6D5' },
  { label: 'Rejected', value: 9,   color: '#9B2C2C', bg: '#FED7D7' },
]

type TabType = 'All' | 'Pending' | 'Approved' | 'Rejected'

export default function ApprovalCentrePage() {
  const [activeTab, setActiveTab] = useState<TabType>('All')

  const filtered = activeTab === 'All' ? items : items.filter(i => i.status === activeTab)

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Order Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Approval Centre</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Approval Centre</h1>
        <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Review and approve or reject pending requests from all modules.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20, maxWidth: 400 }}>
        {stats.map(s => (
          <div key={s.label} style={{ backgroundColor: '#fff', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {(['All', 'Pending', 'Approved', 'Rejected'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '7px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? '#2DB3A0' : '#718096', borderBottom: activeTab === tab ? '2px solid #2DB3A0' : '2px solid transparent', marginBottom: -1, fontFamily: 'inherit' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No items</div>
        ) : filtered.map((item, i) => (
          <div
            key={item.id}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '1px solid #EDF2F7' : 'none' }}
          >
            <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4A5568' }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{item.title}</p>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#718096' }}>{item.subtitle}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0' }}>{item.meta}</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
              <button style={{ height: 28, padding: '0 12px', background: '#C6F6D5', border: 'none', borderRadius: 5, fontSize: 12, color: '#276749', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Approve
              </button>
              <button style={{ height: 28, padding: '0 12px', background: '#FED7D7', border: 'none', borderRadius: 5, fontSize: 12, color: '#9B2C2C', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Decline
              </button>
              <button style={{ height: 28, padding: '0 12px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 12, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>
                View &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
