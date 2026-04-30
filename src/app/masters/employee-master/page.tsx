'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import Toast, { type ToastData } from '@/components/ui/Toast'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useDropdownData } from '@/hooks/useDropdownData'
import { type Employee, type BranchOption, type RoleOption, type DeptOption } from './_components/types'
import EmployeeList from './_components/EmployeeList'
import EmployeeForm from './_components/EmployeeForm'
import EmployeeView from './_components/EmployeeView'

export default function EmployeeMasterPage() {
  const { branches, roles, departments: allDepts } = useDropdownData({ branches: true, roles: true, departments: true })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [perPage, setPerPage] = useState(PER_PAGE)
  const [deleting, setDeleting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editEmp, setEditEmp] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: { employees?: Employee[]; pagination?: { total: number; total_pages: number } }
      }>('/employee/list', {
        method: 'GET', encrypt: false,
        payload: { page: String(page), per_page: String(perPage), search, branch_id: '', role: '', name: '' },
      })
      const data = res.data
      setEmployees(data?.employees ?? [])
      setTotalCount(data?.pagination?.total ?? 0)
      setTotalPages(data?.pagination?.total_pages ?? 1)
    } catch { setEmployees([]) }
    finally { setLoading(false) }
  }, [search, page, perPage])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/employee/delete', { payload: { uuid: deleteTarget.uuid } })
      if (res.success === false) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Employee deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchEmployees()
    } catch { setToast({ message: 'Failed to delete employee', type: 'error' }) }
    finally { setDeleting(false) }
  }

  const handleSaved = (msg: string) => { setToast({ message: msg, type: 'success' }); fetchEmployees() }

  const handleView = async (uuid: string) => {
    setViewLoading(true); setViewData({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/employee/show', { method: 'GET', encrypt: false, payload: { uuid } })
      setViewData(res.data ?? res)
    } catch { setViewData(null) }
    finally { setViewLoading(false) }
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <EmployeeView
        viewData={viewData}
        viewLoading={viewLoading}
        onClose={() => setViewData(null)}
      />

      {showModal && (
        <EmployeeForm
          emp={editEmp}
          branches={branches}
          roles={roles}
          allDepts={allDepts}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Employee"
          message={<>Are you sure you want to delete <strong>{deleteTarget.name} {deleteTarget.last_name}</strong>? This action cannot be undone.</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <PageHeader title="Employee Master" description="Manage employees, roles, departments and branch assignments." />

      <EmployeeList
        employees={employees}
        loading={loading}
        search={search}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        onAdd={() => { setEditEmp(null); setShowModal(true) }}
        onEdit={emp => { setEditEmp(emp); setShowModal(true) }}
        onDelete={emp => setDeleteTarget(emp)}
        onView={handleView}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </AppLayout>
  )
}
