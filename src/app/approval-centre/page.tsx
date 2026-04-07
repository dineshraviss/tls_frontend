'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { AlertTriangle, QrCode, WifiOff, UserPlus } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'

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
  { id: 1, icon: <AlertTriangle size={14} />, iconBg: 'bg-[#FEEBC8]', title: 'New Defect Category', subtitle: 'Category "Finishing Defects" submitted for approval', meta: 'Defect Master | 30 Sec', status: 'Pending' },
  { id: 2, icon: <QrCode size={14} />, iconBg: 'bg-[#EBF8FF]', title: 'QR Save Request', subtitle: 'QR for Buyer: Kath | Style: Jogger Pants pending sign-of', meta: 'QR Save | 30 Sec', status: 'Pending' },
  { id: 3, icon: <QrCode size={14} />, iconBg: 'bg-[#EBF8FF]', title: 'QR Save Request', subtitle: 'QR for Buyer: Kath | Style: Jogger Pants pending sign-of', meta: 'QR Save | 30 Sec', status: 'Pending' },
  { id: 4, icon: <WifiOff size={14} />, iconBg: 'bg-[#FED7D7]', title: 'TLS Device Offline', subtitle: 'TLS-007 on Line 3 has not synced in 45 minutes...', meta: 'TLS Alert | Pending', status: 'Pending' },
  { id: 5, icon: <UserPlus size={14} />, iconBg: 'bg-[#C6F6D5]', title: 'New Employee', subtitle: 'EMP-042 — Shia Dev | Sewing Operator pending approval', meta: 'Employee | Pending', status: 'Pending' },
]

const stats = [
  { label: 'Pending', value: 5, color: 'text-[#DD6B20]' },
  { label: 'Approved', value: 486, color: 'text-[#276749]' },
  { label: 'Rejected', value: 9, color: 'text-[#9B2C2C]' },
]

type TabType = 'All' | 'Pending' | 'Approved' | 'Rejected'

export default function ApprovalCentrePage() {
  const [activeTab, setActiveTab] = useState<TabType>('All')
  const filtered = activeTab === 'All' ? items : items.filter(i => i.status === activeTab)

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Order Master' }, { label: 'Approval Centre', active: true }]} />
      <PageHeader title="Approval Centre" description="Review and approve or reject pending requests from all modules." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 max-w-[400px]">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-lg px-4 py-3.5 shadow-sm text-center">
            <p className={`m-0 mb-1 text-[22px] font-bold ${s.color}`}>{s.value}</p>
            <p className="m-0 text-[11px] text-t-lighter">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-header-line mb-4">
        {(['All', 'Pending', 'Approved', 'Rejected'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-[7px] border-none bg-transparent cursor-pointer text-[13px] font-inherit -mb-px
              ${activeTab === tab
                ? 'font-semibold text-accent border-b-2 border-b-accent'
                : 'font-normal text-t-light border-b-2 border-b-transparent'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-t-lighter text-[13px]">No items</div>
        ) : filtered.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 px-[18px] py-3.5 ${i < filtered.length - 1 ? 'border-b border-table-line' : ''}`}
          >
            <div className={`w-[34px] h-[34px] rounded-full ${item.iconBg} flex items-center justify-center shrink-0 text-t-body`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-0.5 text-[13px] font-semibold text-t-secondary">{item.title}</p>
              <p className="m-0 mb-1 text-xs text-t-light">{item.subtitle}</p>
              <p className="m-0 text-[11px] text-t-lighter">{item.meta}</p>
            </div>
            <div className="flex gap-1.5 shrink-0 items-center">
              <button className="h-7 px-3 bg-[#C6F6D5] border-none rounded-[5px] text-xs text-[#276749] font-semibold cursor-pointer font-inherit hover:bg-[#9AE6B4]/50">
                Approve
              </button>
              <button className="h-7 px-3 bg-[#FED7D7] border-none rounded-[5px] text-xs text-[#9B2C2C] font-semibold cursor-pointer font-inherit hover:bg-[#FEB2B2]/50">
                Decline
              </button>
              <button className="h-7 px-3 bg-card border border-input-line rounded-[5px] text-xs text-t-body cursor-pointer font-inherit hover:bg-table-head">
                View &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
