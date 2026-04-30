'use client'

import { useState } from 'react'
import { Plus, X, MoreVertical } from 'lucide-react'
import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import Badge from '@/components/ui/Badge'
import type { Cap } from './types'

function severityBadge(severity: unknown) {
  const s = String(severity ?? '').toLowerCase()
  if (s === 'critical') return <Badge variant="error">Critical</Badge>
  if (s === 'major') return <Badge variant="warning">Major</Badge>
  return <Badge variant="success">Minor</Badge>
}

interface DefectViewProps {
  viewData: Record<string, unknown> | null
  viewLoading: boolean
  onClose: () => void
  onAddCap: (defectId: number, cap: { cap_name: string; short_name: string; notes: string }) => Promise<void>
}

export default function DefectView({ viewData, viewLoading, onClose, onAddCap }: DefectViewProps) {
  const [addingCap, setAddingCap] = useState(false)
  const [newCap, setNewCap] = useState({ cap_name: '', short_name: '', notes: '' })
  const [capSaving, setCapSaving] = useState(false)

  if (!viewData && !viewLoading) return null

  const caps = (viewData?.caps as Cap[] | undefined) ?? []
  const department = (viewData?.department as Record<string, unknown> | undefined)

  const handleAddCap = async () => {
    if (!newCap.cap_name.trim()) return
    setCapSaving(true)
    await onAddCap(viewData!.id as number, newCap)
    setNewCap({ cap_name: '', short_name: '', notes: '' })
    setAddingCap(false)
    setCapSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[9997] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[1] bg-modal w-full max-w-[500px] h-full flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
          <div className="flex-1 min-w-0">
            {viewLoading || !viewData ? (
              <div className="h-5 w-48 bg-table-head rounded animate-pulse" />
            ) : (
              <>
                <h2 className="text-base font-bold text-t-primary leading-snug">
                  {String(viewData.code ?? '')} | {String(viewData.defect_name ?? '')}
                </h2>
                {viewData.description && (
                  <p className="text-xs text-t-lighter mt-1.5 leading-relaxed">{String(viewData.description)}</p>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 mt-0.5 p-1 text-t-lighter hover:text-t-body transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Meta chips */}
        {!viewLoading && viewData && (
          <div className="flex items-center gap-3 px-6 pb-4 shrink-0">
            {!!viewData.category && <span className="text-sm text-t-body">{String(viewData.category)}</span>}
            {!!department?.name && <span className="text-sm text-t-body">{String(department.name)}</span>}
            {severityBadge(String(viewData.severity ?? ''))}
          </div>
        )}

        <div className="h-px bg-table-line mx-6 shrink-0" />

        {/* CAP section */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {viewLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-10 bg-table-head rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-t-primary">
                  Corrective Action Plans ({caps.length})
                </h3>
                <button
                  onClick={() => setAddingCap(v => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-accent border border-accent/40 rounded px-2.5 py-1 hover:bg-accent/5 transition-colors"
                >
                  <Plus size={12} /> Add CAP
                </button>
              </div>

              {addingCap && (
                <div className="flex flex-col gap-2 mb-4 p-3 rounded-card border border-table-line bg-card-alt">
                  <FormInput
                    label="CAP Name"
                    value={newCap.cap_name}
                    onChange={e => setNewCap(v => ({ ...v, cap_name: e.target.value }))}
                    placeholder="e.g. Adjust needle position"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormInput
                      label="Short Name"
                      value={newCap.short_name}
                      onChange={e => setNewCap(v => ({ ...v, short_name: e.target.value }))}
                      placeholder="e.g. Cap name short"
                    />
                    <FormInput
                      label="Notes"
                      value={newCap.notes}
                      onChange={e => setNewCap(v => ({ ...v, notes: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddingCap(false)
                        setNewCap({ cap_name: '', short_name: '', notes: '' })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddCap} isLoading={capSaving}>
                      Save CAP
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {caps.length === 0 && (
                  <p className="text-xs text-t-lighter py-6 text-center">
                    No corrective action plans added.
                  </p>
                )}
                {caps.map((cap, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 rounded-card border border-table-line bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-accent shrink-0">CAP-{i + 1}</span>
                      <span className="text-sm text-t-body truncate">{cap.cap_name}</span>
                    </div>
                    <button className="text-t-lighter hover:text-t-body p-1 shrink-0">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
