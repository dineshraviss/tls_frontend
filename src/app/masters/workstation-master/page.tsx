'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { apiCall } from '@/services/apiClient'
import { useDropdownData } from '@/hooks/useDropdownData'
import { PER_PAGE } from '@/lib/constants'
import Toast, { type ToastData } from '@/components/ui/Toast'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { type Workstation, type BranchOption, type LineOption } from './_components/types'
import WorkstationList from './_components/WorkstationList'
import WorkstationForm from './_components/WorkstationForm'
import WorkstationView from './_components/WorkstationView'

export default function WorkstationMasterPage() {
  const [workstations, setWorkstations] = useState<Workstation[]>([])
  const { branches, lines: allLines } = useDropdownData({ branches: true, lines: true })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [perPage, setPerPage] = useState(PER_PAGE)
  const [deleting, setDeleting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editWs, setEditWs] = useState<Workstation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Workstation | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const fetchWorkstations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: {
          workstations?: Workstation[]
          pagination?: { total: number; total_pages: number }
        }
      }>('/workstation/list', {
        method: 'GET', encrypt: false,
        payload: { page: String(page), per_page: String(perPage), search, line_id: '', branch_id: '', status: 'all' },
      })
      const data = res.data
      setWorkstations(data?.workstations ?? [])
      setTotalCount(data?.pagination?.total ?? 0)
      setTotalPages(data?.pagination?.total_pages ?? 1)
    } catch {
      setWorkstations([])
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => {
    fetchWorkstations()
  }, [fetchWorkstations])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/workstation/delete', { payload: { uuid: deleteTarget.uuid } })
      if (res.success === false) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Workstation deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchWorkstations()
    } catch {
      setToast({ message: 'Failed to delete workstation', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaved = (msg: string) => {
    setToast({ message: msg, type: 'success' })
    fetchWorkstations()
  }

  const handleView = async (uuid: string) => {
    setViewLoading(true)
    setViewData({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/workstation/show', { method: 'GET', encrypt: false, payload: { uuid } })
      setViewData(res.data ?? res)
    } catch {
      setViewData(null)
    } finally {
      setViewLoading(false)
    }
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <WorkstationView
        viewData={viewData}
        viewLoading={viewLoading}
        onClose={() => setViewData(null)}
      />

      {showModal && (
        <WorkstationForm
          ws={editWs}
          branches={branches}
          allLines={allLines}
          onClose={() => setShowModal(false)}
          onSave={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Workstation"
          message={<>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <PageHeader title="Work station Master" description="Manage workstations, line assignments and QR codes." />

      <WorkstationList
        workstations={workstations}
        loading={loading}
        search={search}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        onAdd={() => { setEditWs(null); setShowModal(true) }}
        onView={handleView}
        onEdit={ws => { setEditWs(ws); setShowModal(true) }}
        onDelete={setDeleteTarget}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </AppLayout>
  )
}
