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
  alloc: number  // per-row editable (Excel H col), default = allocManning input
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function r2(n: number) { return Math.round(n * 100) / 100 }
function fmt(n: number) {
  if (!isFinite(n) || n === 0) return '0'
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// Excel formulas:
// F = 60 / SAM  (100%/Hr)
// G = D23 / F   (Req Manning = line100TgtHr / row100Hr)
// I = H × F     (Alloc Manni 100%HR = alloc × row100Hr)
function calcRow(row: OBRow, line100TgtHr: number) {
  const row100Hr = row.sam > 0 ? 60 / row.sam : 0
  const reqManning = row100Hr > 0 ? line100TgtHr / row100Hr : 0
  const allocManni100Hr = row.alloc * row100Hr
  return { row100Hr, reqManning, allocManni100Hr }
}

// ── Stepper ────────────────────────────────────────────────────────────────────
function Stepper({ value, onChange, step = 0.25, min = 0 }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      <span className="text-xs font-mono text-t-secondary min-w-[32px] text-right">{value.toFixed(2)}</span>
      <div className="flex flex-col">
        <button type="button"
          onClick={() => onChange(r2(value + step))}
          className="h-3 w-4 flex items-center justify-center text-t-lighter hover:text-accent">
          <ChevronUp size={9} strokeWidth={2.5} />
        </button>
        <button type="button"
          onClick={() => onChange(Math.max(min, r2(value - step)))}
          className="h-3 w-4 flex items-center justify-center text-t-lighter hover:text-accent">
          <ChevronDown size={9} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

// ── Stat Card (header row) ─────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-3.5 border-r border-table-line last:border-r-0">
      <span className="text-md font-bold text-t-primary">{value}</span>
      <span className="text-2xs text-t-lighter mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  )
}

// ── Stat Pill (right panel alloc row) ─────────────────────────────────────────
function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
      <span className="text-sm font-bold text-t-primary leading-tight">{value}</span>
      <span className="text-2xs text-t-lighter text-center leading-tight whitespace-nowrap">{label}</span>
    </div>
  )
}

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({
  rows, allocManning, onAllocChange, onClose, onConfirm, saving,
}: {
  rows: (OBRow & { row100Hr: number; reqManning: number; allocManni100Hr: number })[]
  allocManning: number
  onAllocChange: (v: number) => void
  onClose: () => void
  onConfirm: () => void
  saving: boolean
}) {
  const totalSam = rows.reduce((s, r) => s + r.sam, 0)
  const allocTotal = rows.reduce((s, r) => s + r.alloc, 0)
  const alloc100Hr = totalSam > 0 ? allocTotal * 60 / totalSam : 0
  const alloc100Day = totalSam > 0 ? allocTotal * WORKING_MINS / totalSam : 0

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-modal rounded-card shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-table-line shrink-0">
          <h2 className="text-base font-bold text-t-primary">OBS  Preview — Check All Before Saving</h2>
          <button onClick={onClose} className="p-1 text-t-lighter hover:text-t-body transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 border-b border-table-line shrink-0">
          <p className="text-xs font-medium text-t-body mb-3">Allocated manning</p>
          <div className="flex items-start gap-8 flex-wrap">
            <input
              type="number" value={allocManning}
              onChange={e => onAllocChange(Math.max(0, Number(e.target.value)))}
              className="w-20 h-9 px-2.5 text-sm2 text-t-secondary bg-input border border-input-line rounded-input outline-none focus:border-accent"
              min={0}
            />
            <div className="flex gap-8 flex-wrap">
              <StatPill value={fmt(r2(alloc100Day))} label="Alloc Manning 60%/Hr" />
              <StatPill value={fmt(r2(alloc100Hr * 0.6))} label="Alloc Manning 60%/Hr" />
              <StatPill value={fmt(r2(alloc100Day))} label="Allocated Manning 100% Target / Day" />
              <StatPill value={fmt(r2(alloc100Hr))} label="Allocated Manning 100% Target / HR" />
              <StatPill value={fmt(r2(alloc100Day * 0.6))} label="Allocated Manning 60% Target / Day" />
              <StatPill value={fmt(r2(alloc100Hr * 0.6))} label="Allocated Manning 60% Target / HR" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-table-head sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2.5 w-6" />
                <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Seq</th>
                <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Machine Type</th>
                <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Operation</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">SAM</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium text-accent">100%/Hr</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Req Manni</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Manning</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Alloc</th>
                <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Alloc Manni 100 % HR</th>
                <th className="px-2 py-2.5 w-8" />
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
                  <td className="px-3 py-2 text-right text-t-body">{r2(row.reqManning).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{row.alloc.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-t-secondary">{fmt(r2(row.allocManni100Hr))}</td>
                  <td className="px-2 py-2 text-t-lighter"><Trash2 size={12} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="text-center text-xs text-t-lighter py-10">No operations added</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-table-line shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold text-t-body">
              <span className="text-accent">{rows.length}</span> Ops
            </span>
            <span className="text-xs font-semibold text-t-body">
              <span className="text-accent">{r2(totalSam).toFixed(2)}</span> SAM
            </span>
            <span className="text-xs font-semibold text-t-body">
              <span className="text-accent">{r2(allocTotal)}</span> Manning
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Back</Button>
            <Button variant="primary" onClick={onConfirm} isLoading={saving}>
              Confirm &amp; Save the Style
            </Button>
          </div>
        </div>
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

  const dragOpRef = useRef<LeftOp | null>(null)
  const dragRowIdx = useRef<number | null>(null)
  const dragOverRowIdx = useRef<number | null>(null)

  // ── Derived ──────────────────────────────────────────────────────────────────
  const totalSam = obRows.reduce((s, r) => s + r.sam, 0)
  const allocTotal = obRows.reduce((s, r) => s + r.alloc, 0) // sum of per-row alloc (Excel B25)

  // Line 100% target (D23 in Excel) = allocManning × 60 / totalSam
  const line100TgtHr = totalSam > 0 ? allocManning * 60 / totalSam : 0
  const line100TgtDay = totalSam > 0 ? allocManning * WORKING_MINS / totalSam : 0

  // Alloc-based targets (using sum of per-row alloc)
  const alloc100Hr = totalSam > 0 ? allocTotal * 60 / totalSam : 0
  const alloc100Day = totalSam > 0 ? allocTotal * WORKING_MINS / totalSam : 0

  const computedRows = obRows.map(r => ({ ...r, ...calcRow(r, line100TgtHr) }))

  // ── Fetch left ops ────────────────────────────────────────────────────────────
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
      alloc: allocManning || 1,  // default alloc = top input value
    }))
    setObRows(prev => [...prev, ...newRows])
    setSelectedIds(new Set())
  }, [obRows, allocManning])

  // ── Drag: left → right ────────────────────────────────────────────────────────
  const handleLeftDragStart = (op: LeftOp) => { dragOpRef.current = op }
  const handleRightDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (dragOpRef.current) { addOps([dragOpRef.current]); dragOpRef.current = null }
  }

  // ── Drag: row reorder ─────────────────────────────────────────────────────────
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
  const updateRow = (idx: number, patch: Partial<OBRow>) =>
    setObRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r))

  const deleteRow = (idx: number) =>
    setObRows(prev => prev.filter((_, i) => i !== idx))

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
          req_target_six_day: r2(line100TgtDay * 0.6),
          req_target_six_hr: r2(line100TgtHr * 0.6),
          all_target_hun_day: r2(alloc100Day),
          all_target_hun_hr: r2(alloc100Hr),
          all_target_six_day: r2(alloc100Day * 0.6),
          all_target_six_hr: r2(alloc100Hr * 0.6),
          total_sam: r2(totalSam),
          style_id: null,
        },
        bulletin_list: computedRows.map(row => ({
          machine_id: row.machine_id,
          operation_id: row.operationId,
          seq_no: row.seq,
          target_hun_hr: r2(row.row100Hr),
          req_manning: r2(row.reqManning),
          all_manning: row.alloc,
          all_manning_target_hun_hr: r2(row.allocManni100Hr),
          order_id: null,
          sam: row.sam,
        })),
      }
      const res = await apiCall<{ success?: boolean; message?: string }>(
        '/operationbullatin/create', { payload }
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

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedOps = leftOps.filter(o => selectedIds.has(o.id))

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

        {/* ── Title row ── */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-table-line shrink-0 bg-card">
          <div>
            <h1 className="text-base font-bold text-t-primary">Operation Bulletin (OB)</h1>
            <p className="text-xs text-t-lighter mt-0.5">Assign operations to a style with SAM values, sequence &amp; manning</p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
              <input
                placeholder="Search"
                className="h-8 pl-8 pr-3 text-sm2 bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary w-44"
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

        {/* ── Stat cards ── */}
        <div className="flex border-b border-table-line shrink-0 bg-table-head">
          <StatCard value={`${SHIFT_HOURS} hrs`} label="Shift Hrs" />
          <StatCard value={WORKING_MINS} label="Working Min" />
          <StatCard value={obRows.length} label="Operations" />
          <StatCard value={r2(totalSam).toFixed(2)} label="Total SAM" />
          <StatCard value={fmt(r2(line100TgtHr))} label="100% Target/Hr" />
          <StatCard value={fmt(r2(line100TgtHr * 0.6))} label="60% Target/Hr" />
          <StatCard value={r2(allocTotal).toFixed(2)} label="Alloc Manning" />
        </div>

        {/* ── Two-panel ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left panel */}
          <div className="w-[240px] shrink-0 border-r border-table-line flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-table-line shrink-0">
              <p className="text-sm font-semibold text-t-secondary">Operation</p>
            </div>

            <div className="px-3 py-2 shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
                <input
                  value={leftSearch}
                  onChange={e => setLeftSearch(e.target.value)}
                  placeholder="Search.."
                  className="w-full h-7 pl-7 pr-3 text-xs bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {leftLoading ? (
                <div className="flex flex-col gap-1 px-3 py-2">
                  {[1, 2, 3, 4, 5].map(n => <div key={n} className="h-11 bg-table-head rounded animate-pulse" />)}
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
                      <p className="text-xs font-bold text-t-secondary truncate uppercase">{op.operation_name}</p>
                      <p className="text-2xs text-t-lighter truncate mt-0.5">
                        {op.machineType?.type_name ?? '—'} &middot; SAM: {parseFloat(String(op.sam)).toFixed(2)}
                      </p>
                    </div>
                    <GripVertical size={13} className="text-t-lighter shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                ))
              )}
            </div>

            <div className="px-3 py-2.5 border-t border-table-line shrink-0">
              <button
                onClick={() => selectedOps.length > 0 ? addOps(selectedOps) : undefined}
                disabled={selectedOps.length === 0}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-input hover:bg-accent/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                → Add to Operation Bulletin (OB)
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div
            className={`flex-1 flex flex-col overflow-hidden ${isDragOver ? 'bg-accent/5' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleRightDrop}
          >
            {/* Right header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-table-line shrink-0 bg-card">
              <span className="text-sm font-semibold text-t-secondary">Operation Bulletin (OB)</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-t-lighter">
                  Manning: <span className="font-bold text-t-primary">{r2(allocTotal).toFixed(2)}</span>
                </span>
                <Button variant="primary" size="sm" onClick={() => setShowPreview(true)} disabled={obRows.length === 0}>
                  Save to Operation Bulletin (OB)
                </Button>
              </div>
            </div>

            {/* Allocated manning + 4 stat cells — one connected bar (no gap, border-r dividers) */}
            <div className="flex border-b border-table-line shrink-0 bg-table-head">
              {/* First cell: Allocated manning input */}
              <div className="flex flex-col items-center justify-center px-5 py-3 border-r border-table-line shrink-0">
                <p className="text-2xs text-t-lighter mb-1.5 whitespace-nowrap">Allocated manning</p>
                <input
                  type="number"
                  value={allocManning}
                  onChange={e => setAllocManning(Math.max(0, Number(e.target.value)))}
                  className="w-16 h-7 px-2 text-sm text-center font-bold text-t-primary bg-input border border-input-line rounded-input outline-none focus:border-accent"
                  min={0}
                />
              </div>
              {/* 4 stat cells — equal width */}
              <StatCard value={fmt(r2(line100TgtDay))}       label="100% Target / Day" />
              <StatCard value={fmt(r2(line100TgtDay * 0.6))} label="60% Target / Day" />
              <StatCard value={fmt(r2(alloc100Hr))}          label="Alloc Manning 100%/Hr" />
              <StatCard value={fmt(r2(alloc100Hr * 0.6))}    label="Alloc Manning 60%/Hr" />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {obRows.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full gap-3 ${isDragOver ? 'text-accent' : 'text-t-lighter'}`}>
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                    <span className="text-xl font-bold leading-none">+</span>
                  </div>
                  <p className="text-sm font-medium">Drag operations here or select &amp; click Add</p>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-table-head sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-2.5 w-6" />
                      <th className="px-3 py-2.5 text-center text-t-lighter font-medium w-16">Seq</th>
                      <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Machine Type</th>
                      <th className="px-3 py-2.5 text-left text-t-lighter font-medium">Operation</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-20">SAM</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium text-accent w-20">100%/Hr</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-20">Req<br/>Manni</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-20">Manning</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium w-24">Alloc</th>
                      <th className="px-3 py-2.5 text-right text-t-lighter font-medium">Alloc<br/>Manni 100 % HR</th>
                      <th className="px-2 py-2.5 w-8" />
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
                        className={`border-t border-table-line hover:bg-accent/5 transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}
                      >
                        {/* Drag handle */}
                        <td className="px-2 py-2 text-t-lighter cursor-grab">
                          <GripVertical size={13} />
                        </td>

                        {/* Seq */}
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            value={row.seq}
                            onChange={e => updateRow(i, { seq: Number(e.target.value) })}
                            className="w-12 h-6 px-1 text-xs font-mono text-t-secondary bg-input border border-input-line rounded text-center outline-none focus:border-accent"
                          />
                        </td>

                        {/* Machine Type */}
                        <td className="px-3 py-2 text-t-body">{row.machineTypeName}</td>

                        {/* Operation */}
                        <td className="px-3 py-2 font-semibold text-accent max-w-[160px] truncate">
                          {row.operationName}
                        </td>

                        {/* SAM — editable stepper */}
                        <td className="px-2 py-1.5">
                          <div className="flex justify-end">
                            <Stepper
                              value={row.sam}
                              step={0.01}
                              min={0.01}
                              onChange={v => updateRow(i, { sam: v })}
                            />
                          </div>
                        </td>

                        {/* 100%/Hr — auto */}
                        <td className="px-3 py-2 text-right font-semibold text-accent">
                          {fmt(r2(row.row100Hr))}
                        </td>

                        {/* Req Manni — auto (Excel G = D23/F) */}
                        <td className="px-3 py-2 text-right text-t-body">
                          {r2(row.reqManning).toFixed(2)}
                        </td>

                        {/* Manning — read-only (same as Req Manni, shown for reference) */}
                        <td className="px-3 py-2 text-right text-t-body">
                          {r2(row.reqManning).toFixed(2)}
                        </td>

                        {/* Alloc — per-row editable stepper (Excel H, default = allocManning) */}
                        <td className="px-2 py-1.5">
                          <div className="flex justify-end">
                            <Stepper
                              value={row.alloc}
                              step={0.25}
                              min={0}
                              onChange={v => updateRow(i, { alloc: v })}
                            />
                          </div>
                        </td>

                        {/* Alloc Manni 100%HR — auto (Excel I = H×F = alloc × row100Hr) */}
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
