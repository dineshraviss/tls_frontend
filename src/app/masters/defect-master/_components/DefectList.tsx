'use client'

import { useState } from 'react'
import { Pencil, Trash2, Clock, MoreVertical } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Toolbar from '@/components/ui/Toolbar'
import DataTable from '@/components/ui/DataTable'
import type { Defect } from './types'

function severityBadge(severity: unknown) {
  const s = String(severity ?? '').toLowerCase()
  if (s === 'critical') return <Badge variant="error">Critical</Badge>
  if (s === 'major') return <Badge variant="warning">Major</Badge>
  return <Badge variant="success">Minor</Badge>
}

interface DefectListProps {
  data: Defect[]
  loading: boolean
  search: string
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  onSearchChange: (val: string) => void
  onAdd: () => void
  onEdit: (row: Defect) => void
  onDelete: (row: Defect) => void
  onView: (uuid: string) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export default function DefectList({
  data,
  loading,
  search,
  page,
  perPage,
  totalPages,
  totalCount,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onPageChange,
  onPerPageChange,
}: DefectListProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpenMenuId(id)
  }

  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Defect, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * perPage + i + 1}</span>
      ),
    },
    {
      key: 'code',
      header: 'Defect Code',
      render: (row: Defect) => (
        <span className="font-mono text-xs font-semibold text-t-body">{row.code || '—'}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: Defect) => <span className="text-t-body text-xs">{row.category}</span>,
    },
    {
      key: 'defect_name',
      header: 'Defect Name',
      render: (row: Defect) => (
        <span className="text-accent font-semibold">{row.defect_name}</span>
      ),
    },
    {
      key: 'caps',
      header: 'CAP',
      render: (row: Defect) => (
        <span className="flex items-center gap-1 text-xs text-t-lighter">
          <Clock size={12} />{row.caps_count ?? row.caps?.length ?? 0}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row: Defect) => severityBadge(row.severity),
    },
    {
      key: 'department',
      header: 'Designation',
      render: (row: Defect) => (
        <span className="text-t-body text-xs">{row.department?.name ?? '—'}</span>
      ),
    },
    {
      key: 'view',
      header: '',
      render: (row: Defect) => (
        <button
          onClick={() => onView(row.uuid)}
          className="w-7 h-7 flex items-center justify-center rounded border border-table-line text-t-lighter hover:text-accent hover:border-accent transition-colors"
          title="View CAPs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Defect) => (
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
      <Toolbar
        title="All Defects"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Defect"
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No defects found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="defect"
      />

      {/* Fixed-position dropdown — escapes overflow:hidden */}
      {openMenuId !== null && (
        <>
          <div className="fixed inset-0 z-[9990]" onClick={() => setOpenMenuId(null)} />
          <div
            className="fixed z-[9991] bg-modal border border-table-line rounded-card shadow-lg py-1 min-w-[130px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              onClick={() => {
                const row = data.find(d => d.id === openMenuId)
                if (row) onEdit(row)
                setOpenMenuId(null)
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-t-body hover:bg-card-alt transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => {
                const row = data.find(d => d.id === openMenuId)
                if (row) onDelete(row)
                setOpenMenuId(null)
              }}
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
