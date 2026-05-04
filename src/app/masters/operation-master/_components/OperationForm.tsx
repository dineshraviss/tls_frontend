'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import FormTextarea from '@/components/ui/FormTextarea'
import { ChevronDown, X } from 'lucide-react'
import { apiCall } from '@/services/apiClient'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import type {
  Operation,
  MachineTypeGroup,
  MachineSpec,
  DefectOption,
  OperationFormData,
  FormField,
  FormErrors,
  Touched,
} from './types'
import { rules } from './types'

// ── MultiSelectDefects ─────────────────────────────────────────────────────────

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

// ── OperationForm ──────────────────────────────────────────────────────────────

interface OperationFormProps {
  editOperation: Operation | null
  machineGroups: MachineTypeGroup[]
  defectOptions: DefectOption[]
  onClose: () => void
  onSave: (msg: string) => void
}

export default function OperationForm({
  editOperation,
  machineGroups,
  defectOptions,
  onClose,
  onSave,
}: OperationFormProps) {
  const isEdit = !!editOperation
  const allTypes = machineGroups.flatMap(g => g.data)

  const [form, setForm] = useState<OperationFormData>({
    operation_name: editOperation?.operation_name ?? '',
    code: editOperation?.code ?? '',
    sam: editOperation?.sam ? String(editOperation.sam) : '',
    notes: editOperation?.notes ?? '',
    machine_type_id: editOperation?.machine_type_id ? String(editOperation.machine_type_id) : '',
    machine_id: editOperation?.machine_id ? String(editOperation.machine_id) : '',
    defect_ids: editOperation?.defect_details?.map(d => d.id) ?? [],
  })

  const [machineSpecs, setMachineSpecs] = useState<MachineSpec[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})
  const [formError, setFormError] = useState('')

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

  const setField = (key: keyof OperationFormData, val: string | number[]) => {
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
    const allTouched: Touched = { operation_name: true, code: true, sam: true, machine_type_id: true }
    setTouched(allTouched)

    const allErrors = validateAll(
      {
        operation_name: form.operation_name,
        code: form.code,
        sam: form.sam,
        machine_type_id: form.machine_type_id,
      },
      rules
    )
    setErrors(allErrors as FormErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    setFormError('')
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
        payload.uuid = editOperation.uuid
        res = await apiCall('/operation/update', { payload })
      } else {
        res = await apiCall('/operation/create', { payload })
      }
      if (res.success === false) { setFormError(res.message || 'Save failed'); return }
      onSave(res.message || (isEdit ? 'Operation updated' : 'Operation created'))
      onClose()
    } catch {
      setFormError('Failed to save operation. Please try again.')
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
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
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
          onChange={e => setField('machine_id', e.target.value)}
          options={
            specsLoading
              ? [{ value: '', label: 'Loading…' }]
              : machineSpecs.map(s => ({ value: s.id, label: `${s.machine_no ?? s.id}` }))
          }
          placeholder={form.machine_type_id ? 'Select machine (optional)' : 'Select machine type first'}
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
