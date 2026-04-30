'use client'

import IconButton from '@/components/ui/IconButton'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import { Pencil, Trash2, Eye } from 'lucide-react'
import type { Zone } from './types'

interface Props {
  zones: Zone[]
  loading: boolean
  page: number
  totalPages: number
  totalCount: number
  search: string
  onSearchChange: (val: string) => void
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onAdd: () => void
  onEdit: (zone: Zone) => void
  onDelete: (zone: Zone) => void
  onView: (id: number) => void
}

export default function ZoneList({
  zones, loading, page, totalPages, totalCount,
  search, onSearchChange, onPageChange, onPerPageChange,
  onAdd, onEdit, onDelete, onView,
}: Props) {
  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Zone, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * 30 + i + 1}</span>
      ),
    },
    {
      key: 'zone_name',
      header: 'Zone Name',
      render: (row: Zone) => (
        <span className="text-accent font-semibold">{row.zone_name}</span>
      ),
    },
    {
      key: 'zone_code',
      header: 'Zone Code',
      render: (row: Zone) => (
        <span className="font-mono text-xs text-t-body">{row.zone_code}</span>
      ),
    },
    {
      key: 'company_name',
      header: 'Company Name',
      render: (row: Zone) => (
        <span className="text-t-body">{row.company?.company_name ?? '—'}</span>
      ),
    },
    {
      key: 'company_code',
      header: 'Company Code',
      render: (row: Zone) => (
        <span className="font-mono text-xs text-t-body">{row.company?.company_code ?? '—'}</span>
      ),
    },
    {
      key: 'branch_name',
      header: 'Branch Name',
      render: (row: Zone) => (
        <span className="text-t-body">{row.branch?.branch_name ?? '—'}</span>
      ),
    },
    {
      key: 'branch_code',
      header: 'Branch Code',
      render: (row: Zone) => (
        <span className="font-mono text-xs text-t-body">{row.branch?.branch_code ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Zone) => (
        <Badge variant={row.status === 1 ? 'success' : 'default'}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Zone) => (
        <div className="flex gap-1.5 items-center">
          <IconButton variant="accent" onClick={() => onView(row.id)} title="View"><Eye size={13} /></IconButton>
          <IconButton variant="accent" onClick={() => onEdit(row)} title="Edit"><Pencil size={13} /></IconButton>
          <IconButton variant="danger" onClick={() => onDelete(row)} title="Delete"><Trash2 size={13} /></IconButton>
        </div>
      ),
    },
  ]

  return (
    <>
      <Toolbar
        title="All Zones"
        search={search}
        onSearchChange={val => { onSearchChange(val); onPageChange(1) }}
        onAdd={onAdd}
        addLabel="Add Zone"
      />
      <DataTable<Zone>
        columns={columns}
        data={zones}
        loading={loading}
        emptyMessage="No zones found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        countLabel="zone"
      />
    </>
  )
}
