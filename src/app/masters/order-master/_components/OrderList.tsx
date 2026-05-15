'use client'

import { useState } from 'react'
import { Pencil, Trash2, Eye, MoreVertical, Download, Upload, Search } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import type { Order } from './types'

const SELECT_CLS =
  'h-8 px-2.5 pr-7 text-xs bg-card border border-input-line rounded-input outline-none focus:border-accent text-t-body appearance-none cursor-pointer'

interface OrderListProps {
  data: Order[]
  loading: boolean
  search: string
  colour: string
  status: string
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  colours: string[]
  onSearchChange: (v: string) => void
  onColourChange: (v: string) => void
  onStatusChange: (v: string) => void
  onAdd: () => void
  onEdit: (row: Order) => void
  onDelete: (row: Order) => void
  onView: (uuid: string) => void
  onPageChange: (p: number) => void
  onPerPageChange: (n: number) => void
}

export default function OrderList({
  data, loading, search, colour, status, page, perPage, totalPages, totalCount,
  colours, onSearchChange, onColourChange, onStatusChange,
  onAdd, onEdit, onDelete, onView, onPageChange, onPerPageChange,
}: OrderListProps) {
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
      render: (row: Order) => (
        <div>
          <p className="font-semibold text-t-primary text-xs">{row.order_no}</p>
          {row.style && (
            <p className="text-2xs text-t-lighter mt-0.5 truncate max-w-[140px]">
              {row.style.buyer} | {row.style.style_no} | {row.style.style_name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'colour',
      header: 'Colour',
      render: (row: Order) => <span className="text-xs text-t-body">{row.colour || '—'}</span>,
    },
    {
      key: 'order_qty',
      header: 'Order Qty',
      className: 'text-right',
      render: (row: Order) => (
        <span className="font-mono text-xs text-t-secondary">{row.order_qty.toLocaleString()}</span>
      ),
    },
    {
      key: 'prod_qty',
      header: 'Prod Qty',
      className: 'text-right',
      render: (row: Order) => (
        <span className="font-mono text-xs text-t-secondary">{row.prod_qty.toLocaleString()}</span>
      ),
    },
    {
      key: 'input_qty',
      header: 'Input Qty',
      className: 'text-right',
      render: (row: Order) => (
        <span className="font-mono text-xs text-t-secondary">{row.input_qty.toLocaleString()}</span>
      ),
    },
    {
      key: 'rej_qty',
      header: 'Rej Qty',
      className: 'text-right',
      render: (row: Order) => (
        <span className={`font-mono text-xs font-semibold ${row.rej_qty > 0 ? 'text-red-500' : 'text-t-secondary'}`}>
          {row.rej_qty.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'rej_per',
      header: 'Rej %',
      className: 'text-right',
      render: (row: Order) => <span className="font-mono text-xs text-t-secondary">{row.rej_per}%</span>,
    },
    {
      key: 'output_qty',
      header: 'Output Qty',
      className: 'text-right',
      render: (row: Order) => (
        <span className="font-mono text-xs text-t-secondary">{row.output_qty.toLocaleString()}</span>
      ),
    },
    {
      key: 'wip',
      header: 'WIP',
      className: 'text-right',
      render: (row: Order) => (
        <span className="font-mono text-xs text-t-secondary">{row.wip.toLocaleString()}</span>
      ),
    },
    {
      key: 'rework_qty',
      header: 'Rework',
      className: 'text-right',
      render: (row: Order) => (
        <span className="font-mono text-xs text-t-secondary">{row.rework_qty.toLocaleString()}</span>
      ),
    },
    {
      key: 'rework_per',
      header: 'RW%',
      className: 'text-right',
      render: (row: Order) => <span className="font-mono text-xs text-t-secondary">{row.rework_per}%</span>,
    },
    {
      key: 'is_active',
      header: 'Active',
      render: (row: Order) => (
        <Badge variant={row.is_active === 1 ? 'success' : 'default'}>
          {row.is_active === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Order) => (
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
        <span className="text-sm font-semibold text-t-secondary hidden sm:inline">In-Process Orders</span>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
            <input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search in-process orders..."
              className="h-8 pl-8 pr-3 text-xs bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary w-52"
            />
          </div>
          <div className="relative">
            <select value={colour} onChange={e => onColourChange(e.target.value)} className={SELECT_CLS}>
              <option value="all">All Colour</option>
              {colours.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-t-lighter text-xs">▾</span>
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-2xs text-t-lighter pointer-events-none">Status:</span>
            <select
              value={status}
              onChange={e => onStatusChange(e.target.value)}
              className={`${SELECT_CLS} pl-14`}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-t-lighter text-xs">▾</span>
          </div>
          <button className="h-8 px-3 flex items-center gap-1.5 bg-card border border-input-line rounded-input text-xs text-t-body hover:bg-table-head transition-colors">
            <Download size={13} /> Export
          </button>
          <button className="h-8 px-3 flex items-center gap-1.5 bg-card border border-input-line rounded-input text-xs text-t-body hover:bg-table-head transition-colors">
            <Upload size={13} /> Import
          </button>
          <button
            onClick={onAdd}
            className="h-8 px-3.5 flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-input transition-colors"
          >
            + Add Order
          </button>
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
              onClick={() => { const row = data.find(d => d.id === openMenuId); if (row) onEdit(row); setOpenMenuId(null) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-t-body hover:bg-card-alt transition-colors"
            >
              <Pencil size={12} /> Edit
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
