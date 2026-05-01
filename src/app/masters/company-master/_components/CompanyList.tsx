'use client'

import IconButton from '@/components/ui/IconButton'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import { Pencil, Trash2, Eye } from 'lucide-react'
import type { Company } from './types'

interface Props {
  companies: Company[]
  loading: boolean
  page: number
  totalPages: number
  totalCount: number
  search: string
  onSearchChange: (val: string) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onAdd: () => void
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
  onView: (id: number) => void
}

export default function CompanyList({
  companies, loading, page, totalPages, totalCount,
  search, onSearchChange, onPageChange, onPerPageChange,
  onAdd, onEdit, onDelete, onView,
}: Props) {
  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Company, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * 10 + i + 1}</span>
      ),
    },
    {
      key: 'company_name',
      header: 'Company Name',
      render: (row: Company) => (
        <span className="text-accent font-semibold">{row.company_name}</span>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (row: Company) => (
        <span className="text-t-body">{row.address}</span>
      ),
    },
    {
      key: 'company_type',
      header: 'Type',
      render: (row: Company) => (
        <Badge variant="info">{row.company_type}</Badge>
      ),
    },
    {
      key: 'max_slot',
      header: 'Max Slot',
      render: (row: Company) => (
        <span className="text-t-body font-semibold">{row.max_slot}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (row: Company) => (
        <span className="text-t-light text-xs2">
          {row.location?.lat}, {row.location?.lng}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Company) => (
        <Badge variant={row.status === 1 ? 'success' : 'default'}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Company) => (
        <div className="flex gap-1.5 items-center">
          <IconButton variant="accent" onClick={() => onView((row as unknown as { id: number }).id)} title="View"><Eye size={13} /></IconButton>
          <IconButton variant="accent" onClick={() => onEdit(row)} title="Edit"><Pencil size={13} /></IconButton>
          <IconButton variant="danger" onClick={() => onDelete(row)} title="Delete"><Trash2 size={13} /></IconButton>
        </div>
      ),
    },
  ]

  return (
    <>
      <Toolbar
        title="All Companies"
        search={search}
        onSearchChange={val => { onSearchChange(val); onPageChange(1) }}
        onAdd={onAdd}
        addLabel="Add Company"
      />
      <DataTable<Company>
        columns={columns}
        data={companies}
        loading={loading}
        emptyMessage="No companies found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="company"
      />
    </>
  )
}
