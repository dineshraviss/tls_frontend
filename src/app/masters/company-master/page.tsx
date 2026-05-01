'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast, { type ToastData } from '@/components/ui/Toast'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import CompanyList from './_components/CompanyList'
import CompanyForm from './_components/CompanyForm'
import CompanyView from './_components/CompanyView'
import type { Company } from './_components/types'

export default function CompanyMasterPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [perPage, setPerPage] = useState(PER_PAGE)

  const [showForm, setShowForm] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: {
          companies?: Company[]
          count?: number
          totalPages?: number
          pagination?: { total: number; total_pages: number }
        }
      }>('/company/companyList', {
        method: 'GET',
        encrypt: false,
        payload: { page: String(page), per_page: String(perPage), search, company_id: '', status: 'all' },
      })
      const data = res.data
      const rows: Company[] = data?.companies ?? []
      setCompanies(rows)
      const total = data?.pagination?.total ?? data?.count ?? rows.length
      setTotalCount(total)
      setTotalPages(data?.pagination?.total_pages ?? data?.totalPages ?? (Math.ceil(total / PER_PAGE) || 1))
    } catch {
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  // ── View ───────────────────────────────────────────
  const handleView = async (id: number) => {
    setViewLoading(true)
    setViewData({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/company/show', {
        method: 'GET', encrypt: false, payload: { id: String(id) },
      })
      setViewData(res.data ?? res)
    } catch { setViewData(null) }
    finally { setViewLoading(false) }
  }

  // ── Create / Edit ──────────────────────────────────
  const openAdd = () => { setEditCompany(null); setFormError(null); setShowForm(true) }
  const openEdit = (company: Company) => { setEditCompany(company); setFormError(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditCompany(null) }

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editCompany) {
        const res = await apiCall<{ success?: boolean; message?: string }>('/company/update', { payload })
        if (res.success === false) { setFormError(res.message || 'Update failed'); return }
        setToast({ message: res.message || 'Company updated successfully', type: 'success' })
      } else {
        const res = await apiCall<{ success?: boolean; message?: string }>('/company/create', { payload })
        if (res.success === false) { setFormError(res.message || 'Creation failed'); return }
        setToast({ message: res.message || 'Company created successfully', type: 'success' })
      }
      closeForm()
      fetchCompanies()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setFormError(e.response?.data?.message || e.message || 'Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/company/delete', { payload: { uuid: deleteTarget.uuid } })
      if (res.success === false) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Company deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchCompanies()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setToast({ message: e.response?.data?.message || e.message || 'Failed to delete company', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader title="Company Master" description="Manage company profiles, locations, types and slot configurations." />

      <CompanyList
        companies={companies}
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

      <CompanyView viewData={viewData} viewLoading={viewLoading} onClose={() => setViewData(null)} />

      {showForm && (
        <CompanyForm
          editCompany={editCompany}
          saving={saving}
          formError={formError}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Company"
          message={<span>Are you sure you want to delete <strong>{deleteTarget.company_name}</strong>? This action cannot be undone.</span>}
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
