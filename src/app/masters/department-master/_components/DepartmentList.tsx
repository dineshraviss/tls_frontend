'use client'

import IconButton from '@/components/ui/IconButton'
import { Pencil, Trash2, Eye } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import type { Department } from './types'

interface DepartmentListProps {
  data: Department[]
  loading: boolean
  search: string
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  onSearchChange: (val: string) => void
  onAdd: () => void
  onView: (uuid: string) => void
  onEdit: (dept: Department) => void
  onDelete: (dept: Department) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export default function DepartmentList({
  data,
  loading,
  search,
  page,
  perPage,
  totalPages,
  totalCount,
  onSearchChange,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  onPerPageChange,
}: DepartmentListProps) {
  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Department, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * perPage + i + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Department Name',
      render: (row: Department) => <span className="text-accent font-semibold">{row.name}</span>,
    },
    {
      key: 'dept_code',
      header: 'Dept Code',
      render: (row: Department) => <span className="text-t-body font-mono text-xs">{row.dept_code}</span>,
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (row: Department) => <span className="text-t-body">{row.branch?.branch_name ?? '—'}</span>,
    },
    {
      key: 'branch_code',
      header: 'Branch Code',
      render: (row: Department) => <span className="text-t-body font-mono text-xs">{row.branch?.branch_code ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Department) => (
        <Badge variant={row.is_active === 1 ? 'success' : 'default'}>
          {row.is_active === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Department) => (
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
        title="All Departments"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Department"
      />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No departments found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="department"
      />
    </>
  )
}
