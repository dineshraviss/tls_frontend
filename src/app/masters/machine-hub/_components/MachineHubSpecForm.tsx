'use client'

import { useState, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import { apiCall, apiUpload } from '@/services/apiClient'
import { useDropdownData } from '@/hooks/useDropdownData'
import { Upload } from 'lucide-react'
import { CONDITION_OPTIONS } from './types'
import type { MachineSpec } from './types'

interface Props {
  spec: MachineSpec | null
  machineTypeId: number
  onClose: () => void
  onSaved: (msg: string) => void
  onError: (msg: string) => void
}

export default function MachineHubSpecForm({ spec, machineTypeId, onClose, onSaved, onError }: Props) {
  const isEdit = !!spec
  const { branches } = useDropdownData({ branches: true })
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    machine_no: spec?.machine_no ?? '',
    brand: spec?.brand ?? '',
    model_no: spec?.model_no ?? '',
    condition: spec?.condition?.toString() ?? '1',
    serial_no: spec?.serial_no ?? '',
    purchase_date: spec?.purchase_date ?? '',
    last_oil_change: spec?.last_oil_change ?? '',
    next_maintenance: spec?.next_maintenance ?? '',
    warranty: spec?.warranty?.toString() ?? '',
    branch_id: spec?.branch_id?.toString() ?? '',
    qr_code: spec?.qr_code?.toString() ?? '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setFormError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.machine_no.trim()) {
      setFieldError('Machine No is required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      let res: { success?: boolean | number; message?: string }
      if (isEdit) {
        const payload: Record<string, unknown> = { uuid: spec.uuid, ...form, machine_type_id: machineTypeId }
        if (file) {
          const fd = new FormData()
          Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)))
          fd.append('file', file)
          res = await apiUpload('/specification/update', fd)
        } else {
          res = await apiCall('/specification/update', { payload })
        }
      } else {
        const fd = new FormData()
        Object.entries({ ...form, machine_type_id: machineTypeId }).forEach(([k, v]) =>
          fd.append(k, String(v))
        )
        if (file) fd.append('file', file)
        res = await apiUpload('/specification/create', fd)
      }
      if (!res.success) {
        setFormError(res.message || 'Save failed')
        return
      }
      onSaved(res.message || (isEdit ? 'Specification updated' : 'Specification created'))
      onClose()
    } catch {
      setFormError('Failed to save specification')
    } finally {
      setSaving(false)
    }
  }

  const footer = (
    <>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant="primary" type="submit" form="spec-form" isLoading={saving}>
        {isEdit ? 'Update' : 'Add Specification'}
      </Button>
    </>
  )

  return (
    <Modal
      title={isEdit ? 'Edit Specification' : 'Add Machine Specification'}
      onClose={onClose}
      size="lg"
      footer={footer}
    >
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
      <form id="spec-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Machine No"
            value={form.machine_no}
            onChange={e => { set('machine_no', e.target.value); setFieldError('') }}
            placeholder="e.g. MA006"
            required
            error={fieldError}
            touched={!!fieldError}
          />
          <FormInput
            label="Brand"
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
            placeholder="e.g. Dream Stich"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Model No"
            value={form.model_no}
            onChange={e => set('model_no', e.target.value)}
            placeholder="e.g. 2020LL1"
          />
          <FormSelect
            label="Condition"
            value={form.condition}
            onChange={e => set('condition', e.target.value)}
            options={CONDITION_OPTIONS}
            placeholder="Select condition"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Serial No"
            value={form.serial_no}
            onChange={e => set('serial_no', e.target.value)}
            placeholder="e.g. SN006"
          />
          <FormInput
            label="Warranty (years)"
            type="number"
            value={form.warranty}
            onChange={e => set('warranty', e.target.value)}
            placeholder="e.g. 2"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="Purchase Date"
            type="date"
            value={form.purchase_date}
            onChange={e => set('purchase_date', e.target.value)}
          />
          <FormInput
            label="Last Oil Change"
            type="date"
            value={form.last_oil_change}
            onChange={e => set('last_oil_change', e.target.value)}
          />
          <FormInput
            label="Next Maintenance"
            type="date"
            value={form.next_maintenance}
            onChange={e => set('next_maintenance', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            label="Branch"
            value={form.branch_id}
            onChange={e => set('branch_id', e.target.value)}
            options={branches.map(b => ({ value: b.id, label: b.branch_name }))}
            placeholder="Select branch"
          />
          <FormInput
            label="QR Code"
            value={form.qr_code}
            onChange={e => set('qr_code', e.target.value)}
            placeholder="e.g. 56"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-t-body">Attachment (PDF / Image)</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 h-input-h px-2.5 border border-dashed border-input-line rounded-input cursor-pointer hover:border-accent transition-colors"
          >
            <Upload size={13} className="text-t-lighter" />
            <span className="text-sm2 text-t-lighter">
              {file ? file.name : 'Click to upload file'}
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </form>
    </Modal>
  )
}
