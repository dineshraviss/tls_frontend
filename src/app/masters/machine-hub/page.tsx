'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Toast from '@/components/ui/Toast'
import { Download, Upload, Plus } from 'lucide-react'
import { apiCall } from '@/services/apiClient'
import type { ToastData } from '@/components/ui/Toast'
import type { MachineTypeGroup, MachineTypeItem, MachineSpec } from './_components/types'
import MachineHubList from './_components/MachineHubList'
import MachineHubTypeForm from './_components/MachineHubTypeForm'
import MachineHubSpecForm from './_components/MachineHubSpecForm'
import MachineHubView from './_components/MachineHubView'

export default function MachineHubPage() {
  const [groups, setGroups] = useState<MachineTypeGroup[]>([])
  const [typesLoading, setTypesLoading] = useState(true)
  const [searchType, setSearchType] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [subTab, setSubTab] = useState<'Machine Specification' | 'Operation Master'>('Machine Specification')

  const [specs, setSpecs] = useState<MachineSpec[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)

  const [showAddType, setShowAddType] = useState(false)
  const [editTypeItem, setEditTypeItem] = useState<MachineTypeItem | null>(null)
  const [showSpecModal, setShowSpecModal] = useState(false)
  const [editSpec, setEditSpec] = useState<MachineSpec | null>(null)
  const [deleteSpec, setDeleteSpec] = useState<MachineSpec | null>(null)
  const [deletingSpec, setDeletingSpec] = useState(false)

  const [deleteType, setDeleteType] = useState<MachineTypeItem | null>(null)
  const [deletingType, setDeletingType] = useState(false)

  const [toast, setToast] = useState<ToastData | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const [viewSpecUuid, setViewSpecUuid] = useState<string | null>(null)

  const hasSelectedRef = useRef(false)

  // ── Load grouped machine types ──
  const fetchTypes = useCallback(async () => {
    setTypesLoading(true)
    try {
      const res = await apiCall<{ success?: boolean | number; message?: string; data?: MachineTypeGroup[] }>(
        '/machine/machinelist',
        { method: 'GET', encrypt: false, payload: { search: searchType, status: 'ALL' } }
      )
      if (!res.success) {
        setToast({ message: res.message || 'Failed to load machine types', type: 'error' })
        setGroups([])
        return
      }
      const list = res.data ?? []
      setGroups(list)
      if (!hasSelectedRef.current && list.length > 0) {
        const first = list[0]?.data?.[0]
        if (first) { setSelectedId(first.id); hasSelectedRef.current = true }
      }
    } catch {
      setToast({ message: 'Failed to load machine types', type: 'error' })
      setGroups([])
    } finally {
      setTypesLoading(false)
    }
  }, [searchType])

  useEffect(() => { fetchTypes() }, [fetchTypes])

  // ── Load specs for selected machine type ──
  const fetchSpecs = useCallback(async () => {
    if (!selectedId) return
    setSpecsLoading(true)
    try {
      const res = await apiCall<{
        success?: boolean | number
        message?: string
        data?: { count?: number; rows?: MachineSpec[] } | MachineSpec[]
      }>(
        '/machine/machinespecificationlist',
        { method: 'GET', encrypt: false, payload: { machine_id: String(selectedId) } }
      )
      if (!res.success) {
        setToast({ message: res.message || 'Failed to load specifications', type: 'error' })
        setSpecs([])
        return
      }
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data as { rows?: MachineSpec[] })?.rows ?? []
      setSpecs(rows)
    } catch {
      setToast({ message: 'Failed to load specifications', type: 'error' })
      setSpecs([])
    } finally {
      setSpecsLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    if (subTab === 'Machine Specification') fetchSpecs()
  }, [fetchSpecs, subTab])

  // ── Delete spec ──
  const handleDeleteSpec = async () => {
    if (!deleteSpec) return
    setDeletingSpec(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>(
        '/specification/delete',
        { payload: { uuid: deleteSpec.uuid } }
      )
      if (!res.success) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Specification deleted', type: 'success' })
      setDeleteSpec(null)
      fetchSpecs()
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' })
    } finally {
      setDeletingSpec(false)
    }
  }

  // ── Delete type ──
  const handleDeleteType = async () => {
    if (!deleteType) return
    setDeletingType(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>(
        '/machine/delete',
        { payload: { uuid: deleteType.uuid } }
      )
      if (!res.success) { setToast({ message: res.message || 'Delete failed', type: 'error' }); return }
      setToast({ message: res.message || 'Machine type deleted', type: 'success' })
      setDeleteType(null)
      setSelectedId(null)
      hasSelectedRef.current = false
      fetchTypes()
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' })
    } finally {
      setDeletingType(false)
    }
  }

  const openSpecMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpenMenuId(id)
  }

  const selected = groups.flatMap(g => g.data).find(t => t.id === selectedId) ?? null

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {(showAddType || editTypeItem) && (
        <MachineHubTypeForm
          editType={editTypeItem}
          onClose={() => { setShowAddType(false); setEditTypeItem(null) }}
          onSaved={msg => { setToast({ message: msg, type: 'success' }); fetchTypes() }}
          onError={msg => setToast({ message: msg, type: 'error' })}
        />
      )}

      {showSpecModal && selectedId && (
        <MachineHubSpecForm
          spec={editSpec}
          machineTypeId={selectedId}
          onClose={() => { setShowSpecModal(false); setEditSpec(null) }}
          onSaved={msg => { setToast({ message: msg, type: 'success' }); fetchSpecs() }}
          onError={msg => setToast({ message: msg, type: 'error' })}
        />
      )}

      {deleteSpec && (
        <ConfirmDialog
          title="Delete Specification"
          message={<>Delete specification <strong>{deleteSpec.machine_no}</strong>?</>}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDeleteSpec}
          onClose={() => setDeleteSpec(null)}
          loading={deletingSpec}
        />
      )}

      <MachineHubView
        uuid={viewSpecUuid}
        onClose={() => setViewSpecUuid(null)}
        onEdit={s => { setEditSpec(s); setShowSpecModal(true) }}
        onDelete={s => setDeleteSpec(s)}
      />

      {deleteType && (
        <ConfirmDialog
          title="Delete Machine Type"
          message={<>Delete machine type <strong>{deleteType.type_name}</strong>?</>}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDeleteType}
          onClose={() => setDeleteType(null)}
          loading={deletingType}
        />
      )}

      <PageHeader title="Machine Hub" description="Manage machine types and their specifications.">
        <div className="flex gap-2 items-center">
          <Button variant="outline"><Download size={13} /> Export</Button>
          <Button variant="outline"><Upload size={13} /> Import</Button>
          <Button variant="primary" onClick={() => setShowAddType(true)}>
            <Plus size={13} /> Add Machine Type
          </Button>
        </div>
      </PageHeader>

      <MachineHubList
        groups={groups}
        typesLoading={typesLoading}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        selectedId={selectedId}
        onSelectType={setSelectedId}
        selected={selected}
        onEditType={item => setEditTypeItem(item)}
        onDeleteType={item => setDeleteType(item)}
        subTab={subTab}
        onSubTabChange={setSubTab}
        specs={specs}
        specsLoading={specsLoading}
        onAddSpec={() => { setEditSpec(null); setShowSpecModal(true) }}
        onViewSpec={uuid => setViewSpecUuid(uuid)}
        onEditSpec={s => { setEditSpec(s); setShowSpecModal(true) }}
        onDeleteSpec={s => setDeleteSpec(s)}
        openMenuId={openMenuId}
        menuPos={menuPos}
        onOpenSpecMenu={openSpecMenu}
        onCloseMenu={() => setOpenMenuId(null)}
      />
    </AppLayout>
  )
}
