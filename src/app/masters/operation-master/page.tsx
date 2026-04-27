'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import FormTextarea from '@/components/ui/FormTextarea'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Badge from '@/components/ui/Badge'
import Toast from '@/components/ui/Toast'
import { Pencil, Trash2, MoreVertical, ChevronDown, X } from 'lucide-react'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import { validateField, validateAll, hasErrors, type ValidationRules } from '@/lib/validation'
import type { ToastData } from '@/components/ui/Toast'

// ── Types ──────────────────────────────────────────────────────────────────────
interface MachineTypeItem {
  id: number
  type_name: string
  name: string
  machine_count: number
}

interface MachineTypeGroup {
  variant: string
  variant_count: number
  total_machine_count: number
  data: MachineTypeItem[]
}

interface MachineSpec {
  id: number
  uuid: string
  name: string
  machine_id: string
}

interface DefectOption {
  id: number
  defect_name: string
  code: string
}

interface Operation {
  id: number
  uuid: string
  operation_name: string
  code: string
  sam: string
  notes: string
  machine_type_id: number | null
  machine_id: number | null
  machineType?: { id: number; type_name: string; name: string }
  machine?: { id: number; name: string; machine_id: string }
  defects?: DefectOption[]
  is_active: number
}

// ── Multi-select Defects ───────────────────────────────────────────────────────
function MultiSelectDefects({
  selected,
  onChange,
  options,
  error,
  touched,
}: {
  selected: number[]
  onChange: (ids: number[]) => void
  options: DefectOption[]
  error?: string
  touched?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const showError = error && touched !== false

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  const remove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter(x => x !== id))
  }

  const selectedOptions = options.filter(o => selected.includes(o.id))

  return (
    <div className="flex flex-col gap-1 relative" ref={ref}>
      <label className="text-xs font-medium text-t-body">Defects</label>
      <div
        className={`min-h-input-h px-2.5 py-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer
          bg-input border rounded-input transition-colors
          ${showError ? 'border-red-500' : 'border-input-line'}
          ${open ? 'border-accent ring-2 ring-focus-ring/15' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        {selectedOptions.length === 0 && (
          <span className="text-sm2 text-t-lighter select-none">Select defects…</span>
        )}
        {selectedOptions.map(o => (
          <span key={o.id}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
            {o.defect_name}
            <X size={10} className="cursor-pointer hover:text-danger" onClick={e => remove(o.id, e)} />
          </span>
        ))}
        <ChevronDown size={13} className={`ml-auto shrink-0 text-t-lighter transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {showError && <span className="text-xs text-red-500 mt-0.5">{error}</span>}

      {open && (
        <div className="absolute z-[200] top-full left-0 right-0 mt-1 bg-dropdown border border-table-line rounded-card shadow-lg max-h-52 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-3 py-3 text-xs text-t-lighter">No defects available</p>
          ) : (
            options.map(o => (
              <label key={o.id}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-card-alt cursor-pointer select-none"
                onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.includes(o.id)}
                  onChange={() => toggle(o.id)}
                  className="accent-accent w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs font-mono text-t-lighter w-14 shrink-0">{o.code}</span>
                <span className="text-sm2 text-t-body">{o.defect_name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Add/Edit Modal ─────────────────────────────────────────────────────────────
type FormField = 'operation_name' | 'code' | 'sam' | 'machine_type_id' | 'machine_id'
type FormErrors = Partial<Record<FormField, string>>
type Touched = Partial<Record<FormField, boolean>>

const SAM_RE = /^\d{2}:\d{2}$/

const rules: ValidationRules<FormField> = {
  operation_name: { required: 'Operation name is required', minLength: { value: 2, message: 'Minimum 2 characters' } },
  code: { required: 'Code is required' },
  sam: {
    required: 'SAM is required',
    pattern: { value: SAM_RE, message: 'SAM must be in MM:SS format (e.g. 02:30)' },
  },
  machine_type_id: { required: 'Machine type is required' },
  machine_id: { required: 'Machine is required' },
}

interface OperationForm {
  operation_name: string
  code: string
  sam: string
  notes: string
  machine_type_id: string
  machine_id: string
  defect_ids: number[]
}

function OperationModal({
  operation,
  machineGroups,
  defectOptions,
  onClose,
  onSaved,
}: {
  operation: Operation | null
  machineGroups: MachineTypeGroup[]
  defectOptions: DefectOption[]
  onClose: () => void
  onSaved: (msg: string) => void
}) {
  const isEdit = !!operation
  const allTypes = machineGroups.flatMap(g => g.data)

  const [form, setForm] = useState<OperationForm>({
    operation_name: operation?.operation_name ?? '',
    code: operation?.code ?? '',
    sam: operation?.sam ?? '',
    notes: operation?.notes ?? '',
    machine_type_id: operation?.machine_type_id ? String(operation.machine_type_id) : '',
    machine_id: operation?.machine_id ? String(operation.machine_id) : '',
    defect_ids: operation?.defects?.map(d => d.id) ?? [],
  })

  const [machineSpecs, setMachineSpecs] = useState<MachineSpec[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})

  const fetchSpecs = useCallback(async (machineTypeId: string) => {
    if (!machineTypeId) { setMachineSpecs([]); return }
    setSpecsLoading(true)
    try {
      const res = await apiCall<{ data?: { rows?: MachineSpec[] } | MachineSpec[] }>(
        '/machine/machinespecificationlist',
        { method: 'GET', encrypt: false, payload: { machine_id: machineTypeId } }
      )
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data as { rows?: MachineSpec[] })?.rows ?? []
      setMachineSpecs(rows)
    } catch { setMachineSpecs([]) }
    finally { setSpecsLoading(false) }
  }, [])

  useEffect(() => {
    fetchSpecs(form.machine_type_id)
  }, [form.machine_type_id, fetchSpecs])

  const setField = (key: keyof OperationForm, val: string | number[]) => {
    if (key === 'machine_type_id') {
      setForm(f => ({ ...f, machine_type_id: val as string, machine_id: '' }))
      setMachineSpecs([])
    } else {
      setForm(f => ({ ...f, [key]: val }))
    }
    if (key in rules && touched[key as FormField]) {
      setErrors(e => ({ ...e, [key]: validateField(val as string, rules[key as FormField]) }))
    }
  }

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key] as string, rules[key]) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched: Touched = { operation_name: true, code: true, sam: true, machine_type_id: true, machine_id: true }
    setTouched(allTouched)

    const allErrors = validateAll(
      {
        operation_name: form.operation_name,
        code: form.code,
        sam: form.sam,
        machine_type_id: form.machine_type_id,
        machine_id: form.machine_id,
      },
      rules
    )
    setErrors(allErrors as FormErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        operation_name: form.operation_name,
        code: form.code,
        sam: form.sam,
        notes: form.notes,
        machine_type_id: form.machine_type_id,
        machine_id: form.machine_id,
        defect_ids: form.defect_ids,
      }
      let res: { success?: boolean; message?: string }
      if (isEdit) {
        payload.uuid = operation.uuid
        res = await apiCall('/operation/update', { payload })
      } else {
        res = await apiCall('/operation/create', { payload })
      }
      if (res.success === false) { setErrors({ operation_name: res.message || 'Save failed' }); return }
      onSaved(res.message || (isEdit ? 'Operation updated' : 'Operation created'))
      onClose()
    } catch {
      setErrors({ operation_name: 'Failed to save operation. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Operation' : 'Add Operation'}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="operation-form" isLoading={saving}>
            {isEdit ? 'Update Operation' : 'Add Operation'}
          </Button>
        </>
      }
    >
      <form id="operation-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Operation Name"
            value={form.operation_name}
            onChange={e => setField('operation_name', e.target.value)}
            onBlur={() => handleBlur('operation_name')}
            placeholder="e.g. Sleeve Attach"
            error={errors.operation_name}
            touched={touched.operation_name}
            required
          />
          <FormInput
            label="Code"
            value={form.code}
            onChange={e => setField('code', e.target.value)}
            onBlur={() => handleBlur('code')}
            placeholder="e.g. OPR-001"
            error={errors.code}
            touched={touched.code}
            required
          />
        </div>

        <FormInput
          label="SAM (MM:SS)"
          value={form.sam}
          onChange={e => setField('sam', e.target.value)}
          onBlur={() => handleBlur('sam')}
          placeholder="e.g. 02:30"
          error={errors.sam}
          touched={touched.sam}
          required
        />

        <FormSelect
          label="Machine Type"
          value={form.machine_type_id}
          onChange={e => {
            setField('machine_type_id', e.target.value)
            if (touched.machine_type_id)
              setErrors(er => ({ ...er, machine_type_id: e.target.value ? '' : 'Machine type is required' }))
          }}
          onBlur={() => handleBlur('machine_type_id')}
          options={allTypes.map(t => ({ value: t.id, label: t.type_name || t.name }))}
          placeholder="Select machine type"
          error={errors.machine_type_id}
          touched={touched.machine_type_id}
          required
        />

        <FormSelect
          label="Machine"
          value={form.machine_id}
          onChange={e => {
            setField('machine_id', e.target.value)
            if (touched.machine_id)
              setErrors(er => ({ ...er, machine_id: e.target.value ? '' : 'Machine is required' }))
          }}
          onBlur={() => handleBlur('machine_id')}
          options={
            specsLoading
              ? [{ value: '', label: 'Loading…' }]
              : machineSpecs.map(s => ({ value: s.id, label: `${s.machine_id} – ${s.name}` }))
          }
          placeholder={form.machine_type_id ? 'Select machine' : 'Select machine type first'}
          error={errors.machine_id}
          touched={touched.machine_id}
          required
          disabled={!form.machine_type_id || specsLoading}
        />

        <MultiSelectDefects
          selected={form.defect_ids}
          onChange={ids => setField('defect_ids', ids)}
          options={defectOptions}
        />

        <FormTextarea
          label="Notes"
          value={form.notes}
          onChange={e => setField('notes', e.target.value)}
          placeholder="Optional notes"
          rows={2}
        />
      </form>
    </Modal>
  )
}

// ── View Panel (right-side drawer) ────────────────────────────────────────────
function OperationViewPanel({
  operation,
  loading,
  onClose,
}: {
  operation: Record<string, unknown> | null
  loading: boolean
  onClose: () => void
}) {
  if (!operation && !loading) return null

  const defects = (operation?.defects as DefectOption[] | undefined) ?? []
  const machine = (operation?.machine as Record<string, unknown> | undefined)
  const machineType = (operation?.machineType as Record<string, unknown> | undefined)

  return (
    <div className="fixed inset-0 z-[9997] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[1] bg-modal w-full max-w-[480px] h-full flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
          <div className="flex-1 min-w-0">
            {loading || !operation ? (
              <div className="h-5 w-48 bg-table-head rounded animate-pulse" />
            ) : (
              <>
                <h2 className="text-base font-bold text-t-primary leading-snug">
                  {String(operation.code ?? '')} | {String(operation.operation_name ?? '')}
                </h2>
                <p className="text-xs text-t-lighter mt-1">
                  SAM: <span className="font-mono text-accent">{String(operation.sam ?? '—')}</span>
                </p>
              </>
            )}
          </div>
          <button onClick={onClose} className="ml-3 mt-0.5 p-1 text-t-lighter hover:text-t-body transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Meta */}
        {!loading && operation && (
          <div className="flex flex-col gap-2 px-6 pb-4 shrink-0">
            {!!machineType?.type_name && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-t-lighter w-24 shrink-0">Machine Type</span>
                <span className="text-xs font-medium text-t-body">{String(machineType.type_name)}</span>
              </div>
            )}
            {!!machine?.machine_id && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-t-lighter w-24 shrink-0">Machine</span>
                <span className="text-xs font-mono text-t-body">
                  {String(machine.machine_id)} – {String(machine.name ?? '')}
                </span>
              </div>
            )}
            {!!operation.notes && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-t-lighter w-24 shrink-0">Notes</span>
                <span className="text-xs text-t-body leading-relaxed">{String(operation.notes)}</span>
              </div>
            )}
          </div>
        )}

        <div className="h-px bg-table-line mx-6 shrink-0" />

        {/* Defects */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(n => <div key={n} className="h-10 bg-table-head rounded animate-pulse" />)}
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-t-primary mb-3">
                Linked Defects ({defects.length})
              </h3>
              {defects.length === 0 ? (
                <p className="text-xs text-t-lighter py-6 text-center">No defects linked to this operation.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {defects.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-card border border-table-line bg-card">
                      <span className="text-xs font-mono font-semibold text-t-lighter shrink-0">{d.code}</span>
                      <span className="text-sm2 text-t-body truncate">{d.defect_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OperationMasterPage() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMachineTypeId, setFilterMachineTypeId] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(PER_PAGE)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [editOperation, setEditOperation] = useState<Operation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Operation | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [viewOperation, setViewOperation] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [machineGroups, setMachineGroups] = useState<MachineTypeGroup[]>([])
  const [defectOptions, setDefectOptions] = useState<DefectOption[]>([])
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

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

  const fetchOperations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: { operations?: Operation[]; pagination?: { total: number; total_pages: number } }
      }>(
        '/operation/list',
        {
          payload: {
            page,
            per_page: perPage,
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

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpenMenuId(id)
  }

  const allTypes = machineGroups.flatMap(g => g.data)

  const columns = [
    {
      key: '#', header: '#',
      render: (_: Operation, i: number) => <span className="text-t-lighter text-xs">{(page - 1) * perPage + i + 1}</span>,
    },
    {
      key: 'code', header: 'Code',
      render: (row: Operation) => <span className="font-mono text-xs font-semibold text-t-body">{row.code || '—'}</span>,
    },
    {
      key: 'operation_name', header: 'Operation Name',
      render: (row: Operation) => <span className="text-accent font-semibold">{row.operation_name}</span>,
    },
    {
      key: 'machine_type', header: 'Machine Type',
      render: (row: Operation) => <span className="text-t-body text-xs">{row.machineType?.type_name ?? '—'}</span>,
    },
    {
      key: 'machine', header: 'Machine',
      render: (row: Operation) => (
        <span className="font-mono text-xs text-t-body">{row.machine?.machine_id ?? '—'}</span>
      ),
    },
    {
      key: 'sam', header: 'SAM',
      render: (row: Operation) => (
        <span className="font-mono text-xs font-semibold text-t-secondary">{row.sam || '—'}</span>
      ),
    },
    {
      key: 'defects', header: 'Defects',
      render: (row: Operation) => (
        <Badge variant="default">{row.defects?.length ?? 0}</Badge>
      ),
    },
    {
      key: 'view', header: '',
      render: (row: Operation) => (
        <button
          onClick={() => handleView(row.uuid)}
          className="w-7 h-7 flex items-center justify-center rounded border border-table-line text-t-lighter hover:text-accent hover:border-accent transition-colors"
          title="View details"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ),
    },
    {
      key: 'actions', header: '',
      render: (row: Operation) => (
        <button
          onClick={e => openMenu(e, row.id)}
          className="w-7 h-7 flex items-center justify-center rounded text-t-lighter hover:text-t-body hover:bg-card-alt transition-colors"
        >
          <MoreVertical size={14} />
        </button>
      ),
    },
  ]

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showModal && (
        <OperationModal
          operation={editOperation}
          machineGroups={machineGroups}
          defectOptions={defectOptions}
          onClose={() => setShowModal(false)}
          onSaved={msg => { setToast({ message: msg, type: 'success' }); fetchOperations() }}
        />
      )}

      {viewOperation !== null && (
        <OperationViewPanel
          operation={viewLoading ? null : viewOperation}
          loading={viewLoading}
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

      <Toolbar
        title="All Operations"
        search={search}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        onAdd={() => { setEditOperation(null); setShowModal(true) }}
        addLabel="Add Operation"
      >
        <select
          value={filterMachineTypeId}
          onChange={e => { setFilterMachineTypeId(e.target.value); setPage(1) }}
          className="h-8 px-2.5 text-sm2 cursor-pointer
            text-t-secondary bg-input
            border border-input-line rounded-input
            outline-none transition-colors
            focus:border-accent"
        >
          <option value="">All Machine Types</option>
          {allTypes.map(t => (
            <option key={t.id} value={t.id}>{t.type_name || t.name}</option>
          ))}
        </select>
      </Toolbar>

      <DataTable
        columns={columns}
        data={operations}
        loading={loading}
        emptyMessage="No operations found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        countLabel="operation"
      />

      {openMenuId !== null && (
        <>
          <div className="fixed inset-0 z-[9990]" onClick={() => setOpenMenuId(null)} />
          <div
            className="fixed z-[9991] bg-modal border border-table-line rounded-card shadow-lg py-1 min-w-[130px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              onClick={() => {
                const row = operations.find(o => o.id === openMenuId)
                if (row) { setEditOperation(row); setShowModal(true) }
                setOpenMenuId(null)
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-t-body hover:bg-card-alt transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => {
                const row = operations.find(o => o.id === openMenuId)
                if (row) setDeleteTarget(row)
                setOpenMenuId(null)
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </>
      )}
    </AppLayout>
  )
}
