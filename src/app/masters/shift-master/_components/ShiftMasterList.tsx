'use client'

import { Eye, Pencil, Trash2 } from 'lucide-react'
import AdvancedTable, { type AdvancedColumn, type ActionItem } from '@/components/ui/AdvancedTable'
import Toolbar from '@/components/ui/Toolbar'
import Badge from '@/components/ui/Badge'
import { type Shift } from './types'

interface ShiftMasterListProps {
  shifts: Shift[]
  loading: boolean
  search: string
  onSearchChange: (val: string) => void
  onAdd: () => void
  onEdit: (shift: Shift) => void
  onDelete: (shift: Shift) => void
  onView: (uuid: string) => void
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  page: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  activeTab: 'Shift(s)' | 'Calendar'
  onTabChange: (tab: 'Shift(s)' | 'Calendar') => void
}

function formatTime12(t?: string): string {
  if (!t) return '—'
  const [h, m] = t.slice(0, 5).split(':')
  const hr = parseInt(h)
  const ampm = hr >= 12 ? 'PM' : 'AM'
  const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`
}

function typeColor(type: string): string {
  switch (type?.toLowerCase()) {
    case 'morning': return 'text-success-text bg-success-bg'
    case 'afternoon': return 'text-info-text bg-info-bg'
    case 'night': return 'text-error-text bg-error-bg'
    default: return 'text-t-body bg-card-alt'
  }
}

export default function ShiftMasterList({
  shifts,
  loading,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onView,
  selected,
  onSelectionChange,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onPerPageChange,
  activeTab,
  onTabChange,
}: ShiftMasterListProps) {
  const columns: AdvancedColumn<Shift>[] = [
    {
      key: 'factory',
      header: 'Factory',
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-t-secondary block font-medium">{row.branch?.branch_name ?? '—'}</span>
          <span className="text-t-lighter text-2xs">{row.zone?.zone_name ?? ''}</span>
        </div>
      ),
    },
    {
      key: 'shift_name',
      header: 'Shift Name',
      sortable: true,
      render: (row) => <span className="text-accent font-medium">{row.shift_name}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`inline-block px-2.5 py-0.5 rounded text-xs2 font-medium capitalize ${typeColor(row.type)}`}>
          {row.type}
        </span>
      ),
    },
    { key: 'start_time', header: 'Start', render: (row) => <span className="text-t-body">{formatTime12(row.start_time)}</span> },
    { key: 'end_time', header: 'End', render: (row) => <span className="text-t-body">{formatTime12(row.end_time)}</span> },
    { key: 'hrs', header: 'Hrs', render: (row) => <span className="text-t-body font-semibold">{row.hrs}h</span> },
    { key: 'breakMins', header: 'Break', render: (row) => <span className="text-t-body">{row.breakMins}m</span> },
    { key: 'buffer', header: 'Buffer ti...', render: (row) => <span className="text-t-body">{row.start_buffer_time?.slice(0, 5) ?? '—'}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.is_active === 1 ? 'success' : 'default'}>{row.is_active === 1 ? 'Active' : 'Inactive'}</Badge> },
  ]

  const getActions = (row: Shift): ActionItem[] => [
    { label: 'View', icon: <Eye size={13} />, onClick: () => onView(row.uuid) },
    { label: 'Edit', icon: <Pencil size={13} />, onClick: () => onEdit(row) },
    { label: 'Delete', icon: <Trash2 size={13} />, onClick: () => onDelete(row), variant: 'danger' },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-0 border-b border-header-line">
          {(['Shift(s)', 'Calendar'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 border-none bg-transparent cursor-pointer text-sm font-inherit select-none -mb-px
                ${activeTab === tab ? 'font-semibold text-accent border-b-2 border-b-accent' : 'font-normal text-t-light border-b-2 border-b-transparent'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Toolbar
          search={search}
          onSearchChange={onSearchChange}
          onAdd={onAdd}
          addLabel="Add Shift"
        />
      </div>

      {activeTab === 'Shift(s)' ? (
        <AdvancedTable
          columns={columns}
          data={shifts}
          loading={loading}
          emptyMessage="No shifts found"
          rowKey={(row) => row.uuid}
          selectable
          selected={selected}
          onSelectionChange={onSelectionChange}
          actions={getActions}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          countLabel="shift"
        />
      ) : (
        <div className="bg-card rounded-card border border-header-line p-8 text-center text-t-lighter text-sm">
          Calendar view coming soon
        </div>
      )}
    </>
  )
}
