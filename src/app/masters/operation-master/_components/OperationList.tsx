'use client'

import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import Badge from '@/components/ui/Badge'
import type { Operation, MachineTypeItem } from './types'

interface OperationListProps {
  operations: Operation[]
  loading: boolean
  search: string
  filterMachineTypeId: string
  allTypes: MachineTypeItem[]
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  openMenuId: number | null
  menuPos: { top: number; right: number }
  onSearchChange: (val: string) => void
  onFilterMachineTypeChange: (val: string) => void
  onAdd: () => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onView: (uuid: string) => void
  onMenuOpen: (e: React.MouseEvent<HTMLButtonElement>, id: number) => void
  onMenuClose: () => void
  onEdit: (operation: Operation) => void
  onDeleteTarget: (operation: Operation) => void
}

export default function OperationList({
  operations,
  loading,
  search,
  filterMachineTypeId,
  allTypes,
  page,
  perPage,
  totalPages,
  totalCount,
  openMenuId,
  menuPos,
  onSearchChange,
  onFilterMachineTypeChange,
  onAdd,
  onPageChange,
  onPerPageChange,
  onView,
  onMenuOpen,
  onMenuClose,
  onEdit,
  onDeleteTarget,
}: OperationListProps) {
  const columns = [
    {
      key: '#', header: '#',
      render: (_: Operation, i: number) => <span className="text-t-lighter text-xs">{(page - 1) * perPage + i + 1}</span>,
    },
    {
      key: 'code', header: 'Code',
      render: (row: Operation) => <span className="font-mono text-xs font-semibold text-t-body">{row.code || '—'}</span>,
    },
    {
      key: 'operation_name', header: 'Operation Name',
      render: (row: Operation) => <span className="text-accent font-semibold">{row.operation_name}</span>,
    },
    {
      key: 'machine_type', header: 'Machine Type',
      render: (row: Operation) => <span className="text-t-body text-xs">{row.machineType?.type_name ?? '—'}</span>,
    },
    {
      key: 'machine', header: 'Machine',
      render: (row: Operation) => (
        <span className="font-mono text-xs text-t-body">{row.machine?.machine_no ?? '—'}</span>
      ),
    },
    {
      key: 'sam', header: 'SAM',
      render: (row: Operation) => (
        <span className="font-mono text-xs font-semibold text-t-secondary">{row.sam || '—'}</span>
      ),
    },
    {
      key: 'defects', header: 'Defects',
      render: (row: Operation) => (
        <Badge variant="default">{row.defect_details?.length ?? row.defects?.length ?? 0}</Badge>
      ),
    },
    {
      key: 'view', header: '',
      render: (row: Operation) => (
        <button
          onClick={() => onView(row.uuid)}
          className="w-7 h-7 flex items-center justify-center rounded border border-table-line text-t-lighter hover:text-accent hover:border-accent transition-colors"
          title="View details"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ),
    },
    {
      key: 'actions', header: '',
      render: (row: Operation) => (
        <button
          onClick={e => onMenuOpen(e, row.id)}
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
        title="All Operations"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Operation"
      >
        <select
          value={filterMachineTypeId}
          onChange={e => onFilterMachineTypeChange(e.target.value)}
          className="h-8 px-2.5 text-sm2 cursor-pointer
            text-t-secondary bg-input
            border border-input-line rounded-input
            outline-none transition-colors
            focus:border-accent"
        >
          <option value="">All Machine Types</option>
          {allTypes.map(t => (
            <option key={t.id} value={t.id}>{t.type_name || t.name}</option>
          ))}
        </select>
      </Toolbar>

      <DataTable
        columns={columns}
        data={operations}
        loading={loading}
        emptyMessage="No operations found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="operation"
      />

      {openMenuId !== null && (
        <>
          <div className="fixed inset-0 z-[9990]" onClick={onMenuClose} />
          <div
            className="fixed z-[9991] bg-modal border border-table-line rounded-card shadow-lg py-1 min-w-[130px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              onClick={() => {
                const row = operations.find(o => o.id === openMenuId)
                if (row) onEdit(row)
                onMenuClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-t-body hover:bg-card-alt transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => {
                const row = operations.find(o => o.id === openMenuId)
                if (row) onDeleteTarget(row)
                onMenuClose()
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
