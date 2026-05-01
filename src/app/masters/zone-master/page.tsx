'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropdownData } from '@/hooks/useDropdownData'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast, { type ToastData } from '@/components/ui/Toast'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import ZoneList from './_components/ZoneList'
import ZoneForm from './_components/ZoneForm'
import ZoneView from './_components/ZoneView'
import type { Zone, CompanyOption, BranchOption } from './_components/types'

export default function ZoneMasterPage() {
  const { companies, branches: allBranches } = useDropdownData({ companies: true, branches: true })
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [perPage, setPerPage] = useState(PER_PAGE)

  const [showForm, setShowForm] = useState(false)
  const [editZone, setEditZone] = useState<Zone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: {
          zones?: Zone[]
          pagination?: { total: number; total_pages: number }
        }
      }>('/zone/zoneList', {
        method: 'GET', encrypt: false, payload: { search, page: String(page), per_page: String(perPage) },
      })
      const data = res.data
      setZones(data?.zones ?? [])
      setTotalCount(data?.pagination?.total ?? 0)
      setTotalPages(data?.pagination?.total_pages ?? 1)
    } catch {
      setZones([])
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => { fetchZones() }, [fetchZones])

  // ── View ───────────────────────────────────────────
  const handleView = async (id: number) => {
    setViewLoading(true)
    setViewData({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/zone/show', {
        method: 'GET', encrypt: false, payload: { id: String(id) },
      })
      setViewData(res.data ?? res)
    } catch { setViewData(null) }
    finally { setViewLoading(false) }
  }

  // ── Create / Edit ──────────────────────────────────
  const openAdd = () => { setEditZone(null); setFormError(null); setShowForm(true) }
  const openEdit = (zone: Zone) => { setEditZone(zone); setFormError(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditZone(null) }

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true)
    setFormError(null)
    try {
      if (editZone) {
        const res = await apiCall<{ success?: boolean; message?: string }>('/zone/update', { payload })
        if (res.success === false) { setFormError(res.message || 'Update failed'); return }
        setToast({ message: res.message || 'Zone updated successfully', type: 'success' })
      } else {
        const res = await apiCall<{ success?: boolean; message?: string }>('/zone/create', { payload })
        if (res.success === false) { setFormError(res.message || 'Creation failed'); return }
        setToast({ message: res.message || 'Zone created successfully', type: 'success' })
      }
      closeForm()
      fetchZones()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setFormError(e.response?.data?.message || e.message || 'Failed to save zone')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/zone/delete', { payload: { id: deleteTarget.id } })
      if (res.success === false) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Zone deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchZones()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setToast({ message: e.response?.data?.message || e.message || 'Failed to delete zone', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader title="Zone Master" description="Manage production zones within company branches." />

      <ZoneList
        zones={zones}
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

      <ZoneView viewData={viewData} viewLoading={viewLoading} onClose={() => setViewData(null)} />

      {showForm && (
        <ZoneForm
          editZone={editZone}
          companies={companies}
          allBranches={allBranches}
          saving={saving}
          formError={formError}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Zone"
          message={<span>Are you sure you want to delete <strong>{deleteTarget.zone_name}</strong>? This action cannot be undone.</span>}
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
