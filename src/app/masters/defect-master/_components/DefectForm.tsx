'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import {
  type Defect,
  type Cap,
  type DefectForm as DefectFormState,
  type FormField,
  type FormErrors,
  type Touched,
  rules,
} from './types'

interface DefectFormProps {
  defect: Defect | null
  departments: { id: number; name: string }[]
  severityOptions: { id: number; value: string }[]
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => Promise<{ success?: boolean; message?: string }>
}

export default function DefectForm({
  defect,
  departments,
  severityOptions,
  onClose,
  onSave,
}: DefectFormProps) {
  const isEdit = !!defect

  const matchedSeverity = severityOptions.find(
    o =>
      String(o.id) === String(defect?.severity ?? '') ||
      o.value.toLowerCase() === String(defect?.severity ?? '').toLowerCase()
  )

  const [form, setForm] = useState<DefectFormState>({
    defect_name: defect?.defect_name ?? '',
    category: defect?.category ?? '',
    severity: matchedSeverity ? String(matchedSeverity.id) : '',
    escalation_flag: (defect?.escalation_flag ?? 0) === 1,
    department_id: defect?.department_id?.toString() ?? '',
    caps: defect?.caps?.length
      ? defect.caps.map(c => ({ cap_name: c.cap_name, short_name: c.short_name ?? '', notes: c.notes ?? '' }))
      : [{ cap_name: '', short_name: '', notes: '' }],
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})
  const [formError, setFormError] = useState('')

  const setField = (key: keyof DefectFormState, val: string | boolean) => {
    if (key === 'escalation_flag') {
      setForm(f => ({ ...f, escalation_flag: val as boolean, department_id: val ? f.department_id : '' }))
      return
    }
    setForm(f => ({ ...f, [key]: val }))
    if (key in rules && touched[key as FormField]) {
      setErrors(e => ({ ...e, [key]: validateField(val as string, rules[key as FormField]) }))
    }
  }

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key], rules[key]) }))
  }

  const addCap = () => setForm(f => ({ ...f, caps: [...f.caps, { cap_name: '', short_name: '', notes: '' }] }))
  const removeCap = (i: number) => setForm(f => ({ ...f, caps: f.caps.filter((_, idx) => idx !== i) }))
  const setCap = (i: number, field: keyof Cap, val: string) =>
    setForm(f => ({ ...f, caps: f.caps.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched: Touched = { defect_name: true, category: true, severity: true }
    setTouched(allTouched)

    const allErrors = validateAll(
      { defect_name: form.defect_name, category: form.category, severity: form.severity },
      rules
    )
    setErrors(allErrors as FormErrors)
    if (hasErrors(allErrors)) return

    const capsInvalid = form.caps.some(c => !c.cap_name.trim())
    if (capsInvalid) {
      setErrors(e => ({ ...e, defect_name: 'All CAP name fields are required' }))
      return
    }

    setSaving(true)
    setFormError('')
    try {
      const payload: Record<string, unknown> = {
        defect_name: form.defect_name,
        category: form.category,
        severity: form.severity,
        escalation_flag: form.escalation_flag ? 1 : 0,
        department_id: !form.escalation_flag ? form.department_id : '',
        caps: form.caps.map(c => ({ cap_name: c.cap_name, short_name: c.short_name, notes: c.notes })),
      }
      if (isEdit) payload.uuid = defect.uuid

      const res = await onSave(payload)
      if (res.success === false) {
        setFormError(res.message || 'Save failed')
        return
      }
      onClose()
    } catch {
      setFormError('Failed to save defect. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Defect' : 'Add Defect'}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="defect-form" isLoading={saving}>
            {isEdit ? 'Update Defect' : 'Add Defect'}
          </Button>
        </>
      }
    >
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
      <form id="defect-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="Defect Name"
          value={form.defect_name}
          onChange={e => setField('defect_name', e.target.value)}
          onBlur={() => handleBlur('defect_name')}
          placeholder="e.g. Machine Oil Stain"
          error={errors.defect_name}
          touched={touched.defect_name}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Category"
            value={form.category}
            onChange={e => setField('category', e.target.value)}
            onBlur={() => handleBlur('category')}
            placeholder="e.g. Stitch"
            error={errors.category}
            touched={touched.category}
            required
          />
          <FormSelect
            label="Severity"
            value={form.severity}
            onChange={e => {
              setField('severity', e.target.value)
              if (touched.severity)
                setErrors(er => ({ ...er, severity: e.target.value ? '' : 'Severity is required' }))
            }}
            onBlur={() => handleBlur('severity')}
            options={severityOptions.map(o => ({ value: o.id, label: o.value }))}
            placeholder="Select severity"
            error={errors.severity}
            touched={touched.severity}
            required
          />
        </div>

        {/* Escalation toggle */}
        <div className="flex items-center justify-between py-1">
          <label className="text-xs font-medium text-t-body">Escalation</label>
          <button
            type="button"
            onClick={() => setField('escalation_flag', !form.escalation_flag)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
              ${form.escalation_flag ? 'bg-accent' : 'bg-input-line'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
              ${form.escalation_flag ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Department — hidden when escalation is ON */}
        {!form.escalation_flag && (
          <FormSelect
            label="Department"
            value={form.department_id}
            onChange={e => {
              setField('department_id', e.target.value)
              setTouched(t => ({ ...t, department_id: true }))
              setErrors(er => ({ ...er, department_id: e.target.value ? '' : 'Department is required' }))
            }}
            onBlur={() => {
              setTouched(t => ({ ...t, department_id: true }))
              setErrors(er => ({ ...er, department_id: form.department_id ? '' : 'Department is required' }))
            }}
            options={departments.map(d => ({ value: d.id, label: d.name }))}
            placeholder="Select department"
            error={errors.department_id}
            touched={touched.department_id}
          />
        )}

        {/* CAP section */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-t-body">Corrective Action Plan (CAP)</label>
          {form.caps.map((cap, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 p-3 rounded-card border border-table-line bg-card-alt relative"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-accent">CAP-{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeCap(i)}
                  disabled={form.caps.length === 1}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-table-line text-t-lighter hover:text-red-500 hover:border-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-t-lighter disabled:hover:border-table-line"
                >
                  <Minus size={11} />
                </button>
              </div>
              <FormInput
                label="CAP Name"
                value={cap.cap_name}
                onChange={e => setCap(i, 'cap_name', e.target.value)}
                placeholder="e.g. Clean the Machine"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="Short Name"
                  value={cap.short_name}
                  onChange={e => setCap(i, 'short_name', e.target.value)}
                  placeholder="e.g. Cap"
                />
                <FormInput
                  label="Notes"
                  value={cap.notes}
                  onChange={e => setCap(i, 'notes', e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCap}
            className="flex items-center gap-1.5 text-xs text-accent hover:underline w-fit"
          >
            <Plus size={13} /> Add More CAP
          </button>
        </div>
      </form>
    </Modal>
  )
}
