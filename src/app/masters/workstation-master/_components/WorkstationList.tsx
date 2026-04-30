'use client'

import { Pencil, Trash2, Eye } from 'lucide-react'
import { PER_PAGE } from '@/lib/constants'
import Toolbar from '@/components/ui/Toolbar'
import DataTable from '@/components/ui/DataTable'
import IconButton from '@/components/ui/IconButton'
import Badge from '@/components/ui/Badge'
import { type Workstation } from './types'

interface WorkstationListProps {
  workstations: Workstation[]
  loading: boolean
  search: string
  page: number
  totalPages: number
  totalCount: number
  onSearchChange: (val: string) => void
  onAdd: () => void
  onView: (uuid: string) => void
  onEdit: (ws: Workstation) => void
  onDelete: (ws: Workstation) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export default function WorkstationList({
  workstations, loading, search, page, totalPages, totalCount,
  onSearchChange, onAdd, onView, onEdit, onDelete,
  onPageChange, onPerPageChange,
}: WorkstationListProps) {
  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Workstation, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * PER_PAGE + i + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Workstation',
      render: (row: Workstation) => <span className="text-accent font-semibold">{row.name}</span>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (row: Workstation) => <span className="text-t-body font-mono text-xs">{row.code}</span>,
    },
    {
      key: 'line',
      header: 'Line',
      render: (row: Workstation) => <span className="text-t-body">{row.line?.line_name ?? '—'}</span>,
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (row: Workstation) => <span className="text-t-body">{row.branch?.branch_name ?? '—'}</span>,
    },
    {
      key: 'qr_code',
      header: 'QR Code',
      render: (row: Workstation) => <span className="text-t-body font-mono text-xs">{row.qr_code}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Workstation) => (
        <Badge variant={row.is_active === 1 ? 'success' : 'default'}>
          {row.is_active === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Workstation) => (
        <div className="flex gap-1.5 items-center">
          <IconButton variant="accent" onClick={() => onView(row.uuid)} title="View">
            <Eye size={13} />
          </IconButton>
          <IconButton variant="accent" onClick={() => onEdit(row)} title="Edit">
            <Pencil size={13} />
          </IconButton>
          <IconButton variant="danger" onClick={() => onDelete(row)} title="Delete">
            <Trash2 size={13} />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <>
      <Toolbar
        title="All Work stations"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Workstation"
      />
      <DataTable
        columns={columns}
        data={workstations}
        loading={loading}
        emptyMessage="No workstations found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="workstation"
      />
    </>
  )
}
