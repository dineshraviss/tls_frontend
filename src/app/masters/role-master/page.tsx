'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import { validateField, validateAll, hasErrors, type ValidationRules } from '@/lib/validation'
import Toast, { type ToastData } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import FormInput from '@/components/ui/FormInput'
import Badge from '@/components/ui/Badge'
import ViewModal from '@/components/ui/ViewModal'

// ── Types ──
interface Role {
  id: number
  uuid: string
  name: string
  short_name: string
  role: number
  status: number
  is_active: number
}

// ── Validation ──
type FormField = 'name' | 'short_name' | 'role'
type FormErrors = Partial<Record<FormField, string>>
type Touched = Partial<Record<FormField, boolean>>

const rules: ValidationRules<FormField> = {
  name: {
    required: 'Role name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
    maxLength: { value: 50, message: 'Maximum 50 characters' },
  },
  short_name: {
    required: 'Short name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
    maxLength: { value: 20, message: 'Maximum 20 characters' },
  },
  role: {
    required: 'Role code is required',
    pattern: { value: /^\d+$/, message: 'Must be a number' },
  },
}

// ── Add / Edit Modal ──
function RoleModal({ role, onClose, onSaved }: {
  role: Role | null
  onClose: () => void
  onSaved: (msg: string) => void
}) {
  const isEdit = !!role
  const [form, setForm] = useState({
    name: role?.name ?? '',
    short_name: role?.short_name ?? '',
    role: role?.role?.toString() ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})

  const set = (key: FormField, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if (touched[key]) setErrors(e => ({ ...e, [key]: validateField(val, rules[key]) }))
  }

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key], rules[key]) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched: Touched = { name: true, short_name: true, role: true }
    setTouched(allTouched)
    const allErrors = validateAll(form, rules)
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        short_name: form.short_name,
        role: form.role,
      }
      if (isEdit) {
        payload.uuid = role.uuid
        const res = await apiCall<{ success?: boolean; message?: string }>('/role/update', { payload })
        if (res.success === false) { setErrors({ name: res.message || 'Update failed' }); return }
        onSaved(res.message || 'Role updated successfully')
      } else {
        const res = await apiCall<{ success?: boolean; message?: string }>('/role/create', { payload })
        if (res.success === false) { setErrors({ name: res.message || 'Creation failed' }); return }
        onSaved(res.message || 'Role created successfully')
      }
      onClose()
    } catch {
      setErrors({ name: 'Failed to save role. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Role' : 'Add Role'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="role-form" isLoading={saving}>
            {isEdit ? 'Update Role' : 'Add Role'}
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="Role Name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g. Admin"
          error={errors.name}
          touched={touched.name}
          required
        />
        <FormInput
          label="Short Name"
          value={form.short_name}
          onChange={e => set('short_name', e.target.value)}
          onBlur={() => handleBlur('short_name')}
          placeholder="e.g. admin"
          error={errors.short_name}
          touched={touched.short_name}
          required
        />
        <FormInput
          label="Role Code"
          value={form.role}
          onChange={e => set('role', e.target.value)}
          onBlur={() => handleBlur('role')}
          placeholder="e.g. 80"
          error={errors.role}
          touched={touched.role}
          required
        />
      </form>
    </Modal>
  )
}

// ── Main Page ──
export default function RoleMasterPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: {
          roles?: Role[]
          pagination?: { total: number; total_pages: number }
        }
      }>('/role/list', {
        method: 'GET', encrypt: false,
        payload: { page: String(page), per_page: String(PER_PAGE), search },
      })
      const data = res.data
      setRoles(data?.roles ?? [])
      setTotalCount(data?.pagination?.total ?? 0)
      setTotalPages(data?.pagination?.total_pages ?? 1)
    } catch {
      setRoles([])
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/role/delete', { payload: { uuid: deleteTarget.uuid } })
      if (res.success === false) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Role deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchRoles()
    } catch {
      setToast({ message: 'Failed to delete role', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaved = (msg: string) => {
    setToast({ message: msg, type: 'success' })
    fetchRoles()
  }

  const handleView = async (uuid: string) => {
    setViewLoading(true)
    setViewData({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/role/show', { method: 'GET', encrypt: false, payload: { uuid } })
      setViewData(res.data ?? res)
    } catch { setViewData(null) }
    finally { setViewLoading(false) }
  }

  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Role, i: number) => <span className="text-t-lighter text-xs">{(page - 1) * PER_PAGE + i + 1}</span>,
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
      render: (row: Role) => <Badge variant={row.is_active === 1 ? 'success' : 'default'}>{row.is_active === 1 ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row: Role) => (
        <div className="flex gap-1.5 items-center">
          <button onClick={() => handleView(row.uuid)} className="bg-transparent border-none cursor-pointer p-1 text-t-lighter hover:text-accent transition-colors flex" title="View"><Eye size={13} /></button>
          <button onClick={() => { setEditRole(row); setShowModal(true) }} className="bg-transparent border-none cursor-pointer p-1 text-t-lighter hover:text-accent transition-colors flex" title="Edit"><Pencil size={13} /></button>
          <button onClick={() => setDeleteTarget(row)} className="bg-transparent border-none cursor-pointer p-1 text-danger-light hover:text-danger transition-colors flex" title="Delete"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {viewData && (
        <ViewModal
          title="Role Details"
          loading={viewLoading}
          onClose={() => setViewData(null)}
          fields={[
            { label: 'Role Name', value: (viewData as Record<string, unknown>).name as string },
            { label: 'Short Name', value: (viewData as Record<string, unknown>).short_name as string },
            { label: 'Role Code', value: String((viewData as Record<string, unknown>).role ?? '—') },
            { label: 'Status', value: <Badge variant={(viewData as Record<string, unknown>).is_active === 1 ? 'success' : 'default'}>{(viewData as Record<string, unknown>).is_active === 1 ? 'Active' : 'Inactive'}</Badge> },
          ]}
        />
      )}

      {showModal && (
        <RoleModal
          role={editRole}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Role"
          message={<>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <Breadcrumb items={[{ label: 'Master' }, { label: 'Role Master', active: true }]} />
      <PageHeader title="Role Master" description="Manage user roles, permissions and access levels." />

      <Toolbar
        title="All Roles"
        search={search}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        onAdd={() => { setEditRole(null); setShowModal(true) }}
        addLabel="Add Role"
      />

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        emptyMessage="No roles found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
        countLabel="role"
      />
    </AppLayout>
  )
}
