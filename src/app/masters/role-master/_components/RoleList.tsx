'use client'

import IconButton from '@/components/ui/IconButton'
import { Pencil, Trash2, Eye } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import type { Role } from './types'

interface RoleListProps {
  data: Role[]
  loading: boolean
  search: string
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  onSearchChange: (val: string) => void
  onAdd: () => void
  onView: (uuid: string) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export default function RoleList({
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
}: RoleListProps) {
  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Role, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * perPage + i + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Role Name',
      render: (row: Role) => <span className="text-accent font-semibold">{row.name}</span>,
    },
    {
      key: 'short_name',
      header: 'Short Name',
      render: (row: Role) => <span className="text-t-body font-mono text-xs">{row.short_name}</span>,
    },
    {
      key: 'role',
      header: 'Role Code',
      render: (row: Role) => <span className="text-t-body font-semibold">{row.role}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Role) => (
        <Badge variant={row.is_active === 1 ? 'success' : 'default'}>
          {row.is_active === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Role) => (
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
        title="All Roles"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Role"
      />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No roles found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="role"
      />
    </>
  )
}
