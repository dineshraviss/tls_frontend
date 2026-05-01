'use client'

import { useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Toast from '@/components/ui/Toast'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useCrudApi } from '@/hooks/useCrudApi'
import { useMasterPage } from '@/hooks/useMasterPage'
import type { Role } from './_components/types'
import RoleList from './_components/RoleList'
import RoleForm from './_components/RoleForm'
import RoleView from './_components/RoleView'

export default function RoleMasterPage() {
  const api = useCrudApi<Role>({ basePath: '/role', listKey: 'roles' })
  const {
    showModal, editItem, openAdd, openEdit, closeModal,
    deleteTarget, setDeleteTarget, deleting, setDeleting,
    toast, showSuccess, showError, clearToast,
    viewData, viewLoading, startView, setView, closeView,
  } = useMasterPage<Role>()

  useEffect(() => { api.fetchList() }, [api.fetchList])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await api.remove(deleteTarget.uuid)
      if (res.success === false) { showError(res.message || 'Delete failed'); return }
      showSuccess(res.message || 'Role deleted successfully')
      setDeleteTarget(null)
      api.fetchList()
    } catch { showError('Failed to delete role') }
    finally { setDeleting(false) }
  }

  const handleSaved = (msg: string) => { showSuccess(msg); api.fetchList() }

  const handleView = async (uuid: string) => {
    startView()
    setView(await api.show(uuid))
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <RoleView viewData={viewData} viewLoading={viewLoading} onClose={closeView} />

      {showModal && (
        <RoleForm role={editItem} onClose={closeModal} onSave={handleSaved} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Role"
          message={<>Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <PageHeader title="Role Master" description="Manage user roles, permissions and access levels." />

      <RoleList
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
