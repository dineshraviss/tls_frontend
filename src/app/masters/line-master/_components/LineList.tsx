'use client'

import { Pencil, Trash2, Eye } from 'lucide-react'
import Toolbar from '@/components/ui/Toolbar'
import AdvancedTable, { type AdvancedColumn, type ActionItem } from '@/components/ui/AdvancedTable'
import { type Line, type Slot } from './types'

interface LineListProps {
  lines: Line[]
  loading: boolean
  search: string
  page: number
  totalPages: number
  totalCount: number
  selected: string[]
  onSearchChange: (val: string) => void
  onAdd: () => void
  onView: (uuid: string) => void
  onEdit: (line: Line) => void
  onDelete: (line: Line) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSelectionChange: (selected: string[]) => void
}

function formatTime(t?: string) {
  if (!t) return '—'
  const [h, m] = t.slice(0, 5).split(':')
  const hr = parseInt(h)
  const ampm = hr >= 12 ? 'PM' : 'AM'
  const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
  return `${h12}:${m} ${ampm}`
}

function getSlots5(row: Line) {
  const s = (row.slots ?? []).slice(0, 5)
  while (s.length < 5) s.push({ slot_name: `Slot-${s.length + 1}`, start: '', end: '' })
  return s
}

function renderSlotCell(slot: Slot) {
  return slot.start ? (
    <div className="text-xs2 whitespace-nowrap">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-stat-green"></span>
        <span className="text-t-body">S : {formatTime(slot.start)}</span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
        <span className="text-t-body">E : {formatTime(slot.end)}</span>
      </div>
    </div>
  ) : <span className="text-t-lighter">—</span>
}

export default function LineList({
  lines, loading, search, page, totalPages, totalCount, selected,
  onSearchChange, onAdd, onView, onEdit, onDelete,
  onPageChange, onPerPageChange, onSelectionChange,
}: LineListProps) {
  const columns: AdvancedColumn<Line>[] = [
    {
      key: 'zone',
      header: 'Zone',
      sortable: true,
      render: (row) => <span className="text-t-body">{row.zone?.zone_name ?? '—'}</span>,
    },
    {
      key: 'line_name',
      header: 'Line',
      sortable: true,
      render: (row) => <span className="text-t-body font-medium">{row.line_name}</span>,
    },
    ...([1, 2, 3, 4, 5].map(n => ({
      key: `slot-${n}`,
      header: `Slot-${n}`,
      render: (row: Line) => {
        const slots5 = getSlots5(row)
        return renderSlotCell(slots5[n - 1])
      },
      className: `!py-2`,
    })) as AdvancedColumn<Line>[]),
  ]

  const getActions = (row: Line): ActionItem[] => [
    {
      label: 'View',
      icon: <Eye size={13} />,
      onClick: () => onView(row.uuid),
    },
    {
      label: 'Edit',
      icon: <Pencil size={13} />,
      onClick: () => onEdit(row),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={13} />,
      onClick: () => onDelete(row),
      variant: 'danger',
    },
  ]

  return (
    <>
      <Toolbar
        title="All Lines"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Line"
      />
      <AdvancedTable
        columns={columns}
        data={lines}
        loading={loading}
        emptyMessage="No lines found"
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
        countLabel="line"
      />
    </>
  )
}
