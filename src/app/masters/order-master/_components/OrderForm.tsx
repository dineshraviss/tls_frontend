'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import { validateField, validateAll, hasErrors } from '@/lib/validation'
import { apiCall } from '@/services/apiClient'
import type { Order, StyleOption, FormErrors, FormTouched } from './types'
import { orderRules } from './types'

interface SizeRow {
  size: string
  ord_qty: string
}

interface OrderFormProps {
  order: Order | null
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => Promise<{ success?: boolean; message?: string }>
}

function calcProdQty(ordQty: string, prodPer: string): number {
  const qty = parseFloat(ordQty) || 0
  const per = parseFloat(prodPer) || 0
  return parseFloat((qty + (qty * per / 100)).toFixed(2))
}

export default function OrderForm({ order, onClose, onSave }: OrderFormProps) {
  const isEdit = !!order

  const [form, setForm] = useState({
    order_no: order?.order_no?.toString() ?? '',
    colour: order?.colour ?? '',
    order_qty: order?.order_qty?.toString() ?? '',
    prod_per: order?.orderSizes?.[0]?.prod_per?.toString() ?? '',
    link_to_style: !!order?.style_id,
    style_id: order?.style_id?.toString() ?? '',
  })

  const [sizeRows, setSizeRows] = useState<SizeRow[]>(
    order?.orderSizes?.length
      ? order.orderSizes.map(s => ({ size: s.size, ord_qty: String(s.ord_qty) }))
      : [{ size: '', ord_qty: '' }]
  )

  const [colours, setColours] = useState<string[]>([])
  const [styles, setStyles] = useState<StyleOption[]>([])
  const [addingColour, setAddingColour] = useState(false)
  const [newColour, setNewColour] = useState('')
  const newColourRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    apiCall<{ data?: { colors?: string[] } }>('/order/getcolors', { method: 'GET', encrypt: false })
      .then(res => setColours(res.data?.colors ?? []))
      .catch(() => {})

    apiCall<{ data?: { styles?: StyleOption[]; records?: StyleOption[] } }>(
      '/styles/list',
      { method: 'GET', encrypt: false, payload: { page: 1, per_page: 500, status: 'all', search: '' } }
    )
      .then(res => {
        const d = res.data as unknown as { styles?: StyleOption[]; records?: StyleOption[] } | undefined
        setStyles(d?.styles ?? d?.records ?? [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (addingColour) newColourRef.current?.focus()
  }, [addingColour])

  // ── Field helpers ───────────────────────────────────────────────────────────────
  const setField = (key: keyof typeof form, val: string | boolean) => {
    setForm(f => ({ ...f, [key]: val }))
    if ((key === 'order_no' || key === 'colour') && touched[key as keyof FormTouched]) {
      setErrors(e => ({ ...e, [key]: validateField(String(val), orderRules[key as keyof typeof orderRules]) }))
    }
  }

  const handleBlur = (key: keyof FormErrors) => {
    setTouched(t => ({ ...t, [key]: true }))
    if (key in orderRules)
      setErrors(e => ({ ...e, [key]: validateField(form[key as keyof typeof form] as string, orderRules[key as keyof typeof orderRules]) }))
  }

  // When top-level order_qty changes → push to all rows
  const handleOrderQtyChange = (val: string) => {
    setForm(f => ({ ...f, order_qty: val }))
    setSizeRows(rows => rows.map(r => ({ ...r, ord_qty: val })))
  }

  // ── Colour add-new ──────────────────────────────────────────────────────────────
  const confirmNewColour = () => {
    const trimmed = newColour.trim()
    if (!trimmed) return
    setColours(prev => prev.includes(trimmed) ? prev : [...prev, trimmed])
    setForm(f => ({ ...f, colour: trimmed }))
    setNewColour('')
    setAddingColour(false)
  }

  // ── Size rows ───────────────────────────────────────────────────────────────────
  const addRow = () =>
    setSizeRows(prev => [...prev, { size: '', ord_qty: form.order_qty }])

  const removeRow = (i: number) =>
    setSizeRows(prev => prev.filter((_, idx) => idx !== i))

  const setRow = (i: number, field: keyof SizeRow, val: string) =>
    setSizeRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))

  // ── Totals ──────────────────────────────────────────────────────────────────────
  const totalOrderQty = sizeRows.reduce((s, r) => s + (parseInt(r.ord_qty) || 0), 0)
  const totalProdQty  = sizeRows.reduce((s, r) => s + calcProdQty(r.ord_qty, form.prod_per), 0)

  // ── Submit ──────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ order_no: true, colour: true })
    const allErrors = validateAll({ order_no: form.order_no, colour: form.colour }, orderRules)
    setErrors(allErrors as FormErrors)
    if (hasErrors(allErrors)) return

    const rowsInvalid = sizeRows.some(r => !r.size.trim() || !r.ord_qty.trim())
    if (rowsInvalid) { setFormError('All size rows require Size and Order Qty'); return }

    setSaving(true)
    setFormError('')
    try {
      const payload: Record<string, unknown> = {
        order_no: form.order_no,
        colour: form.colour,
        style_id: form.link_to_style ? (form.style_id || '') : '',
        order_size: sizeRows.map(r => ({
          size: r.size,
          ord_qty: r.ord_qty,
          prod_per: form.prod_per || '0',
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

  const INPUT_CLS =
    'w-full h-input-h px-2.5 text-sm2 font-inherit text-t-secondary bg-input border border-input-line rounded-input outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-focus-ring/15 placeholder:text-t-lighter'

  return (
    <Modal
      title={isEdit ? 'Edit Order' : 'Add Order'}
      onClose={onClose}
      size="lg"
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

      <form id="order-form" onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Row 1: Order No. + Colour */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Order No."
            value={form.order_no}
            onChange={e => setField('order_no', e.target.value)}
            onBlur={() => handleBlur('order_no')}
            placeholder="Eg.1234"
            error={errors.order_no}
            touched={touched.order_no}
            required
          />

          {/* Colour with add-new */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-t-body">
              Colour <span className="text-red-400 ml-0.5">*</span>
            </label>
            {addingColour ? (
              <div className="flex gap-1">
                <input
                  ref={newColourRef}
                  value={newColour}
                  onChange={e => setNewColour(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewColour() } if (e.key === 'Escape') { setAddingColour(false); setNewColour('') } }}
                  placeholder="Type new colour"
                  className={INPUT_CLS}
                />
                <button
                  type="button"
                  onClick={confirmNewColour}
                  className="h-input-h px-2 bg-accent text-white rounded-input hover:bg-accent-hover transition-colors shrink-0"
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingColour(false); setNewColour('') }}
                  className="h-input-h px-2 border border-input-line rounded-input text-t-lighter hover:text-t-body transition-colors shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <select
                    value={form.colour}
                    onChange={e => {
                      setField('colour', e.target.value)
                      if (touched.colour) setErrors(er => ({ ...er, colour: e.target.value ? '' : 'Colour is required' }))
                    }}
                    onBlur={() => handleBlur('colour')}
                    className={`${INPUT_CLS} appearance-none pr-7 ${errors.colour && touched.colour ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select colour...</option>
                    {colours.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-t-lighter text-xs">▾</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAddingColour(true)}
                  title="Add new colour"
                  className="h-input-h px-2.5 border border-input-line rounded-input text-t-lighter hover:text-accent hover:border-accent transition-colors shrink-0 text-sm font-bold"
                >
                  <Plus size={13} />
                </button>
              </div>
            )}
            {errors.colour && touched.colour && (
              <span className="text-xs text-red-500 mt-0.5">{errors.colour}</span>
            )}
          </div>
        </div>

        {/* Row 2: Order Qty + Prod Qty % */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-t-body">Order Qty</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.order_qty}
              onChange={e => handleOrderQtyChange(e.target.value)}
              placeholder="0"
              className={INPUT_CLS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-t-body">Prod. Qty %</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.prod_per}
                onChange={e => setField('prod_per', e.target.value)}
                placeholder="0"
                className={`${INPUT_CLS} pr-8`}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-t-lighter font-medium pointer-events-none">%</span>
            </div>
          </div>
        </div>

        {/* Size wise order qty table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-t-body">Size wise order qty</span>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 text-xs font-semibold text-accent border border-accent/40 rounded px-2.5 py-1 hover:bg-accent/5 transition-colors"
            >
              <Plus size={12} /> Add New
            </button>
          </div>

          <div className="rounded-card border border-table-line overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-table-head">
                  <th className="px-3 py-2 text-left font-semibold text-t-lighter">Size</th>
                  <th className="px-3 py-2 text-right font-semibold text-t-lighter">O. Qty</th>
                  <th className="px-3 py-2 text-right font-semibold text-t-lighter">Prod qty</th>
                  <th className="px-2 py-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((row, i) => {
                  const prodQty = calcProdQty(row.ord_qty, form.prod_per)
                  return (
                    <tr key={i} className={`border-t border-table-line ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}>
                      {/* Size */}
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={row.size}
                          onChange={e => setRow(i, 'size', e.target.value)}
                          placeholder="e.g. XL"
                          className="w-full h-7 px-2 text-xs bg-input border border-input-line rounded outline-none focus:border-accent text-t-secondary"
                        />
                      </td>
                      {/* O. Qty */}
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.ord_qty}
                          onChange={e => setRow(i, 'ord_qty', e.target.value)}
                          placeholder="0"
                          className="w-full h-7 px-2 text-xs text-right bg-input border border-input-line rounded outline-none focus:border-accent text-t-secondary"
                        />
                      </td>
                      {/* Prod qty — readonly */}
                      <td className="px-3 py-1.5 text-right">
                        <span className="text-xs font-semibold text-t-primary">
                          {row.ord_qty ? prodQty.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}
                        </span>
                      </td>
                      {/* Delete */}
                      <td className="px-2 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          disabled={sizeRows.length === 1}
                          className="p-1 text-t-lighter hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              {/* Summary */}
              <tfoot>
                <tr className="border-t-2 border-table-line bg-table-head">
                  <td className="px-3 py-2 text-xs font-semibold text-t-body">Total</td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-t-primary">
                    {totalOrderQty.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-t-primary">
                    {parseFloat(totalProdQty.toFixed(2)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
                <tr className="bg-table-head border-t border-table-line">
                  <td className="px-3 py-1.5 text-2xs text-t-lighter">{sizeRows.length} Sizes</td>
                  <td className="px-3 py-1.5 text-right text-2xs text-t-lighter">Order qty</td>
                  <td className="px-3 py-1.5 text-right text-2xs text-t-lighter">Prod qty</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Link to Style toggle */}
        <div className="flex flex-col gap-2 pt-1 border-t border-table-line">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-t-body">Link to Style</span>
            <button
              type="button"
              onClick={() => setField('link_to_style', !form.link_to_style)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.link_to_style ? 'bg-accent' : 'bg-input-line'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.link_to_style ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {form.link_to_style && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-t-body">Select an existing style</label>
              <div className="relative">
                <select
                  value={form.style_id}
                  onChange={e => setField('style_id', e.target.value)}
                  className={`${INPUT_CLS} appearance-none pr-7`}
                >
                  <option value="">Select style...</option>
                  {styles.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.buyer} | {s.style_no} | {s.style_name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-t-lighter text-xs">▾</span>
              </div>
            </div>
          )}
        </div>

      </form>
    </Modal>
  )
}
