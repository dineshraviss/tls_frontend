'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import { type Designation, type FormField, type FormErrors, type Touched, rules } from './types'

interface DesignationFormProps {
  designation: Designation | null
  departments: { id: number; name: string }[]
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => Promise<{ success?: boolean; message?: string }>
}

export default function DesignationForm({
  designation,
  departments,
  onClose,
  onSave,
}: DesignationFormProps) {
  const isEdit = !!designation

  const [form, setForm] = useState({
    designation_name: designation?.designation_name ?? '',
    dept_id: designation?.dept_id?.toString() ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})
  const [formError, setFormError] = useState('')

  const set = (key: FormField, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if (touched[key]) setErrors(e => ({ ...e, [key]: validateField(val, rules[key]) }))
  }

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key], rules[key]) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched: Touched = { designation_name: true, dept_id: true }
    setTouched(allTouched)
    const allErrors = validateAll(form, rules)
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    setFormError('')
    try {
      const payload: Record<string, unknown> = {
        designation_name: form.designation_name,
        dept_id: form.dept_id,
      }
      if (isEdit) payload.uuid = designation.uuid

      const res = await onSave(payload)
      if (res.success === false) {
        setFormError(res.message || (isEdit ? 'Update failed' : 'Creation failed'))
        return
      }
      onClose()
    } catch {
      setFormError('Failed to save designation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Designation' : 'Add Designation'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="designation-form" isLoading={saving}>
            {isEdit ? 'Update Designation' : 'Add Designation'}
          </Button>
        </>
      }
    >
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
      <form id="designation-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="Designation Name"
          value={form.designation_name}
          onChange={e => set('designation_name', e.target.value)}
          onBlur={() => handleBlur('designation_name')}
          placeholder="e.g. Senior Engineer"
          error={errors.designation_name}
          touched={touched.designation_name}
          required
        />
        <FormSelect
          label="Department"
          value={form.dept_id}
          onChange={e => {
            set('dept_id', e.target.value)
            setTouched(t => ({ ...t, dept_id: true }))
            setErrors(er => ({ ...er, dept_id: validateField(e.target.value, rules.dept_id) }))
          }}
          onBlur={() => handleBlur('dept_id')}
          options={departments.map(d => ({ value: d.id, label: d.name }))}
          placeholder="Select department"
          error={errors.dept_id}
          touched={touched.dept_id}
          required
        />
      </form>
    </Modal>
  )
}
