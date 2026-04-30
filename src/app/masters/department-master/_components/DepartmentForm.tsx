'use client'

import { useState } from 'react'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import { apiCall } from '@/services/apiClient'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import { type Department, type BranchOption, type FormField, type FormErrors, type Touched, rules } from './types'

interface DepartmentFormProps {
  dept: Department | null
  branches: BranchOption[]
  onClose: () => void
  onSave: (msg: string) => void
}

export default function DepartmentForm({ dept, branches, onClose, onSave }: DepartmentFormProps) {
  const isEdit = !!dept

  const [form, setForm] = useState({
    name: dept?.name ?? '',
    branch_id: dept?.branch_id?.toString() ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})

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
    const allTouched: Touched = { name: true, branch_id: true }
    setTouched(allTouched)
    const allErrors = validateAll(form, rules)
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        branch_id: form.branch_id,
      }
      if (isEdit) {
        payload.uuid = dept.uuid
        const res = await apiCall<{ success?: boolean; message?: string }>('/department/update', { payload })
        if (res.success === false) { setErrors({ name: res.message || 'Update failed' }); return }
        onSave(res.message || 'Department updated successfully')
      } else {
        const res = await apiCall<{ success?: boolean; message?: string }>('/department/create', { payload })
        if (res.success === false) { setErrors({ name: res.message || 'Creation failed' }); return }
        onSave(res.message || 'Department created successfully')
      }
      onClose()
    } catch {
      setErrors({ name: 'Failed to save department. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Department' : 'Add Department'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="dept-form" isLoading={saving}>
            {isEdit ? 'Update Department' : 'Add Department'}
          </Button>
        </>
      }
    >
      <form id="dept-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="Department Name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g. Spinning"
          error={errors.name}
          touched={touched.name}
          required
        />
        <FormSelect
          label="Branch"
          value={form.branch_id}
          onChange={e => {
            set('branch_id', e.target.value)
            setTouched(t => ({ ...t, branch_id: true }))
            setErrors(er => ({ ...er, branch_id: validateField(e.target.value, rules.branch_id) }))
          }}
          onBlur={() => handleBlur('branch_id')}
          options={branches.map(b => ({ value: b.id, label: b.branch_name }))}
          placeholder="Select branch"
          error={errors.branch_id}
          touched={touched.branch_id}
          required
        />
      </form>
    </Modal>
  )
}
