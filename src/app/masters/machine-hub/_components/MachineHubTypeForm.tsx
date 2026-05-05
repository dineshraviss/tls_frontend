'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormTextarea from '@/components/ui/FormTextarea'
import { apiCall } from '@/services/apiClient'
import type { MachineTypeItem } from './types'

interface Props {
  editType: MachineTypeItem | null
  onClose: () => void
  onSaved: (msg: string) => void
  onError: (msg: string) => void
}

export default function MachineHubTypeForm({ editType, onClose, onSaved, onError }: Props) {
  const isEdit = !!editType
  const [form, setForm] = useState({
    type_name: editType?.type_name ?? '',
    notes: editType?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.type_name.trim()) {
      setFieldError('Machine type name is required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload: Record<string, unknown> = { type_name: form.type_name, notes: form.notes }
      if (isEdit) payload.uuid = editType.uuid
      const res = await apiCall<{ success?: boolean | number; message?: string }>(
        isEdit ? '/machine/update' : '/machine/create',
        { payload }
      )
      if (!res.success) {
        setFormError(res.message || (isEdit ? 'Update failed' : 'Create failed'))
        return
      }
      onSaved(res.message || (isEdit ? 'Machine type updated' : 'Machine type created'))
      onClose()
    } catch {
      setFormError(isEdit ? 'Failed to update machine type' : 'Failed to create machine type')
    } finally {
      setSaving(false)
    }
  }

  const footer = (
    <>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant="primary" type="submit" form="machine-type-form" isLoading={saving}>
        {isEdit ? 'Update Machine Type' : 'Add Machine Type'}
      </Button>
    </>
  )

  return (
    <Modal title={isEdit ? 'Edit Machine Type' : 'Add Machine Type'} onClose={onClose} footer={footer}>
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
      <form id="machine-type-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="Machine Type Name"
          required
          value={form.type_name}
          onChange={e => {
            setForm(f => ({ ...f, type_name: e.target.value }))
            setFieldError('')
          }}
          placeholder="e.g. 2T Flatlock"
          error={fieldError}
          touched={!!fieldError}
          autoFocus
        />
        <FormTextarea
          label="Notes"
          value={form.notes ?? ''}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Optional description"
          rows={3}
        />
      </form>
    </Modal>
  )
}
