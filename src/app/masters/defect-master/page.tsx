'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Toast from '@/components/ui/Toast'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import type { ToastData } from '@/components/ui/Toast'
import { useDropdownData } from '@/hooks/useDropdownData'
import type { Defect, Cap } from './_components/types'
import DefectList from './_components/DefectList'
import DefectForm from './_components/DefectForm'
import DefectView from './_components/DefectView'

export default function DefectMasterPage() {
  const [defects, setDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PER_PAGE)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [editDefect, setEditDefect] = useState<Defect | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Defect | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewDefect, setViewDefect] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const { departments } = useDropdownData({ departments: true })
  const [severityOptions, setSeverityOptions] = useState<{ id: number; value: string }[]>([])

  useEffect(() => {
    apiCall<{ data?: { records?: { id: number; value: string }[] } }>(
      '/dropdown/options-dropdown',
      { method: 'GET', encrypt: false, payload: { type: 'severity' } }
    )
      .then(res => setSeverityOptions(res.data?.records ?? []))
      .catch(() => {})
  }, [])

  const fetchDefects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: { defects?: Defect[]; pagination?: { total: number; total_pages: number } }
      }>('/defect/list', {
        method: 'GET',
        encrypt: false,
        payload: { page: String(page), per_page: String(perPage), search, status: 'all' },
      })
      setDefects(res.data?.defects ?? [])
      setTotalCount(res.data?.pagination?.total ?? 0)
      setTotalPages(res.data?.pagination?.total_pages ?? 1)
    } catch {
      setDefects([])
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  useEffect(() => { fetchDefects() }, [fetchDefects])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/defect/delete', {
        payload: { uuid: deleteTarget.uuid },
      })
      if (res.success === false) {
        setToast({ message: res.message || 'Delete failed', type: 'error' })
        return
      }
      setToast({ message: res.message || 'Defect deleted', type: 'success' })
      setDeleteTarget(null)
      fetchDefects()
    } catch {
      setToast({ message: 'Failed to delete defect', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async (payload: Record<string, unknown>) => {
    const isEdit = !!editDefect
    const res = await apiCall<{ success?: boolean; message?: string }>(
      isEdit ? '/defect/update' : '/defect/create',
      { payload }
    )
    if (res.success !== false) {
      setToast({ message: res.message || (isEdit ? 'Defect updated' : 'Defect created'), type: 'success' })
      fetchDefects()
    }
    return res
  }

  const handleView = async (uuid: string) => {
    setViewLoading(true)
    setViewDefect({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/defect/show', {
        method: 'GET',
        encrypt: false,
        payload: { uuid },
      })
      setViewDefect(res.data ?? res)
    } catch {
      setViewDefect(null)
    } finally {
      setViewLoading(false)
    }
  }

  const handleAddCap = async (
    defectId: number,
    cap: { cap_name: string; short_name: string; notes: string }
  ) => {
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/defect/capmap', {
        payload: {
          defect_id: String(defectId),
          cap_name: cap.cap_name,
          short_name: cap.short_name || cap.cap_name.slice(0, 10),
          notes: cap.notes,
        },
      })
      if (res.success !== false) {
        setViewDefect(v => (v ? { ...v, caps: [...((v.caps as Cap[]) ?? []), cap] } : v))
      }
      setToast({ message: res.message || 'CAP added', type: 'success' })
    } catch {
      setToast({ message: 'Failed to add CAP', type: 'error' })
    }
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showModal && (
        <DefectForm
          defect={editDefect}
          departments={departments}
          severityOptions={severityOptions}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <DefectView
        viewData={viewDefect !== null ? (viewLoading ? null : viewDefect) : null}
        viewLoading={viewLoading}
        onClose={() => setViewDefect(null)}
        onAddCap={handleAddCap}
      />

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Defect"
          message={<>Are you sure you want to delete <strong>{deleteTarget.defect_name}</strong>?</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <PageHeader
        title="Defect Master"
        description="Master list of defect types with severity classification and department ownership."
      />

      <DefectList
        data={defects}
        loading={loading}
        search={search}
        page={page}
        perPage={perPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        onAdd={() => { setEditDefect(null); setShowModal(true) }}
        onEdit={row => { setEditDefect(row); setShowModal(true) }}
        onDelete={setDeleteTarget}
        onView={handleView}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </AppLayout>
  )
}
