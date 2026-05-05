'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import IconButton from '@/components/ui/IconButton'
import Button from '@/components/ui/Button'
import { Pencil, Trash2, Eye, Download, ChevronDown } from 'lucide-react'
import { Search } from 'lucide-react'
import type { Style } from './types'

interface Props {
  styles: Style[]
  loading: boolean
  page: number
  totalPages: number
  totalCount: number
  search: string
  buyerFilter: string
  statusFilter: string
  onSearchChange: (v: string) => void
  onBuyerChange: (v: string) => void
  onStatusChange: (v: string) => void
  onPageChange: (p: number) => void
  onPerPageChange: (n: number) => void
  onAdd: () => void
  onEdit: (s: Style) => void
  onDelete: (s: Style) => void
  onView: (uuid: string) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function fmt(n: number | undefined) {
  if (n === undefined || n === null) return '—'
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export default function StyleList({
  styles, loading, page, totalPages, totalCount,
  search, buyerFilter, statusFilter,
  onSearchChange, onBuyerChange, onStatusChange,
  onPageChange, onPerPageChange,
  onAdd, onEdit, onDelete, onView,
}: Props) {
  const [buyerInput, setBuyerInput] = useState(buyerFilter)

  const columns = [
    {
      key: 'buyer',
      header: 'Buyer',
      render: (row: Style) => <span className="text-t-body font-medium">{row.buyer}</span>,
    },
    {
      key: 'style_no',
      header: 'Style No.',
      render: (row: Style) => <span className="font-mono text-xs text-t-body">{row.style_no || '—'}</span>,
    },
    {
      key: 'style_name',
      header: 'Style Name',
      render: (row: Style) => <span className="text-accent font-semibold">{row.style_name}</span>,
    },
    {
      key: 'sam',
      header: 'SAM',
      render: (row: Style) => <span className="text-t-body text-xs">{fmt(row.sam)}</span>,
    },
    {
      key: 'target_hun_hr',
      header: '100%/Hr',
      render: (row: Style) => <span className="font-semibold text-accent text-xs">{fmt(row.target_hun_hr)}</span>,
    },
    {
      key: 'target_six_hr',
      header: '60% Target',
      render: (row: Style) => <span className="text-t-body text-xs">{fmt(row.target_six_hr)}</span>,
    },
    {
      key: 'req_manning',
      header: 'Req Manni',
      render: (row: Style) => <span className="text-t-body text-xs">{fmt(row.req_manning)}</span>,
    },
    {
      key: 'all_manning',
      header: 'Alloc Manni',
      render: (row: Style) => <span className="text-t-body text-xs">{fmt(row.all_manning)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Style) => (
        <Badge variant={row.status === 1 ? 'success' : 'default'}>
          {row.status === 1 ? 'Active' : row.status === 2 ? 'Awaiting for Review' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Style) => (
        <div className="flex gap-1.5 items-center">
          <IconButton variant="accent" onClick={() => onView(row.uuid)} title="View"><Eye size={13} /></IconButton>
          <IconButton variant="accent" onClick={() => onEdit(row)} title="Edit"><Pencil size={13} /></IconButton>
          <IconButton variant="danger" onClick={() => onDelete(row)} title="Delete"><Trash2 size={13} /></IconButton>
        </div>
      ),
    },
  ]

  // Unique buyers for the buyer filter dropdown
  const buyers = Array.from(new Set(styles.map(s => s.buyer).filter(Boolean)))

  return (
    <>
      {/* Info banner */}
      <div className="mx-5 mt-4 mb-1 px-4 py-2.5 rounded-lg" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.35)' }}>
        <p className="text-xs font-medium" style={{ color: '#c2410c' }}>
          Styles are auto-created when you save an Operation Bulletin (OB). Click &ldquo;Add from OBS&rdquo; to open the OB editor and save a new style.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2.5 px-5 py-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[260px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
          <input
            value={search}
            onChange={e => { onSearchChange(e.target.value); onPageChange(1) }}
            placeholder="Search styles..."
            className="w-full h-8 pl-8 pr-3 text-sm2 bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary"
          />
        </div>

        {/* Buyer filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-t-lighter whitespace-nowrap">Buyer:</span>
          <div className="relative">
            <select
              value={buyerFilter}
              onChange={e => { onBuyerChange(e.target.value); onPageChange(1) }}
              className="h-8 pl-3 pr-7 text-sm2 bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary appearance-none cursor-pointer"
            >
              <option value="">All Buyer</option>
              {buyers.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-t-lighter whitespace-nowrap">Status</span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => { onStatusChange(e.target.value); onPageChange(1) }}
              className="h-8 pl-3 pr-7 text-sm2 bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
          </div>
        </div>

        <div className="flex-1" />

        {/* Export */}
        <button className="h-8 px-3 flex items-center gap-1.5 text-sm2 text-t-body bg-card border border-input-line rounded-input hover:bg-table-head transition-colors">
          <Download size={13} /> Export <ChevronDown size={11} />
        </button>

      </div>

      <DataTable<Style>
        columns={columns}
        data={styles}
        loading={loading}
        emptyMessage="No styles found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="style"
      />
    </>
  )
}
