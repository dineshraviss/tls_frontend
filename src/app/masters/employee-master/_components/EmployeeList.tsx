'use client'

import IconButton from '@/components/ui/IconButton'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { PER_PAGE } from '@/lib/constants'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import Badge from '@/components/ui/Badge'
import { type Employee } from './types'

interface EmployeeListProps {
  employees: Employee[]
  loading: boolean
  search: string
  page: number
  totalPages: number
  totalCount: number
  onSearchChange: (val: string) => void
  onAdd: () => void
  onEdit: (emp: Employee) => void
  onDelete: (emp: Employee) => void
  onView: (uuid: string) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export default function EmployeeList({
  employees,
  loading,
  search,
  page,
  totalPages,
  totalCount,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onPageChange,
  onPerPageChange,
}: EmployeeListProps) {
  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Employee, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * PER_PAGE + i + 1}</span>
      ),
    },
    {
      key: 'emp_code',
      header: 'Emp Code',
      render: (row: Employee) => (
        <span className="text-t-body font-mono text-xs">{row.emp_code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row: Employee) => (
        <span className="text-accent font-semibold">{row.name} {row.last_name}</span>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row: Employee) => <span className="text-t-body">{row.mobile}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: Employee) => (
        <Badge variant="info">{row.roleInfo?.name ?? row.role}</Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row: Employee) => (
        <span className="text-t-body">{row.department?.name ?? '—'}</span>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (row: Employee) => (
        <span className="text-t-body">{row.branch?.branch_name ?? '—'}</span>
      ),
    },
    {
      key: 'join_date',
      header: 'Join Date',
      render: (row: Employee) => (
        <span className="text-t-body text-xs">{row.join_date}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Employee) => (
        <Badge variant={row.is_active === 1 ? 'success' : 'default'}>
          {row.is_active === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Employee) => (
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
        title="All Employees"
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        addLabel="Add Employee"
      />

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        emptyMessage="No employees found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="employee"
      />
    </>
  )
}
