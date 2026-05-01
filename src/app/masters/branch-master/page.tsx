'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast, { type ToastData } from '@/components/ui/Toast'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import BranchList from './_components/BranchList'
import BranchForm from './_components/BranchForm'
import BranchView from './_components/BranchView'
import { useDropdownData } from '@/hooks/useDropdownData'
import type { Branch } from './_components/types'

export default function BranchMasterPage() {
  const { companies } = useDropdownData({ companies: true })
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [perPage, setPerPage] = useState(PER_PAGE)

  const [showForm, setShowForm] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{ data?: { branches?: Branch[]; pagination?: { total: number; total_pages: number } } }>(
        '/branch/branchList',
        { method: 'GET', encrypt: false, payload: { page: String(page), per_page: String(perPage), search, branch_name: '', branch_code: '', factory_id: '' } }
      )
      const nested = res.data
      const rows = nested?.branches ?? []
      setBranches(rows)
      setTotalCount(nested?.pagination?.total ?? rows.length)
      setTotalPages(nested?.pagination?.total_pages ?? 1)
    } catch {
      setBranches([])
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => { fetchBranches() }, [fetchBranches])

  // ── View ───────────────────────────────────────────
  const handleView = async (uuid: string) => {
    setViewLoading(true)
    setViewData({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/branch/show', { method: 'GET', encrypt: false, payload: { uuid } })
      setViewData(res.data ?? res)
    } catch { setViewData(null) }
    finally { setViewLoading(false) }
  }

  // ── Create / Edit ──────────────────────────────────
  const openAdd = () => { setEditBranch(null); setFormError(null); setShowForm(true) }
  const openEdit = (branch: Branch) => { setEditBranch(branch); setFormError(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditBranch(null) }

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editBranch) {
        const res = await apiCall<{ success?: boolean; message?: string }>('/branch/update', { payload })
        if (res.success === false) { setFormError(res.message || 'Update failed'); return }
        setToast({ message: res.message || 'Branch updated successfully', type: 'success' })
      } else {
        const res = await apiCall<{ success?: boolean; message?: string }>('/branch/create', { payload })
        if (res.success === false) { setFormError(res.message || 'Creation failed'); return }
        setToast({ message: res.message || 'Branch created successfully', type: 'success' })
      }
      closeForm()
      fetchBranches()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setFormError(e.response?.data?.message || e.message || 'Failed to save branch')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/branch/delete', { payload: { uuid: deleteTarget.uuid } })
      if (res.success === false) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Branch deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchBranches()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setToast({ message: e.response?.data?.message || e.message || 'Failed to delete branch', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader title="Branch Master" description="Manage branch locations, assignments and factory mappings." />

      <BranchList
        branches={branches}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onView={handleView}
      />

      <BranchView viewData={viewData} viewLoading={viewLoading} onClose={() => setViewData(null)} />

      {showForm && (
        <BranchForm
          editBranch={editBranch}
          companies={companies}
          saving={saving}
          formError={formError}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Branch"
          message={<span>Are you sure you want to delete <strong>{deleteTarget.branch_name}</strong>? This action cannot be undone.</span>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}
    </AppLayout>
  )
}
