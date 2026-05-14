'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import { apiCall } from '@/services/apiClient'
import type { Style, OBOption, FormField, FormErrors, Touched } from './types'
import { rules } from './types'

interface Props {
  editStyle: Style | null
  saving: boolean
  formError: string | null
  onSave: (payload: Record<string, unknown>) => void
  onClose: () => void
}

export default function StyleForm({ editStyle, saving, formError, onSave, onClose }: Props) {
  const [form, setForm] = useState({ buyer: '', style_name: '', operation_bulletin_id: '' })
  const [errors, setErrors]   = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})
  const [obList, setObList]     = useState<OBOption[]>([])
  const [obLoading, setObLoading] = useState(true)

  // Fetch OB list for dropdown
  useEffect(() => {
    setObLoading(true)
    apiCall<Record<string, unknown>>(
      '/operationbullatin/list',
      { method: 'GET', encrypt: false, payload: { page: '1', per_page: '500', search: '' } }
    ).then(res => {
      // Handle multiple possible response shapes
      const d = res.data as Record<string, unknown> | undefined
      const list =
        Array.isArray(res.data) ? (res.data as OBOption[]) :
        Array.isArray(d?.operation_bulletins) ? (d.operation_bulletins as OBOption[]) :
        Array.isArray(d?.bulletins)           ? (d.bulletins as OBOption[]) :
        Array.isArray(d?.data)                ? (d.data as OBOption[]) :
        []
      setObList(list)
    }).catch(() => setObList([]))
    .finally(() => setObLoading(false))
  }, [])

  useEffect(() => {
    if (editStyle) {
      setForm({
        buyer: editStyle.buyer ?? '',
        style_name: editStyle.style_name ?? '',
        operation_bulletin_id: editStyle.operation_bulletin_id ? String(editStyle.operation_bulletin_id) : '',
      })
    } else {
      setForm({ buyer: '', style_name: '', operation_bulletin_id: '' })
    }
    setErrors({})
    setTouched({})
  }, [editStyle])

  const set = (key: FormField, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if (touched[key]) setErrors(e => ({ ...e, [key]: validateField(val, rules[key]) }))
  }

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key], rules[key]) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ buyer: true, style_name: true, operation_bulletin_id: true })
    const allErrors = validateAll(form, rules)
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    const payload: Record<string, unknown> = {
      buyer: form.buyer,
      style_name: form.style_name,
      operation_bulletin_id: form.operation_bulletin_id,
    }
    if (editStyle) {
      payload.uuid = editStyle.uuid
      if (editStyle.style_no) payload.style_no = editStyle.style_no
    }
    onSave(payload)
  }

  const obOptions = obList.map(ob => ({
    value: ob.id,
    label: ob.total_sam
      ? `OB #${ob.id} — SAM: ${Number(ob.total_sam).toFixed(2)}, Manning: ${ob.req_manning ?? '—'}`
      : `OB #${ob.id}`,
  }))

  const footer = (
    <>
      <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
      <Button variant="primary" type="submit" form="style-form" isLoading={saving}>
        {editStyle ? 'Update Style' : 'Add Style'}
      </Button>
    </>
  )

  return (
    <Modal title={editStyle ? 'Edit Style' : 'Add OB Style'} onClose={onClose} footer={footer}>
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
      <form id="style-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="Buyer"
          value={form.buyer}
          onChange={e => set('buyer', e.target.value)}
          onBlur={() => handleBlur('buyer')}
          placeholder="Enter buyer name"
          error={errors.buyer}
          touched={touched.buyer}
          required
        />
        <FormInput
          label="Style Name"
          value={form.style_name}
          onChange={e => set('style_name', e.target.value)}
          onBlur={() => handleBlur('style_name')}
          placeholder="Enter style name"
          error={errors.style_name}
          touched={touched.style_name}
          required
        />
        <FormSelect
          label="Operation Bulletin"
          value={form.operation_bulletin_id}
          onChange={e => set('operation_bulletin_id', e.target.value)}
          onBlur={() => handleBlur('operation_bulletin_id')}
          options={obOptions}
          placeholder={obLoading ? 'Loading...' : obList.length === 0 ? 'No bulletins found' : 'Select operation bulletin'}
          error={errors.operation_bulletin_id}
          touched={touched.operation_bulletin_id}
          required
        />
      </form>
    </Modal>
  )
}
