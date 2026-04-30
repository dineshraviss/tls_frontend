'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormTextarea from '@/components/ui/FormTextarea'
import FormSelect from '@/components/ui/FormSelect'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import type { Company, FormField, FormErrors, Touched } from './types'
import { rules, COMPANY_TYPE_OPTIONS } from './types'

interface Props {
  editCompany: Company | null
  saving: boolean
  formError: string | null
  onSave: (payload: Record<string, unknown>) => void
  onClose: () => void
}

export default function CompanyForm({ editCompany, saving, formError, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    company_name: '',
    address: '',
    lat: '',
    lng: '',
    company_type: '',
    max_slot: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})

  useEffect(() => {
    if (editCompany) {
      setForm({
        company_name: editCompany.company_name ?? '',
        address: editCompany.address ?? '',
        lat: editCompany.location?.lat?.toString() ?? '',
        lng: editCompany.location?.lng?.toString() ?? '',
        company_type: editCompany.company_type ?? '',
        max_slot: editCompany.max_slot?.toString() ?? '',
      })
    } else {
      setForm({ company_name: '', address: '', lat: '', lng: '', company_type: '', max_slot: '' })
    }
    setErrors({})
    setTouched({})
  }, [editCompany])

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
    setTouched({ company_name: true, address: true, company_type: true, max_slot: true, lat: true, lng: true })
    const allErrors = validateAll(form, rules)
    setErrors(allErrors)
    if (hasErrors(allErrors)) return

    const payload: Record<string, unknown> = {
      company_name: form.company_name,
      address: form.address,
      location: {
        lat: parseFloat(form.lat) || 0,
        lng: parseFloat(form.lng) || 0,
      },
      company_type: form.company_type,
      max_slot: parseInt(form.max_slot) || 1,
    }
    if (editCompany) payload.uuid = editCompany.uuid
    onSave(payload)
  }

  const footer = (
    <>
      <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
      <Button variant="primary" type="submit" form="company-form" isLoading={saving}>
        {editCompany ? 'Update Company' : 'Add Company'}
      </Button>
    </>
  )

  return (
    <Modal title={editCompany ? 'Edit Company' : 'Add Company'} onClose={onClose} footer={footer}>
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
      <form id="company-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput
          label="Company Name"
          value={form.company_name}
          onChange={e => set('company_name', e.target.value)}
          onBlur={() => handleBlur('company_name')}
          placeholder="TLS Manufacturing"
          error={errors.company_name}
          touched={touched.company_name}
          required
        />

        <FormTextarea
          label="Address"
          value={form.address}
          onChange={e => set('address', e.target.value)}
          onBlur={() => handleBlur('address')}
          placeholder="Enter address"
          error={errors.address}
          touched={touched.address}
          required
        />

        <div className="grid grid-cols-2 gap-2.5">
          <FormInput
            label="Latitude"
            type="number"
            step="any"
            value={form.lat}
            onChange={e => set('lat', e.target.value)}
            onBlur={() => handleBlur('lat')}
            placeholder="12.9675"
            error={errors.lat}
            touched={touched.lat}
          />
          <FormInput
            label="Longitude"
            type="number"
            step="any"
            value={form.lng}
            onChange={e => set('lng', e.target.value)}
            onBlur={() => handleBlur('lng')}
            placeholder="80.1491"
            error={errors.lng}
            touched={touched.lng}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <FormSelect
            label="Company Type"
            options={COMPANY_TYPE_OPTIONS}
            value={form.company_type}
            onChange={e => { set('company_type', e.target.value); handleBlur('company_type') }}
            onBlur={() => handleBlur('company_type')}
            placeholder="Select type"
            error={errors.company_type}
            touched={touched.company_type}
            required
          />
          <FormInput
            label="Max Slot"
            type="number"
            min={1}
            value={form.max_slot}
            onChange={e => set('max_slot', e.target.value)}
            onBlur={() => handleBlur('max_slot')}
            placeholder="3"
            error={errors.max_slot}
            touched={touched.max_slot}
            required
          />
        </div>
      </form>
    </Modal>
  )
}
