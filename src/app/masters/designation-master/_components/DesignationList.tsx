'use client'

import { Pencil, Trash2, Eye } from 'lucide-react'
import IconButton from '@/components/ui/IconButton'
import Badge from '@/components/ui/Badge'
import Toolbar from '@/components/ui/Toolbar'
import DataTable from '@/components/ui/DataTable'
import type { Designation } from './types'

interface DesignationListProps {
  data: Designation[]
  loading: boolean
  search: string
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  onSearchChange: (val: string) => void
  onAdd: () => void
  onEdit: (row: Designation) => void
  onDelete: (row: Designation) => void
  onView: (uuid: string) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export default function DesignationList({
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
}: DesignationListProps) {
  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Designation, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * perPage + i + 1}</span>
      ),
    },
    {
      key: 'designation_name',
      header: 'Designation Name',
      render: (row: Designation) => (
        <span className="text-accent font-semibold">{row.designation_name}</span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row: Designation) => (
        <span className="text-t-body">{row.department?.name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Designation) => (
        <Badge variant={row.is_active === 1 ? 'success' : 'default'}>
          {row.is_active === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Designation) => (
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
        title="All Designations"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Designation"
      />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No designations found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="designation"
      />
    </>
  )
}
