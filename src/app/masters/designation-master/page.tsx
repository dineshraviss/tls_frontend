'use client'

import { useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Toast from '@/components/ui/Toast'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useCrudApi } from '@/hooks/useCrudApi'
import { useMasterPage } from '@/hooks/useMasterPage'
import { useDropdownData } from '@/hooks/useDropdownData'
import type { Designation } from './_components/types'
import DesignationList from './_components/DesignationList'
import DesignationForm from './_components/DesignationForm'
import DesignationView from './_components/DesignationView'

export default function DesignationMasterPage() {
  const api = useCrudApi<Designation>({ basePath: '/designation', listKey: 'designations' })
  const {
    showModal, editItem, openAdd, openEdit, closeModal,
    deleteTarget, setDeleteTarget, deleting, setDeleting,
    toast, showSuccess, showError, clearToast,
    viewData, viewLoading, startView, setView, closeView,
  } = useMasterPage<Designation>()
  const { departments } = useDropdownData({ departments: true })

  useEffect(() => { api.fetchList() }, [api.fetchList])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await api.remove(deleteTarget.uuid)
      if (res.success === false) { showError(res.message || 'Delete failed'); return }
      showSuccess(res.message || 'Designation deleted successfully')
      setDeleteTarget(null)
      api.fetchList()
    } catch {
      showError('Failed to delete designation')
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async (payload: Record<string, unknown>) => {
    const isEdit = !!editItem
    const res = isEdit ? await api.update(payload) : await api.create(payload)
    if (res.success !== false) {
      showSuccess(res.message || (isEdit ? 'Designation updated successfully' : 'Designation created successfully'))
      api.fetchList()
    }
    return res
  }

  const handleView = async (uuid: string) => {
    startView()
    setView(await api.show(uuid))
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <DesignationView viewData={viewData} viewLoading={viewLoading} onClose={closeView} />

      {showModal && (
        <DesignationForm
          designation={editItem}
          departments={departments}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Designation"
          message={<>Are you sure you want to delete <strong>{deleteTarget.designation_name}</strong>?</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <PageHeader title="Designation Master" description="Manage designations and their department assignments." />

      <DesignationList
        data={api.data}
        loading={api.loading}
        search={api.search}
        page={api.page}
        perPage={api.perPage}
        totalPages={api.totalPages}
        totalCount={api.totalCount}
        onSearchChange={api.setSearch}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onView={handleView}
        onPageChange={api.setPage}
        onPerPageChange={api.setPerPage}
      />
    </AppLayout>
  )
}
