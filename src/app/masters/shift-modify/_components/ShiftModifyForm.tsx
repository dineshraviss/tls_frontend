'use client'

import { useState } from 'react'
import { apiCall } from '@/services/apiClient'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import { type Shift, type BranchOption, type ZoneOption, type FormField, type FormErrors, type Touched, rules, SHIFT_TYPES } from './types'

interface ShiftModifyFormProps {
  shift: Shift | null
  branches: BranchOption[]
  allZones: ZoneOption[]
  onClose: () => void
  onSave: (msg: string) => void
}

export default function ShiftModifyForm({ shift, branches, allZones, onClose, onSave }: ShiftModifyFormProps) {
  const isEdit = !!shift
  const [form, setForm] = useState({
    shift_name: shift?.shift_name ?? '',
    type: shift?.type ?? '',
    start_time: shift?.start_time?.slice(0, 5) ?? '',
    end_time: shift?.end_time?.slice(0, 5) ?? '',
    hrs: shift?.hrs ?? '',
    breakMins: shift?.breakMins ?? '',
    start_buffer_time: shift?.start_buffer_time?.slice(0, 5) ?? '',
    end_buffer_time: shift?.end_buffer_time?.slice(0, 5) ?? '',
    branch_id: shift?.branch_id?.toString() ?? '',
    zone_id: shift?.zone_id?.toString() ?? '',
    date: shift?.date ?? '',
    lunch_start: shift?.lunch_start?.slice(0, 5) ?? '',
    lunch_end: shift?.lunch_end?.slice(0, 5) ?? '',
    mrg_break_start: shift?.mrg_break_start?.slice(0, 5) ?? '',
    mrg_break_end: shift?.mrg_break_end?.slice(0, 5) ?? '',
    evg_break_start: shift?.evg_break_start?.slice(0, 5) ?? '',
    evg_break_end: shift?.evg_break_end?.slice(0, 5) ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})

  const filteredZones = allZones.filter(z => z.branch_id === parseInt(form.branch_id))

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if (touched[key as FormField] && rules[key as FormField]) {
      setErrors(e => ({ ...e, [key]: validateField(val, rules[key as FormField]) }))
    }
  }

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key as keyof typeof form], rules[key]) }))
  }

  const handleBranchChange = (val: string) => {
    setForm(f => ({ ...f, branch_id: val, zone_id: '' }))
    setTouched(t => ({ ...t, branch_id: true }))
    setErrors(e => ({ ...e, branch_id: validateField(val, rules.branch_id) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched: Touched = { shift_name: true, type: true, start_time: true, end_time: true, hrs: true, breakMins: true, branch_id: true, zone_id: true }
    setTouched(allTouched)
    const formData = { shift_name: form.shift_name, type: form.type, start_time: form.start_time, end_time: form.end_time, hrs: form.hrs, breakMins: form.breakMins, branch_id: form.branch_id, zone_id: form.zone_id }
    const allErrors = validateAll(formData, rules)
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      if (isEdit) {
        payload.uuid = shift.uuid
        const res = await apiCall<{ success?: boolean; message?: string }>('/shiftmodify/update', { payload })
        if (res.success === false) { setErrors({ shift_name: res.message || 'Update failed' }); return }
        onSave(res.message || 'Shift updated successfully')
      } else {
        const res = await apiCall<{ success?: boolean; message?: string }>('/shiftmodify/create', { payload })
        if (res.success === false) { setErrors({ shift_name: res.message || 'Creation failed' }); return }
        onSave(res.message || 'Shift created successfully')
      }
      onClose()
    } catch {
      setErrors({ shift_name: 'Failed to save shift. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const sectionTitle = (text: string) => (
    <p className="text-xs font-bold text-t-secondary mt-1 mb-0">{text}</p>
  )

  return (
    <Modal
      title={isEdit ? 'Edit Shift' : 'Add Shift Modify'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="shift-form" isLoading={saving}>
            {isEdit ? 'Update Shift' : 'Add Shift Modify'}
          </Button>
        </>
      }
    >
      <form id="shift-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
          {/* ── Left Column ── */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              <FormInput label="Shift Name" value={form.shift_name} onChange={e => set('shift_name', e.target.value)} onBlur={() => handleBlur('shift_name')} placeholder="Shift A" error={errors.shift_name} touched={touched.shift_name} required />
              <FormSelect label="Type" value={form.type} onChange={e => { set('type', e.target.value); setTouched(t => ({ ...t, type: true })); setErrors(er => ({ ...er, type: validateField(e.target.value, rules.type) })) }} options={SHIFT_TYPES} placeholder="Select type" error={errors.type} touched={touched.type} required />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FormSelect label="Branch" value={form.branch_id} onChange={e => handleBranchChange(e.target.value)} onBlur={() => handleBlur('branch_id')} options={branches.map(b => ({ value: b.id, label: b.branch_name }))} placeholder="Select branch" error={errors.branch_id} touched={touched.branch_id} required />
              <FormSelect label="Zone" value={form.zone_id} onChange={e => { set('zone_id', e.target.value); setTouched(t => ({ ...t, zone_id: true })); setErrors(er => ({ ...er, zone_id: validateField(e.target.value, rules.zone_id) })) }} options={filteredZones.map(z => ({ value: z.id, label: z.zone_name }))} placeholder={form.branch_id ? 'Select zone' : 'Select branch first'} disabled={!form.branch_id} error={errors.zone_id} touched={touched.zone_id} required />
            </div>

            {sectionTitle('Shift window')}
            <div className="grid grid-cols-2 gap-2.5">
              <FormInput label="Start time" type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} onBlur={() => handleBlur('start_time')} error={errors.start_time} touched={touched.start_time} required />
              <FormInput label="End time" type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} onBlur={() => handleBlur('end_time')} error={errors.end_time} touched={touched.end_time} required />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FormInput label="Buffer login" type="time" value={form.start_buffer_time} onChange={e => set('start_buffer_time', e.target.value)} placeholder="00:10" />
              <FormInput label="Buffer logout" type="time" value={form.end_buffer_time} onChange={e => set('end_buffer_time', e.target.value)} placeholder="00:15" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FormInput label="Hours" value={form.hrs} onChange={e => set('hrs', e.target.value)} onBlur={() => handleBlur('hrs')} placeholder="8" error={errors.hrs} touched={touched.hrs} required />
              <FormInput label="Break (mins)" value={form.breakMins} onChange={e => set('breakMins', e.target.value)} onBlur={() => handleBlur('breakMins')} placeholder="30" error={errors.breakMins} touched={touched.breakMins} required />
            </div>
            <FormInput label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-3 md:border-l md:border-header-line md:pl-6 pt-3 md:pt-0">
            {sectionTitle('Lunch break')}
            <div className="grid grid-cols-2 gap-2.5">
              <FormInput label="Lunch start" type="time" value={form.lunch_start} onChange={e => set('lunch_start', e.target.value)} />
              <FormInput label="Lunch end" type="time" value={form.lunch_end} onChange={e => set('lunch_end', e.target.value)} />
            </div>

            {sectionTitle('Morning Short breaks')}
            <div className="grid grid-cols-2 gap-2.5">
              <FormInput label="Break start" type="time" value={form.mrg_break_start} onChange={e => set('mrg_break_start', e.target.value)} />
              <FormInput label="Break end" type="time" value={form.mrg_break_end} onChange={e => set('mrg_break_end', e.target.value)} />
            </div>

            {sectionTitle('Evening Short breaks')}
            <div className="grid grid-cols-2 gap-2.5">
              <FormInput label="Break start" type="time" value={form.evg_break_start} onChange={e => set('evg_break_start', e.target.value)} />
              <FormInput label="Break end" type="time" value={form.evg_break_end} onChange={e => set('evg_break_end', e.target.value)} />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
