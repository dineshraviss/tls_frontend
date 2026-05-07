'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import { apiCall } from '@/services/apiClient'
import type { Order, StyleOption, OrderSizeRow, OrderFormField, FormErrors, FormTouched } from './types'
import { orderRules } from './types'

interface OrderFormProps {
  order: Order | null
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => Promise<{ success?: boolean; message?: string }>
}

export default function OrderForm({ order, onClose, onSave }: OrderFormProps) {
  const isEdit = !!order

  const [form, setForm] = useState({
    order_no: order?.order_no?.toString() ?? '',
    colour: order?.colour ?? '',
    style_id: order?.style_id?.toString() ?? '',
  })
  const [sizes, setSizes] = useState<OrderSizeRow[]>(
    order?.orderSizes?.length
      ? order.orderSizes.map(s => ({ size: s.size, ord_qty: String(s.ord_qty), prod_per: String(s.prod_per) }))
      : [{ size: '', ord_qty: '', prod_per: '' }]
  )
  const [styles, setStyles] = useState<StyleOption[]>([])
  const [colours, setColours] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    apiCall<{ data?: { styles?: StyleOption[]; records?: StyleOption[] } }>(
      '/styles/list',
      { method: 'GET', encrypt: false, payload: { page: 1, per_page: 500, status: 'all', search: '' } }
    )
      .then(res => {
        const d = res.data as unknown as { styles?: StyleOption[]; records?: StyleOption[] } | undefined
        setStyles(d?.styles ?? d?.records ?? [])
      })
      .catch(() => {})

    apiCall<{ data?: { colors?: string[] } }>(
      '/order/getcolors',
      { method: 'GET', encrypt: false }
    )
      .then(res => setColours(res.data?.colors ?? []))
      .catch(() => {})
  }, [])

  const setField = (key: 'order_no' | 'colour' | 'style_id', val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if ((key === 'order_no' || key === 'colour') && touched[key as OrderFormField]) {
      setErrors(e => ({ ...e, [key]: validateField(val, orderRules[key as OrderFormField]) }))
    }
  }

  const handleBlur = (key: OrderFormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    setErrors(e => ({ ...e, [key]: validateField(form[key], orderRules[key]) }))
  }

  const addSize = () => setSizes(s => [...s, { size: '', ord_qty: '', prod_per: '' }])
  const removeSize = (i: number) => setSizes(s => s.filter((_, idx) => idx !== i))
  const setSize = (i: number, field: keyof OrderSizeRow, val: string) =>
    setSizes(s => s.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ order_no: true, colour: true })
    const allErrors = validateAll({ order_no: form.order_no, colour: form.colour }, orderRules)
    setErrors(allErrors as FormErrors)
    if (hasErrors(allErrors)) return

    const sizesInvalid = sizes.some(s => !s.size.trim() || !s.ord_qty.trim())
    if (sizesInvalid) { setFormError('All size rows require Size and Order Qty'); return }

    setSaving(true)
    setFormError('')
    try {
      const payload: Record<string, unknown> = {
        order_no: form.order_no,
        colour: form.colour,
        style_id: form.style_id || '',
        order_size: sizes.map(s => ({
          size: s.size,
          ord_qty: s.ord_qty,
          prod_per: s.prod_per || '0',
        })),
      }
      if (isEdit) payload.uuid = order.uuid
      const res = await onSave(payload)
      if (res.success === false) { setFormError(res.message || 'Save failed'); return }
      onClose()
    } catch {
      setFormError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Order' : 'Add Order'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="order-form" isLoading={saving}>
            {isEdit ? 'Update Order' : 'Add Order'}
          </Button>
        </>
      }
    >
      {formError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-input text-xs text-red-700">
          {formError}
        </div>
      )}
      <form id="order-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Order No."
            value={form.order_no}
            onChange={e => setField('order_no', e.target.value)}
            onBlur={() => handleBlur('order_no')}
            placeholder="e.g. 17284"
            error={errors.order_no}
            touched={touched.order_no}
            required
          />
          <FormSelect
            label="Colour"
            value={form.colour}
            onChange={e => {
              setField('colour', e.target.value)
              if (touched.colour)
                setErrors(er => ({ ...er, colour: e.target.value ? '' : 'Colour is required' }))
            }}
            onBlur={() => handleBlur('colour')}
            options={colours.map(c => ({ value: c, label: c }))}
            placeholder="Select colour"
            error={errors.colour}
            touched={touched.colour}
            required
          />
        </div>

        <FormSelect
          label="Style"
          value={form.style_id}
          onChange={e => setField('style_id', e.target.value)}
          options={styles.map(s => ({ value: s.id, label: `${s.buyer} | ${s.style_no} | ${s.style_name}` }))}
          placeholder="Select style (optional)"
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-t-body">Order Sizes</label>
          {sizes.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-card border border-table-line bg-card-alt">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent">Size {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeSize(i)}
                  disabled={sizes.length === 1}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-table-line text-t-lighter hover:text-red-500 hover:border-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-t-lighter disabled:hover:border-table-line"
                >
                  <Minus size={11} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormInput
                  label="Size"
                  value={row.size}
                  onChange={e => setSize(i, 'size', e.target.value)}
                  placeholder="e.g. XL"
                  required
                />
                <FormInput
                  label="Order Qty"
                  type="number"
                  value={row.ord_qty}
                  onChange={e => setSize(i, 'ord_qty', e.target.value)}
                  placeholder="1000"
                  required
                />
                <FormInput
                  label="Prod %"
                  type="number"
                  value={row.prod_per}
                  onChange={e => setSize(i, 'prod_per', e.target.value)}
                  placeholder="15.5"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSize}
            className="flex items-center gap-1.5 text-xs text-accent hover:underline w-fit"
          >
            <Plus size={13} /> Add More Size
          </button>
        </div>
      </form>
    </Modal>
  )
}
