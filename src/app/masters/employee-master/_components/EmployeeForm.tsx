'use client'

import { useState } from 'react'
import { apiCall } from '@/services/apiClient'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import {
  type Employee,
  type BranchOption,
  type RoleOption,
  type DeptOption,
  type FormField,
  type FormErrors,
  type Touched,
  rules,
} from './types'

interface EmployeeFormProps {
  emp: Employee | null
  branches: BranchOption[]
  roles: RoleOption[]
  allDepts: DeptOption[]
  onClose: () => void
  onSaved: (msg: string) => void
}

export default function EmployeeForm({
  emp,
  branches,
  roles,
  allDepts,
  onClose,
  onSaved,
}: EmployeeFormProps) {
  const isEdit = !!emp

  const [form, setForm] = useState({
    name: emp?.name ?? '',
    last_name: emp?.last_name ?? '',
    mobile: emp?.mobile ?? '',
    role: emp?.role?.toString() ?? '',
    join_date: emp?.join_date ?? '',
    department_id: emp?.department_id?.toString() ?? '',
    branch_id: emp?.branch_id?.toString() ?? '',
    email: emp?.email ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})

  const filteredDepts = allDepts.filter(
    d => !form.branch_id || d.branch_id === parseInt(form.branch_id)
  )

  const set = (key: FormField | 'email', val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if (key !== 'email' && touched[key as FormField]) {
      setErrors(e => ({ ...e, [key]: validateField(val, rules[key as FormField]) }))
    }
  }

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key], rules[key]) }))
  }

  const handleBranchChange = (val: string) => {
    setForm(f => ({ ...f, branch_id: val, department_id: '' }))
    setTouched(t => ({ ...t, branch_id: true }))
    setErrors(e => ({ ...e, branch_id: validateField(val, rules.branch_id) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched: Touched = {
      name: true,
      last_name: true,
      mobile: true,
      role: true,
      join_date: true,
      department_id: true,
      branch_id: true,
    }
    setTouched(allTouched)
    const formData = {
      name: form.name,
      last_name: form.last_name,
      mobile: form.mobile,
      role: form.role,
      join_date: form.join_date,
      department_id: form.department_id,
      branch_id: form.branch_id,
    }
    const allErrors = validateAll(formData, rules)
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        last_name: form.last_name,
        mobile: form.mobile,
        role: form.role,
        join_date: form.join_date,
        department_id: form.department_id,
        branch_id: form.branch_id,
        email: form.email || null,
      }
      if (isEdit) {
        payload.uuid = emp.uuid
        const res = await apiCall<{ success?: boolean; message?: string }>('/employee/update', { payload })
        if (res.success === false) { setErrors({ name: res.message || 'Update failed' }); return }
        onSaved(res.message || 'Employee updated successfully')
      } else {
        const res = await apiCall<{ success?: boolean; message?: string }>('/employee/create', { payload })
        if (res.success === false) { setErrors({ name: res.message || 'Creation failed' }); return }
        onSaved(res.message || 'Employee created successfully')
      }
      onClose()
    } catch {
      setErrors({ name: 'Failed to save employee. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="emp-form" isLoading={saving}>
            {isEdit ? 'Update Employee' : 'Add Employee'}
          </Button>
        </>
      }
    >
      <form id="emp-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2.5">
          <FormInput
            label="First Name"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="e.g. John"
            error={errors.name}
            touched={touched.name}
            required
          />
          <FormInput
            label="Last Name"
            value={form.last_name}
            onChange={e => set('last_name', e.target.value)}
            onBlur={() => handleBlur('last_name')}
            placeholder="e.g. Doe"
            error={errors.last_name}
            touched={touched.last_name}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <FormInput
            label="Mobile"
            value={form.mobile}
            onChange={e => set('mobile', e.target.value)}
            onBlur={() => handleBlur('mobile')}
            placeholder="10-digit number"
            error={errors.mobile}
            touched={touched.mobile}
            required
          />
          <FormInput
            label="Email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="Optional"
            type="email"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <FormSelect
            label="Branch"
            value={form.branch_id}
            onChange={e => handleBranchChange(e.target.value)}
            onBlur={() => handleBlur('branch_id')}
            options={branches.map(b => ({ value: b.id, label: b.branch_name }))}
            placeholder="Select branch"
            error={errors.branch_id}
            touched={touched.branch_id}
            required
          />
          <FormSelect
            label="Department"
            value={form.department_id}
            onChange={e => {
              set('department_id', e.target.value)
              setTouched(t => ({ ...t, department_id: true }))
              setErrors(er => ({ ...er, department_id: validateField(e.target.value, rules.department_id) }))
            }}
            onBlur={() => handleBlur('department_id')}
            options={filteredDepts.map(d => ({ value: d.id, label: d.name }))}
            placeholder={form.branch_id ? 'Select department' : 'Select branch first'}
            disabled={!form.branch_id}
            error={errors.department_id}
            touched={touched.department_id}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <FormSelect
            label="Role"
            value={form.role}
            onChange={e => {
              set('role', e.target.value)
              setTouched(t => ({ ...t, role: true }))
              setErrors(er => ({ ...er, role: validateField(e.target.value, rules.role) }))
            }}
            onBlur={() => handleBlur('role')}
            options={roles.map(r => ({ value: r.role ?? r.id, label: r.name }))}
            placeholder="Select role"
            error={errors.role}
            touched={touched.role}
            required
          />
          <FormInput
            label="Join Date"
            type="date"
            value={form.join_date}
            onChange={e => set('join_date', e.target.value)}
            onBlur={() => handleBlur('join_date')}
            error={errors.join_date}
            touched={touched.join_date}
            required
          />
        </div>
      </form>
    </Modal>
  )
}
