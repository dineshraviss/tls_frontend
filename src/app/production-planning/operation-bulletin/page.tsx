'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { Trash2, GripVertical, Download, Upload, X, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { apiCall } from '@/services/apiClient'
import type { ToastData } from '@/components/ui/Toast'

// ── Constants ──────────────────────────────────────────────────────────────────
const SHIFT_HOURS = 8
const WORKING_MINS = SHIFT_HOURS * 60 // 480

// ── Types ──────────────────────────────────────────────────────────────────────
interface LeftOp {
  id: number
  uuid: string
  operation_name: string
  code: string
  sam: string | number
  machine_type_id: number | null
  machineType?: { id: number; type_name: string }
  machine?: { id: number; machine_no: string }
}

interface OBRow {
  key: string
  operationId: number
  operationUuid: string
  operationName: string
  machineTypeId: number | null
  machineTypeName: string
  machine_id: number | null
  sam: number
  seq: number
  manning: number // per-row manual entry (Excel H column)
}

// ── Calculations ───────────────────────────────────────────────────────────────
function calcRow(row: OBRow, allocManning: number, totalSam: number, line100TgtHr: number) {
  const row100Hr = row.sam > 0 ? 60 / row.sam : 0
  const reqManning = row100Hr > 0 ? line100TgtHr / row100Hr : 0
  const allocManni100Hr = row.manning * row100Hr
  return { row100Hr, reqManning, allocManni100Hr }
}

function r2(n: number) { return Math.round(n * 100) / 100 }
function fmt(n: number, dec = 0) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-3 border-r border-table-line last:border-r-0">
      <span className="text-md font-bold text-t-primary leading-tight">{value}</span>
      <span className="text-2xs text-t-lighter mt-0.5 text-center whitespace-nowrap">{label}</span>
    </div>
  )
}

