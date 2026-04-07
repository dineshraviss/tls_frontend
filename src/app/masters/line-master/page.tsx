'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Pencil, Trash2, Plus, Minus } from 'lucide-react'
import { apiCall } from '@/services/apiClient'
import Toast, { type ToastData } from '@/components/ui/Toast'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Toolbar from '@/components/ui/Toolbar'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import Badge from '@/components/ui/Badge'
import { validateField, validateAll, hasErrors, type ValidationRules } from '@/lib/validation'

// ── Types ────────────────────────────────────────────
interface Slot {
  id?: number
  slot_name: string
  start: string
  end: string
}

interface Line {
  id: number
  uuid: string
  zone_id: number
  branch_id: number
  line_name: string
  status: number
  slots: Slot[]
  zone?: {
    id: number
    zone_name: string
    zone_code: string
    company_id: number
    company?: { id: number; company_name: string; company_code: string }
    branch?: { id: number; branch_name: string; branch_code: string }
  }
  branch?: { id: number; branch_name: string; branch_code: string }
}

interface CompanyOption { id: number; company_name: string }
interface BranchOption { id: number; company_id: number; branch_name: string }
interface ZoneOption { id: number; company_id: number; branch_id: number; zone_name: string }

interface FormSlot {
  slot_name: string
  start_time: string
  end_time: string
}

interface FormErrors {
  company_id?: string
  branch_id?: string
  zone_id?: string
  line_name?: string
  slots?: string
}

type FormField = 'company_id' | 'branch_id' | 'zone_id' | 'line_name'
type Touched = Partial<Record<FormField, boolean>>

const formRules: ValidationRules<FormField> = {
  company_id: { required: 'Company is required' },
  branch_id: { required: 'Branch is required' },
  zone_id: { required: 'Zone is required' },
  line_name: {
    required: 'Line name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
    maxLength: { value: 50, message: 'Maximum 50 characters' },
  },
}

