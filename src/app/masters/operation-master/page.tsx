'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast from '@/components/ui/Toast'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import type { ToastData } from '@/components/ui/Toast'
import type { Operation, MachineTypeGroup, DefectOption } from './_components/types'
import OperationList from './_components/OperationList'
import OperationForm from './_components/OperationForm'
import OperationView from './_components/OperationView'

export default function OperationMasterPage() {
  // ── List state ───────────────────────────────────────────────────────────────
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMachineTypeId, setFilterMachineTypeId] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PER_PAGE)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [editOperation, setEditOperation] = useState<Operation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Operation | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewOperation, setViewOperation] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  // ── Reference data ───────────────────────────────────────────────────────────
  const [machineGroups, setMachineGroups] = useState<MachineTypeGroup[]>([])
  const [defectOptions, setDefectOptions] = useState<DefectOption[]>([])

  // ── Bootstrap reference data ─────────────────────────────────────────────────
  useEffect(() => {
    apiCall<{ data?: MachineTypeGroup[] }>(
      '/machine/machinelist',
      { method: 'GET', encrypt: false, payload: { search: '', status: 'ALL' } }
    ).then(res => setMachineGroups(res.data ?? [])).catch(() => {})

    apiCall<{ data?: { defects?: DefectOption[] } | DefectOption[] }>(
      '/defect/list',
      { method: 'GET', encrypt: false, payload: { page: '1', per_page: '500', search: '', status: 'all' } }
    ).then(res => {
      const raw = res.data
      if (Array.isArray(raw)) setDefectOptions(raw)
      else setDefectOptions((raw as { defects?: DefectOption[] })?.defects ?? [])
    }).catch(() => {})
  }, [])

  // ── Fetch operations list ────────────────────────────────────────────────────
  const fetchOperations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: { operations?: Operation[]; pagination?: { total: number; total_pages: number } }
      }>(
        '/operation/list',
        {
          method: 'GET',
          encrypt: false,
          payload: {
            page: String(page),
            per_page: String(perPage),
            search,
            ...(filterMachineTypeId ? { machine_type_id: filterMachineTypeId } : {}),
          },
        }
      )
      setOperations(res.data?.operations ?? [])
      setTotalCount(res.data?.pagination?.total ?? 0)
      setTotalPages(res.data?.pagination?.total_pages ?? 1)
    } catch { setOperations([]) }
    finally { setLoading(false) }
  }, [page, perPage, search, filterMachineTypeId])

  useEffect(() => { fetchOperations() }, [fetchOperations])

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>(
        '/operation/delete',
        { payload: { uuid: deleteTarget.uuid } }
      )
      if (res.success === false) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Operation deleted', type: 'success' })
      setDeleteTarget(null)
      fetchOperations()
    } catch { setToast({ message: 'Failed to delete operation', type: 'error' }) }
    finally { setDeleting(false) }
  }

  // ── View ─────────────────────────────────────────────────────────────────────
  const handleView = async (uuid: string) => {
    setViewLoading(true)
    setViewOperation({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>(
        '/operation/show',
        { method: 'GET', encrypt: false, payload: { uuid } }
      )
      setViewOperation(res.data ?? res)
    } catch { setViewOperation(null) }
    finally { setViewLoading(false) }
  }

  // ── Context menu ─────────────────────────────────────────────────────────────
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpenMenuId(id)
  }

  const allTypes = machineGroups.flatMap(g => g.data)

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showModal && (
        <OperationForm
          editOperation={editOperation}
          machineGroups={machineGroups}
          defectOptions={defectOptions}
          onClose={() => setShowModal(false)}
          onSave={msg => { setToast({ message: msg, type: 'success' }); fetchOperations() }}
        />
      )}

      {viewOperation !== null && (
        <OperationView
          viewData={viewLoading ? null : viewOperation}
          viewLoading={viewLoading}
          onClose={() => setViewOperation(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Operation"
          message={<>Are you sure you want to delete <strong>{deleteTarget.operation_name}</strong>?</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <PageHeader
        title="Operation Master"
        description="Manage operations with machine assignments, SAM times, and linked defects."
      />

      <OperationList
        operations={operations}
        loading={loading}
        search={search}
        filterMachineTypeId={filterMachineTypeId}
        allTypes={allTypes}
        page={page}
        perPage={perPage}
        totalPages={totalPages}
        totalCount={totalCount}
        openMenuId={openMenuId}
        menuPos={menuPos}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        onFilterMachineTypeChange={val => { setFilterMachineTypeId(val); setPage(1) }}
        onAdd={() => { setEditOperation(null); setShowModal(true) }}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onView={handleView}
        onMenuOpen={openMenu}
        onMenuClose={() => setOpenMenuId(null)}
        onEdit={op => { setEditOperation(op); setShowModal(true) }}
        onDeleteTarget={setDeleteTarget}
      />
    </AppLayout>
  )
}