// ── Mini Pill ──────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-bold text-t-primary">{value}</span>
      <span className="text-2xs text-t-lighter whitespace-nowrap">{label}</span>
    </div>
  )
}

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({
  rows,
  allocManning,
  onAllocChange,
  onClose,
  onConfirm,
  saving,
}: {
  rows: (OBRow & { row100Hr: number; reqManning: number; allocManni100Hr: number })[]
  allocManning: number
  onAllocChange: (v: number) => void
  onClose: () => void
  onConfirm: () => void
  saving: boolean
}) {
  const totalSam = rows.reduce((s, r) => s + r.sam, 0)
  const allocTotal = rows.reduce((s, r) => s + r.manning, 0)
  const line100TgtHr = totalSam > 0 ? allocManning * 60 / totalSam : 0
  const line100TgtDay = totalSam > 0 ? allocManning * WORKING_MINS / totalSam : 0
  const alloc100TgtHr = totalSam > 0 ? allocTotal * 60 / totalSam : 0
  const alloc100TgtDay = totalSam > 0 ? allocTotal * WORKING_MINS / totalSam : 0

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-modal rounded-card shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-table-line shrink-0">
          <h2 className="text-base font-bold text-t-primary">OBS Preview — Check All Before Saving</h2>
          <button onClick={onClose} className="p-1 text-t-lighter hover:text-t-body transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Stats header */}
        <div className="px-6 py-4 border-b border-table-line shrink-0">
          <p className="text-xs font-medium text-t-body mb-3">Allocated manning</p>
          <div className="flex items-start gap-8">
            <input
              type="number"
              value={allocManning}
              onChange={e => onAllocChange(Number(e.target.value))}
              className="w-20 h-9 px-2.5 text-sm2 text-t-secondary bg-input border border-input-line rounded-input outline-none focus:border-accent"
              min={0}
            />
            <div className="flex gap-8">
              <StatPill value={fmt(r2(alloc100TgtHr))} label="Alloc Manning 60%/Hr" />
              <StatPill value={fmt(r2(alloc100TgtHr * 0.6))} label="Alloc Manning 60%/Hr" />
              <StatPill value={fmt(r2(alloc100TgtDay))} label="Allocated Manning 100% Target / Day" />
              <StatPill value={fmt(r2(alloc100TgtHr))} label="Allocated Manning 100% Target / HR" />
              <StatPill value={fmt(r2(alloc100TgtDay * 0.6))} label="Allocated Manning 60% Target / Day" />
              <StatPill value={fmt(r2(line100TgtDay))} label="Allocated Manning 60% Target / HR" />
            </div>
          </div>
        </div>

        {/* Preview table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-table-head sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2.5 text-left text-t-lighter font-medium w-6"></th>
                <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Seq</th>
                <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Machine Type</th>
                <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Operation</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">SAM</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium text-accent">100%/Hr</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Req Manni</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Manning</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Alloc</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Alloc Manni 100% HR</th>
                <th className="px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.key} className={`border-t border-table-line ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}>
                  <td className="px-2 py-2 text-t-lighter"><GripVertical size={13} /></td>
                  <td className="px-3 py-2 font-mono text-t-secondary">{row.seq}</td>
                  <td className="px-3 py-2 text-t-body">{row.machineTypeName}</td>
                  <td className="px-3 py-2 font-semibold text-accent">{row.operationName}</td>
                  <td className="px-3 py-2 text-right font-mono text-t-secondary">{r2(row.sam).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-accent">{fmt(r2(row.row100Hr))}</td>
                  <td className="px-3 py-2 text-right text-t-body">{r2(row.reqManning).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{row.manning.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{allocManning}</td>
                  <td className="px-3 py-2 text-right font-mono text-t-secondary">{fmt(r2(row.allocManni100Hr))}</td>
                  <td className="px-2 py-2 text-t-lighter"><Trash2 size={12} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="py-12 text-center text-xs text-t-lighter">No operations added</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-table-line shrink-0">
          <div className="flex items-center gap-5">
            <span className="text-xs font-semibold text-t-body"><span className="text-accent">{rows.length}</span> Ops</span>
            <span className="text-xs font-semibold text-t-body"><span className="text-accent">{r2(totalSam).toFixed(2)}</span> SAM</span>
            <span className="text-xs font-semibold text-t-body"><span className="text-accent">{r2(allocTotal)}</span> Manning</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Back</Button>
            <Button variant="primary" onClick={onConfirm} isLoading={saving}>Confirm & Save the Style</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Manning Stepper ────────────────────────────────────────────────────────────
function Stepper({ value, onChange, step = 0.25, min = 0 }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number
}) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-xs font-mono text-t-secondary w-10 text-center">{value.toFixed(2)}</span>
      <div className="flex flex-col gap-px">
        <button
          type="button"
          onClick={() => onChange(Math.round((value + step) * 100) / 100)}
          className="w-4 h-3 flex items-center justify-center text-t-lighter hover:text-accent transition-colors"
        >
          <ChevronUp size={10} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
          className="w-4 h-3 flex items-center justify-center text-t-lighter hover:text-accent transition-colors"
        >
          <ChevronDown size={10} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OperationBulletinPage() {
  const [obRows, setObRows] = useState<OBRow[]>([])
  const [allocManning, setAllocManning] = useState(0)
  const [leftOps, setLeftOps] = useState<LeftOp[]>([])
  const [leftSearch, setLeftSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [leftLoading, setLeftLoading] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)

  // Drag refs — no re-render needed
  const dragOpRef = useRef<LeftOp | null>(null)
  const dragRowIdx = useRef<number | null>(null)
  const dragOverRowIdx = useRef<number | null>(null)

  // ── Derived ──────────────────────────────────────────────────────────────────
  const totalSam = obRows.reduce((s, r) => s + r.sam, 0)
  const allocTotal = obRows.reduce((s, r) => s + r.manning, 0)
  const line100TgtHr = totalSam > 0 ? allocManning * 60 / totalSam : 0
  const line60TgtHr = line100TgtHr * 0.6
  const line100TgtDay = totalSam > 0 ? allocManning * WORKING_MINS / totalSam : 0
  const line60TgtDay = line100TgtDay * 0.6

  const computedRows = obRows.map(r => ({ ...r, ...calcRow(r, allocManning, totalSam, line100TgtHr) }))

  // ── Fetch left operations ─────────────────────────────────────────────────────
  const fetchOps = useCallback(async () => {
    setLeftLoading(true)
    try {
      const res = await apiCall<{ data?: { operations?: LeftOp[] } | LeftOp[] }>(
        '/operation/operationList',
        { method: 'GET', encrypt: false, payload: { page: '1', per_page: '500', search: '' } }
      )
      const raw = res.data
      if (Array.isArray(raw)) setLeftOps(raw)
      else setLeftOps((raw as { operations?: LeftOp[] })?.operations ?? [])
    } catch { setLeftOps([]) }
    finally { setLeftLoading(false) }
  }, [])

  useEffect(() => { fetchOps() }, [fetchOps])

  // ── Add rows ──────────────────────────────────────────────────────────────────
  const addOps = useCallback((ops: LeftOp[]) => {
    const maxSeq = obRows.reduce((m, r) => Math.max(m, r.seq), 0)
    const newRows: OBRow[] = ops.map((op, i) => ({
      key: `${op.id}-${Date.now()}-${i}`,
      operationId: op.id,
      operationUuid: op.uuid,
      operationName: op.operation_name,
      machineTypeId: op.machineType?.id ?? op.machine_type_id ?? null,
      machineTypeName: op.machineType?.type_name ?? '—',
      machine_id: op.machine?.id ?? null,
      sam: Math.max(0.01, parseFloat(String(op.sam)) || 0.35),
      seq: maxSeq + (i + 1) * 10,
      manning: 1,
    }))
    setObRows(prev => [...prev, ...newRows])
    setSelectedIds(new Set())
  }, [obRows])

  // ── Left panel drag ───────────────────────────────────────────────────────────
  const handleLeftDragStart = (op: LeftOp) => { dragOpRef.current = op }

  // ── Right panel drop (from left) ──────────────────────────────────────────────
  const handleRightDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (dragOpRef.current) { addOps([dragOpRef.current]); dragOpRef.current = null }
  }

  // ── Row reorder drag ──────────────────────────────────────────────────────────
  const handleRowDragStart = (e: React.DragEvent, idx: number) => {
    dragRowIdx.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleRowDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    dragOverRowIdx.current = idx
  }
  const handleRowDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const from = dragRowIdx.current
    const to = dragOverRowIdx.current
    if (from === null || to === null || from === to) return
    setObRows(prev => {
      const arr = [...prev]
      const [removed] = arr.splice(from, 1)
      arr.splice(to, 0, removed)
      return arr
    })
    dragRowIdx.current = null
    dragOverRowIdx.current = null
  }

  // ── Row mutations ─────────────────────────────────────────────────────────────
  const updateRow = (idx: number, patch: Partial<OBRow>) => {
    setObRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }
  const deleteRow = (idx: number) => {
    setObRows(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleConfirmSave = async () => {
    setSaving(true)
    try {
      const payload = {
        operation_bulletin_data: {
          shift_hours: SHIFT_HOURS,
          working_mins: WORKING_MINS,
          req_manning: r2(allocManning),
          allocated_manning: r2(allocTotal),
          req_target_hun_hr: r2(line100TgtHr),
          req_target_hun_day: r2(line100TgtDay),
          req_target_six_day: r2(line60TgtDay),
          req_target_six_hr: r2(line60TgtHr),
          all_target_hun_day: r2(totalSam > 0 ? allocTotal * WORKING_MINS / totalSam : 0),
          all_target_hun_hr: r2(totalSam > 0 ? allocTotal * 60 / totalSam : 0),
          all_target_six_day: r2(totalSam > 0 ? allocTotal * WORKING_MINS / totalSam * 0.6 : 0),
          all_target_six_hr: r2(totalSam > 0 ? allocTotal * 60 / totalSam * 0.6 : 0),
          total_sam: r2(totalSam),
          style_id: null,
        },
        bulletin_list: computedRows.map(row => ({
          machine_id: row.machine_id,
          operation_id: row.operationId,
          seq_no: row.seq,
          target_hun_hr: r2(row.row100Hr),
          req_manning: r2(row.reqManning),
          all_manning: row.manning,
          all_manning_target_hun_hr: r2(row.allocManni100Hr),
          order_id: null,
          sam: row.sam,
        })),
      }
      const res = await apiCall<{ success?: boolean; message?: string }>(
        '/operationbullatin/create',
        { payload }
      )
      if (res.success === false) { setToast({ message: res.message || 'Save failed', type: 'error' }); return }
      setToast({ message: res.message || 'Operation Bulletin saved', type: 'success' })
      setShowPreview(false)
      setObRows([])
      setAllocManning(0)
    } catch { setToast({ message: 'Failed to save OB', type: 'error' }) }
    finally { setSaving(false) }
  }

  // ── Filtered ops ──────────────────────────────────────────────────────────────
  const filteredOps = leftOps.filter(op =>
    !leftSearch ||
    op.operation_name.toLowerCase().includes(leftSearch.toLowerCase()) ||
    (op.code ?? '').toLowerCase().includes(leftSearch.toLowerCase())
  )

  const selectedOps = leftOps.filter(o => selectedIds.has(o.id))

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showPreview && (
        <PreviewModal
          rows={computedRows}
          allocManning={allocManning}
          onAllocChange={setAllocManning}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmSave}
          saving={saving}
        />
      )}

      <div className="flex flex-col h-full overflow-hidden">

        {/* Page title row */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-table-line shrink-0">
          <div>
            <h1 className="text-base font-bold text-t-primary">Operation Bulletin (OB)</h1>
            <p className="text-xs text-t-lighter mt-0.5">Assign operations to a style with SAM values, sequence &amp; manning</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
              <input
                placeholder="Search"
                className="h-8 pl-8 pr-3 text-sm2 bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary"
              />
            </div>
            <button className="h-8 px-3 flex items-center gap-1.5 text-sm2 text-t-body bg-card border border-input-line rounded-input hover:bg-table-head transition-colors">
              <Download size={13} /> Export
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 text-sm2 text-t-body bg-card border border-input-line rounded-input hover:bg-table-head transition-colors">
              <Upload size={13} /> Import
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-7 border-b border-table-line shrink-0 bg-card">
          <StatCard value={`${SHIFT_HOURS} hrs`} label="Shift Hrs" />
          <StatCard value={WORKING_MINS} label="Working Min" />
          <StatCard value={obRows.length} label="Operations" />
          <StatCard value={r2(totalSam).toFixed(2)} label="Total SAM" />
          <StatCard value={fmt(r2(line100TgtHr))} label="100% Target/Hr" />
          <StatCard value={fmt(r2(line60TgtHr))} label="60% Target/Hr" />
          <StatCard value={r2(allocTotal)} label="Alloc Manning" />
        </div>

        {/* Two-panel layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left panel ── */}
          <div className="w-72 shrink-0 border-r border-table-line flex flex-col overflow-hidden bg-card">
            <div className="px-3.5 py-2.5 border-b border-table-line shrink-0">
              <p className="text-sm font-semibold text-t-secondary">Operation</p>
            </div>

            {/* Search */}
            <div className="px-3 pt-2.5 pb-2 shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
                <input
                  value={leftSearch}
                  onChange={e => setLeftSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-8 pl-7 pr-3 text-sm2 bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary"
                />
              </div>
            </div>

            {/* Op list */}
            <div className="flex-1 overflow-y-auto">
              {leftLoading ? (
                <div className="flex flex-col gap-1.5 px-3 py-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className="h-12 bg-table-head rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredOps.length === 0 ? (
                <p className="text-xs text-t-lighter text-center py-8">No operations found</p>
              ) : (
                filteredOps.map(op => (
                  <div
                    key={op.id}
                    draggable
                    onDragStart={() => handleLeftDragStart(op)}
                    className="flex items-center gap-2 px-3 py-2.5 border-b border-table-line hover:bg-card-alt cursor-grab active:cursor-grabbing select-none group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(op.id)}
                      onChange={() => toggleSelect(op.id)}
                      onClick={e => e.stopPropagation()}
                      className="accent-accent w-3.5 h-3.5 shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-t-secondary truncate">{op.operation_name}</p>
                      <p className="text-2xs text-t-lighter truncate">
                        {op.machineType?.type_name ?? '—'} &middot; SAM: {parseFloat(String(op.sam)).toFixed(2)}
                      </p>
                    </div>
                    <GripVertical size={13} className="text-t-lighter shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              )}
            </div>

            {/* Add button */}
            <div className="px-3 py-2.5 border-t border-table-line shrink-0">
              <button
                onClick={() => selectedOps.length > 0 ? addOps(selectedOps) : undefined}
                disabled={selectedOps.length === 0}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-input hover:bg-accent/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                → Add to Operation Bulletin (OB)
              </button>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div
            className={`flex-1 flex flex-col overflow-hidden transition-colors ${isDragOver ? 'bg-accent/5' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleRightDrop}
          >
            {/* Right header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-table-line shrink-0">
              <span className="text-sm font-semibold text-t-secondary">Operation Bulletin (OB)</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-t-lighter">Manning: <span className="font-semibold text-t-secondary">{r2(allocTotal)}</span></span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  disabled={obRows.length === 0}
                >
                  Save to Operation Bulletin (OB)
                </Button>
              </div>
            </div>

            {/* Allocated manning + stat pills */}
            <div className="flex items-center gap-6 px-4 py-3 border-b border-table-line bg-card-alt shrink-0 flex-wrap">
              <div className="flex flex-col gap-0.5 shrink-0">
                <label className="text-2xs text-t-lighter">Allocated manning</label>
                <input
                  type="number"
                  value={allocManning}
                  onChange={e => setAllocManning(Math.max(0, Number(e.target.value)))}
                  className="w-20 h-8 px-2.5 text-sm2 text-t-secondary bg-input border border-input-line rounded-input outline-none focus:border-accent"
                  min={0}
                />
              </div>
              <div className="h-px w-px bg-table-line self-stretch shrink-0" />
              <StatPill value={fmt(r2(line100TgtDay))} label="100% Target / Day" />
              <StatPill value={fmt(r2(line60TgtDay))} label="60% Target / Day" />
              <StatPill value={fmt(r2(line100TgtHr))} label="100% Target / Hr" />
              <StatPill value={fmt(r2(line60TgtHr))} label="60% Target / Hr" />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {obRows.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full text-center gap-2 transition-colors ${isDragOver ? 'text-accent' : 'text-t-lighter'}`}>
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                    <span className="text-lg font-bold">+</span>
                  </div>
                  <p className="text-sm font-medium">Drag operations here or select + click Add</p>
                  <p className="text-xs">Operations from the left panel will appear here</p>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-table-head sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-2.5 w-6"></th>
                      <th className="px-3 py-2.5 text-left text-t-lighter font-medium w-16">Seq</th>
                      <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Machine Type</th>
                      <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Operation</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-24">SAM</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium text-accent w-20">100%/Hr</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-20">Req Manni</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-28">Manning</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-16">Alloc</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Alloc Manni 100% HR</th>
                      <th className="px-2 py-2.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedRows.map((row, i) => (
                      <tr
                        key={row.key}
                        draggable
                        onDragStart={e => handleRowDragStart(e, i)}
                        onDragOver={e => handleRowDragOver(e, i)}
                        onDrop={handleRowDrop}
                        className={`border-t border-table-line ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'} hover:bg-accent/5 transition-colors`}
                      >
                        {/* Drag handle */}
                        <td className="px-2 py-2 text-t-lighter cursor-grab active:cursor-grabbing">
                          <GripVertical size={13} />
                        </td>

                        {/* Seq */}
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={row.seq}
                            onChange={e => updateRow(i, { seq: Number(e.target.value) })}
                            className="w-12 h-6 px-1.5 text-xs font-mono text-t-secondary bg-input border border-input-line rounded text-center outline-none focus:border-accent"
                          />
                        </td>

                        {/* Machine Type */}
                        <td className="px-3 py-2 text-t-body">{row.machineTypeName}</td>

                        {/* Operation */}
                        <td className="px-3 py-2 font-semibold text-accent max-w-[180px] truncate">{row.operationName}</td>

                        {/* SAM (editable with stepper) */}
                        <td className="px-3 py-1.5">
                          <div className="flex items-center justify-end">
                            <Stepper
                              value={row.sam}
                              onChange={v => updateRow(i, { sam: Math.max(0.01, v) })}
                              step={0.01}
                              min={0.01}
                            />
                          </div>
                        </td>

                        {/* 100%/Hr (auto) */}
                        <td className="px-3 py-2 text-right font-semibold text-accent">
                          {fmt(r2(row.row100Hr))}
                        </td>

                        {/* Req Manning (auto) */}
                        <td className="px-3 py-2 text-right text-t-body">
                          {r2(row.reqManning).toFixed(2)}
                        </td>

                        {/* Manning (manual, stepper) */}
                        <td className="px-3 py-1.5">
                          <div className="flex items-center justify-end">
                            <Stepper
                              value={row.manning}
                              onChange={v => updateRow(i, { manning: v })}
                              step={0.25}
                              min={0}
                            />
                          </div>
                        </td>

                        {/* Alloc (= top input value) */}
                        <td className="px-3 py-2 text-right text-t-body">{allocManning}</td>

                        {/* Alloc Manni 100%HR (auto) */}
                        <td className="px-3 py-2 text-right font-mono text-t-secondary">
                          {fmt(r2(row.allocManni100Hr))}
                        </td>

                        {/* Delete */}
                        <td className="px-2 py-2">
                          <button
                            onClick={() => deleteRow(i)}
                            className="p-1 text-t-lighter hover:text-danger transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