// ── Add / Edit Modal ─────────────────────────────────
function LineModal({
  line, companies, allBranches, allZones, onClose, onSaved,
}: {
  line: Line | null
  companies: CompanyOption[]
  allBranches: BranchOption[]
  allZones: ZoneOption[]
  onClose: () => void
  onSaved: (msg: string) => void
}) {
  const isEdit = !!line
  const [companyId, setCompanyId] = useState(line?.zone?.company_id?.toString() ?? '')
  const [branchId, setBranchId] = useState(line?.branch_id?.toString() ?? '')
  const [zoneId, setZoneId] = useState(line?.zone_id?.toString() ?? '')
  const [lineName, setLineName] = useState(line?.line_name ?? '')
  const [slots, setSlots] = useState<FormSlot[]>(
    line?.slots?.map(s => ({
      slot_name: s.slot_name,
      start_time: s.start?.slice(0, 5) || '',
      end_time: s.end?.slice(0, 5) || '',
    })) ?? [{ slot_name: '', start_time: '', end_time: '' }]
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})

  const filteredBranches = allBranches.filter(b => b.company_id === parseInt(companyId))
  const filteredZones = allZones.filter(z =>
    z.company_id === parseInt(companyId) && z.branch_id === parseInt(branchId)
  )

  const handleBlur = (key: FormField) => {
    setTouched(t => ({ ...t, [key]: true }))
    const val = key === 'company_id' ? companyId : key === 'branch_id' ? branchId : key === 'zone_id' ? zoneId : lineName
    setErrors(e => ({ ...e, [key]: validateField(val, formRules[key]) }))
  }

  const handleCompanyChange = (val: string) => {
    setCompanyId(val)
    setBranchId('')
    setZoneId('')
    if (touched.company_id) {
      setErrors(e => ({ ...e, company_id: validateField(val, formRules.company_id) }))
    }
  }

  const handleBranchChange = (val: string) => {
    setBranchId(val)
    setZoneId('')
    if (touched.branch_id) {
      setErrors(e => ({ ...e, branch_id: validateField(val, formRules.branch_id) }))
    }
  }

  const addSlot = () => setSlots(prev => [...prev, { slot_name: '', start_time: '', end_time: '' }])
  const removeSlot = (i: number) => setSlots(prev => prev.filter((_, idx) => idx !== i))
  const updateSlot = (i: number, key: keyof FormSlot, val: string) =>
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched: Touched = { company_id: true, branch_id: true, zone_id: true, line_name: true }
    setTouched(allTouched)
    const formData = { company_id: companyId, branch_id: branchId, zone_id: zoneId, line_name: lineName }
    const allErrors = validateAll(formData, formRules)
    // Also validate slots
    const validSlots = slots.filter(s => s.slot_name && s.start_time && s.end_time)
    if (validSlots.length === 0) allErrors.line_name = (allErrors.line_name ?? '') // keep existing
    const slotsError = validSlots.length === 0 ? 'At least one complete slot is required' : undefined
    setErrors({ ...allErrors, slots: slotsError } as any)
    if (hasErrors(allErrors) || slotsError) return

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        zone_id: zoneId,
        branch_id: branchId,
        line_name: lineName,
        slots: validSlots.map(s => ({ slot_name: s.slot_name, start_time: s.start_time, end_time: s.end_time })),
      }

      if (isEdit) {
        payload.uuid = line.uuid
        const res = await apiCall<{ message?: string }>('/line/update', { payload })
        onSaved(res.message || 'Line updated successfully')
      } else {
        const res = await apiCall<{ message?: string }>('/line/create', { payload })
        onSaved(res.message || 'Line created successfully')
      }
      onClose()
    } catch {
      setErrors({ line_name: 'Failed to save line. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Line' : 'Add Line'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] px-[18px] bg-card border border-input-line
              rounded-[5px] text-[13px] text-t-body cursor-pointer font-inherit"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="line-form"
            disabled={saving}
            className="h-[34px] px-[18px] bg-[#2DB3A0] hover:bg-[#26A090] border-none rounded-[5px]
              text-[13px] text-white font-semibold cursor-pointer font-inherit
              disabled:opacity-70 transition-colors"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Line' : 'Add Line'}
          </button>
        </>
      }
    >
      <form id="line-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormSelect
          label="Company"
          value={companyId}
          onChange={e => { handleCompanyChange(e.target.value); handleBlur('company_id') }}
          onBlur={() => handleBlur('company_id')}
          touched={touched.company_id}
          options={companies.map(c => ({ value: c.id, label: c.company_name }))}
          placeholder="Select company"
          error={errors.company_id}
          required
        />

        <div className="grid grid-cols-2 gap-2.5">
          <FormSelect
            label="Branch"
            value={branchId}
            onChange={e => { handleBranchChange(e.target.value); handleBlur('branch_id') }}
            onBlur={() => handleBlur('branch_id')}
            touched={touched.branch_id}
            options={filteredBranches.map(b => ({ value: b.id, label: b.branch_name }))}
            placeholder={companyId ? 'Select branch' : 'Select company first'}
            disabled={!companyId}
            error={errors.branch_id}
            required
          />
          <FormSelect
            label="Zone"
            value={zoneId}
            onChange={e => {
              setZoneId(e.target.value)
              if (touched.zone_id) {
                setErrors(er => ({ ...er, zone_id: validateField(e.target.value, formRules.zone_id) }))
              }
              handleBlur('zone_id')
            }}
            onBlur={() => handleBlur('zone_id')}
            touched={touched.zone_id}
            options={filteredZones.map(z => ({ value: z.id, label: z.zone_name }))}
            placeholder={branchId ? 'Select zone' : 'Select branch first'}
            disabled={!branchId}
            error={errors.zone_id}
            required
          />
        </div>

        <FormInput
          label="Line Name"
          value={lineName}
          onChange={e => {
            setLineName(e.target.value)
            if (touched.line_name) {
              setErrors(er => ({ ...er, line_name: validateField(e.target.value, formRules.line_name) }))
            }
          }}
          onBlur={() => handleBlur('line_name')}
          touched={touched.line_name}
          placeholder="Enter line name"
          error={errors.line_name}
          required
        />

        {/* Slots */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-t-lighter tracking-wider uppercase">
              Time Slots
            </span>
            <button
              type="button"
              onClick={addSlot}
              className="h-6 px-2 flex items-center gap-1 bg-[#2DB3A0]/10 text-[#2DB3A0]
                border-none rounded text-[11px] font-semibold cursor-pointer font-inherit
                hover:bg-[#2DB3A0]/20 transition-colors"
            >
              <Plus size={12} /> Add Slot
            </button>
          </div>
          {errors.slots && (
            <span className="text-[11px] text-red-500 mb-2 block">{errors.slots}</span>
          )}
          <div className="flex flex-col gap-2">
            {slots.map((slot, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 items-end">
                <FormInput
                  label={i === 0 ? 'Slot Name' : undefined}
                  placeholder="Morning"
                  value={slot.slot_name}
                  onChange={e => updateSlot(i, 'slot_name', e.target.value)}
                />
                <FormInput
                  label={i === 0 ? 'Start Time' : undefined}
                  type="time"
                  value={slot.start_time}
                  onChange={e => updateSlot(i, 'start_time', e.target.value)}
                />
                <FormInput
                  label={i === 0 ? 'End Time' : undefined}
                  type="time"
                  value={slot.end_time}
                  onChange={e => updateSlot(i, 'end_time', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  disabled={slots.length <= 1}
                  className={`h-[34px] w-7 flex items-center justify-center rounded border-none cursor-pointer
                    ${slots.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:bg-red-50 hover:text-red-500'}
                    transition-colors`}
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function LineMasterPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [allBranches, setAllBranches] = useState<BranchOption[]>([])
  const [allZones, setAllZones] = useState<ZoneOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editLine, setEditLine] = useState<Line | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Line | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)

  // Fetch dropdown data
  useEffect(() => {
    apiCall<{ data?: { companies?: CompanyOption[] } }>('/company/companyList', { method: 'GET' })
      .then(res => setCompanies(res.data?.companies ?? []))
      .catch(() => {})

    apiCall<{ data?: { branches?: BranchOption[] } }>('/branch/branchList', { method: 'GET' })
      .then(res => setAllBranches(res.data?.branches ?? []))
      .catch(() => {})

    apiCall<{ data?: { zones?: ZoneOption[] } }>('/zone/zoneList', { method: 'GET' })
      .then(res => setAllZones(res.data?.zones ?? []))
      .catch(() => {})
  }, [])

  const fetchLines = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{
        data?: {
          lines?: Line[]
          pagination?: { total: number; total_pages: number }
        }
      }>('/line/list', {
        method: 'GET',
        payload: { search, page: String(page), line_name: '', zone_id: '', branch_id: '' },
      })

      const data = res.data
      setLines(data?.lines ?? [])
      setTotalCount(data?.pagination?.total ?? 0)
      setTotalPages(data?.pagination?.total_pages ?? 1)
    } catch {
      setLines([])
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchLines()
  }, [fetchLines])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ message?: string }>('/line/delete', { payload: { uuid: deleteTarget.uuid } })
      setToast({ message: res.message || 'Line deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchLines()
    } catch {
      setToast({ message: 'Failed to delete line', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaved = (msg: string) => {
    setToast({ message: msg, type: 'success' })
    fetchLines()
  }

  const columns = [
    {
      key: '#',
      header: '#',
      render: (_: Line, i: number) => (
        <span className="text-t-lighter text-xs">{(page - 1) * 30 + i + 1}</span>
      ),
    },
    {
      key: 'line_name',
      header: 'Line Name',
      render: (row: Line) => (
        <span className="text-[#2DB3A0] font-semibold">{row.line_name}</span>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (row: Line) => (
        <span className="text-t-body">{row.zone?.company?.company_name ?? '—'}</span>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (row: Line) => (
        <span className="text-t-body">{row.branch?.branch_name ?? row.zone?.branch?.branch_name ?? '—'}</span>
      ),
    },
    {
      key: 'zone',
      header: 'Zone',
      render: (row: Line) => (
        <span className="text-t-body">{row.zone?.zone_name ?? '—'}</span>
      ),
    },
    {
      key: 'slots',
      header: 'Slots',
      render: (row: Line) => (
        <div className="flex flex-wrap gap-1">
          {row.slots?.map((s, i) => (
            <Badge key={i} variant="info">
              {s.slot_name}: {s.start?.slice(0, 5)}-{s.end?.slice(0, 5)}
            </Badge>
          )) ?? '—'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: Line) => (
        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => { setEditLine(row); setShowModal(true) }}
            className="bg-transparent border-none cursor-pointer p-1 text-t-lighter
              hover:text-[#2DB3A0] transition-colors flex"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="bg-transparent border-none cursor-pointer p-1 text-[#FC8181]
              hover:text-[#E53E3E] transition-colors flex"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showModal && (
        <LineModal
          line={editLine}
          companies={companies}
          allBranches={allBranches}
          allZones={allZones}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Line"
          message={<>Are you sure you want to delete <strong>{deleteTarget.line_name}</strong>? This action cannot be undone.</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      <Breadcrumb items={[{ label: 'Master' }, { label: 'Line Master', active: true }]} />
      <PageHeader title="Line Master" description="Manage production lines with zone assignments and time slot configurations." />

      <Toolbar
        title="All Lines"
        search={search}
        onSearchChange={val => { setSearch(val); setPage(1) }}
        onAdd={() => { setEditLine(null); setShowModal(true) }}
        addLabel="Add Line"
      />

      <DataTable
        columns={columns}
        data={lines}
        loading={loading}
        emptyMessage="No lines found"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
        countLabel="line"
      />
    </AppLayout>
  )
}
