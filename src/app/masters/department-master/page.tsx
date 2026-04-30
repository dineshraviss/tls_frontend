'use client'

import { useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Toast from '@/components/ui/Toast'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { apiCall } from '@/services/apiClient'
import { useCrudApi } from '@/hooks/useCrudApi'
import { useMasterPage } from '@/hooks/useMasterPage'
import { useDropdownData } from '@/hooks/useDropdownData'
import type { Department } from './_components/types'
import DepartmentList from './_components/DepartmentList'
import DepartmentForm from './_components/DepartmentForm'
import DepartmentView from './_components/DepartmentView'

export default function DepartmentMasterPage() {
  const api = useCrudApi<Department>({ basePath: '/department', listKey: 'departments' })
  const {
    showModal, editItem, openAdd, openEdit, closeModal,
    deleteTarget, setDeleteTarget, deleting, setDeleting,
    toast, showSuccess, showError, clearToast,
    viewData, viewLoading, startView, setView, closeView,
  } = useMasterPage<Department>()

  const { branches } = useDropdownData({ branches: true })

  useEffect(() => { api.fetchList() }, [api.fetchList])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/department/delete', {
        payload: { uuid: deleteTarget.uuid },
      })
      if (res.success === false) { showError(res.message || 'Delete failed'); return }
      showSuccess(res.message || 'Department deleted successfully')
      setDeleteTarget(null)
      api.fetchList()
    } catch { showError('Failed to delete department') }
    finally { setDeleting(false) }
  }

  const handleSaved = (msg: string) => { showSuccess(msg); api.fetchList() }

  const handleView = async (uuid: string) => {
    startView()
    const res = await apiCall<{ data?: Record<string, unknown> }>('/department/show', {
      method: 'GET',
      encrypt: false,
      payload: { uuid },
    }).catch(() => null)
    setView(res?.data ?? res ?? null)
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <DepartmentView viewData={viewData} viewLoading={viewLoading} onClose={closeView} />

      {showModal && (
        <DepartmentForm
          dept={editItem}
          branches={branches}
          onClose={closeModal}
          onSave={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Department"
          message={<>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <PageHeader title="Department Master" description="Manage departments and their branch assignments." />

      <DepartmentList
        data={api.data}
        loading={api.loading}
        search={api.search}
        page={api.page}
        perPage={api.perPage}
        totalPages={api.totalPages}
        totalCount={api.totalCount}
        onSearchChange={api.setSearch}
        onAdd={openAdd}
        onView={handleView}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onPageChange={api.setPage}
        onPerPageChange={api.setPerPage}
      />
    </AppLayout>
  )
}
