'use client'

import IconButton from '@/components/ui/IconButton'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import { Pencil, Trash2, Eye } from 'lucide-react'
import type { Branch } from './types'

interface Props {
  branches: Branch[]
  loading: boolean
  page: number
  totalPages: number
  totalCount: number
  search: string
  onSearchChange: (val: string) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onAdd: () => void
  onEdit: (branch: Branch) => void
  onDelete: (branch: Branch) => void
  onView: (uuid: string) => void
}

export default function BranchList({
  branches, loading, page, totalPages, totalCount,
  search, onSearchChange, onPageChange, onPerPageChange,
  onAdd, onEdit, onDelete, onView,
}: Props) {
  const filtered = search
    ? branches.filter(b =>
        b.branch_name.toLowerCase().includes(search.toLowerCase()) ||
        b.branch_code?.toLowerCase().includes(search.toLowerCase()) ||
        b.company?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.address?.toLowerCase().includes(search.toLowerCase())
      )
    : branches

  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Branch, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * 10 + i + 1}</span>
      ),
    },
    {
      key: 'branch_name',
      header: 'Branch Name',
      render: (row: Branch) => (
        <span className="text-accent font-semibold">{row.branch_name}</span>
      ),
    },
    {
      key: 'branch_code',
      header: 'Branch Code',
      render: (row: Branch) => (
        <span className="font-mono text-xs text-t-body">{row.branch_code}</span>
      ),
    },
    {
      key: 'company_name',
      header: 'Company Name',
      render: (row: Branch) => (
        <span className="text-t-body">{row.company?.company_name ?? '—'}</span>
      ),
    },
    {
      key: 'company_code',
      header: 'Company Code',
      render: (row: Branch) => (
        <span className="font-mono text-xs text-t-body">{row.company?.company_code ?? '—'}</span>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (row: Branch) => (
        <span className="text-t-body max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap block">
          {row.address}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Branch) => (
        <Badge variant={row.status === 1 ? 'success' : 'default'}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Branch) => (
        <div className="flex gap-1.5 items-center">
          <IconButton variant="accent" onClick={() => onView(row.uuid)} title="View"><Eye size={13} /></IconButton>
          <IconButton variant="accent" onClick={() => onEdit(row)} title="Edit"><Pencil size={13} /></IconButton>
          <IconButton variant="danger" onClick={() => onDelete(row)} title="Delete"><Trash2 size={13} /></IconButton>
        </div>
      ),
    },
  ]

  return (
    <>
      <Toolbar
        title="All Branches"
        search={search}
        onSearchChange={val => { onSearchChange(val); onPageChange(1) }}
        searchPlaceholder="Search"
        onAdd={onAdd}
        addLabel="Add Branch"
      />
      <DataTable<Branch>
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No branches found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="branch"
      />
    </>
  )
}
