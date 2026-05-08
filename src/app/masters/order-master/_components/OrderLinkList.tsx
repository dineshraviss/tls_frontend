'use client'

import { useState } from 'react'
import { Trash2, Eye, MoreVertical, Search } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import type { LinkOrder } from './types'

const SELECT_CLS =
  'h-8 px-2.5 pr-7 text-xs bg-card border border-input-line rounded-input outline-none focus:border-accent text-t-body appearance-none cursor-pointer'

interface OrderLinkListProps {
  data: LinkOrder[]
  loading: boolean
  search: string
  status: string
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  onSearchChange: (v: string) => void
  onStatusChange: (v: string) => void
  onView: (uuid: string) => void
  onDelete: (row: LinkOrder) => void
  onPageChange: (p: number) => void
  onPerPageChange: (n: number) => void
}

export default function OrderLinkList({
  data, loading, search, status, page, perPage, totalPages, totalCount,
  onSearchChange, onStatusChange, onView, onDelete, onPageChange, onPerPageChange,
}: OrderLinkListProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpenMenuId(id)
  }

  const columns = [
    {
      key: 'order_no',
      header: 'Order No.',
      render: (row: LinkOrder) => (
        <span className="font-semibold text-t-primary text-xs">{row.order_no}</span>
      ),
    },
    {
      key: 'colour',
      header: 'Colour',
      render: (row: LinkOrder) => <span className="text-xs text-t-body">{row.colour || '—'}</span>,
    },
    {
      key: 'order_code',
      header: 'Order Code',
      render: (row: LinkOrder) => (
        <span className="font-mono text-xs text-t-secondary">{row.order_code || '—'}</span>
      ),
    },
    {
      key: 'style',
      header: 'Style',
      render: (row: LinkOrder) =>
        row.style ? (
          <div>
            <p className="text-xs font-semibold text-accent">{row.style.style_name}</p>
            <p className="text-2xs text-t-lighter mt-0.5">{row.style.buyer} · {row.style.style_no}</p>
          </div>
        ) : (
          <span className="text-xs text-t-lighter">—</span>
        ),
    },
    {
      key: 'link_status',
      header: 'Status',
      render: (row: LinkOrder) => (
        <Badge variant={row.style_id ? 'success' : 'warning'}>
          {row.style_id ? 'Linked' : 'Unlinked'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: LinkOrder) => (
        <span className="text-2xs text-t-lighter">{row.created_at?.split(' ')[0] ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: LinkOrder) => (
        <button
          onClick={e => openMenu(e, row.id)}
          className="w-7 h-7 flex items-center justify-center rounded text-t-lighter hover:text-t-body hover:bg-card-alt transition-colors"
        >
          <MoreVertical size={14} />
        </button>
      ),
    },
  ]

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-table-line gap-2 flex-wrap bg-card">
        <span className="text-sm font-semibold text-t-secondary hidden sm:inline">Unlinked Orders</span>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
            <input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search orders..."
              className="h-8 pl-8 pr-3 text-xs bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary w-44"
            />
          </div>
          <div className="relative">
            <select value={status} onChange={e => onStatusChange(e.target.value)} className={SELECT_CLS}>
              <option value="all">All</option>
              <option value="linked">Linked</option>
              <option value="unlinked">Unlinked</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-t-lighter text-xs">▾</span>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No orders found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="order"
      />

      {openMenuId !== null && (
        <>
          <div className="fixed inset-0 z-[9990]" onClick={() => setOpenMenuId(null)} />
          <div
            className="fixed z-[9991] bg-modal border border-table-line rounded-card shadow-lg py-1 min-w-[130px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              onClick={() => { const row = data.find(d => d.id === openMenuId); if (row) onView(row.uuid); setOpenMenuId(null) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-t-body hover:bg-card-alt transition-colors"
            >
              <Eye size={12} /> View
            </button>
            <button
              onClick={() => { const row = data.find(d => d.id === openMenuId); if (row) onDelete(row); setOpenMenuId(null) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </>
      )}
    </>
  )
}
