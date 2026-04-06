'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, Plus, X, ChevronDown, ArrowRight } from 'lucide-react'

interface Operation {
  id: number
  code: string
  machineType: string
  name: string
  sam: number
  defects: number
}

const initialOps: Operation[] = [
  { id: 1, code: 'OP-001', machineType: '2T Flatlock',  name: 'ARM HOLE PIPING',       sam: 0.35, defects: 2 },
  { id: 2, code: 'OP-002', machineType: '1N SNLS',      name: 'BACK POCKET ATTACH',    sam: 0.50, defects: 3 },
  { id: 3, code: 'OP-003', machineType: '3T Overlock',  name: 'ATTACH POCKET BINDING', sam: 0.50, defects: 2 },
  { id: 4, code: 'OP-004', machineType: '2T Flatseam',  name: 'ARM HOLE PIPING',       sam: 0.50, defects: 0 },
]

const MACHINE_TYPES = ['2T Flatlock','3T Flatlock','5T Flatlock','1N SNLS','3T Overlock','5T Overlock','2T Flatseam','2N DNLS']

// ── Add Operation Modal ────────────────────────────────
function AddOperationModal({ onClose, onSave }: { onClose: () => void; onSave: (op: Omit<Operation, 'id'>) => void }) {
  const [form, setForm] = useState({ machineType: '', name: '', code: '', sam: '', defects: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inp: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A5568', marginBottom: 4 }
  const sel: React.CSSProperties = { ...inp, cursor: 'pointer' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, backgroundColor: '#fff', borderRadius: 10, width: 420, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EDF2F7' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C' }}>Add Operation</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4, display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Machine Type</label>
            <select style={sel} value={form.machineType} onChange={e => set('machineType', e.target.value)}>
              <option value="">Select type</option>
              {MACHINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Operation Name</label>
            <input style={inp} placeholder="e.g. ARM HOLE PIPING" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div><label style={lbl}>Op Code</label><input style={inp} placeholder="OP-010" value={form.code} onChange={e => set('code', e.target.value)} /></div>
            <div><label style={lbl}>SAM (minutes)</label><input style={inp} placeholder="0.5" type="number" step="0.01" value={form.sam} onChange={e => set('sam', e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={lbl}>Possible Defects</label>
            <input style={inp} placeholder="+ Add defects" value={form.defects} onChange={e => set('defects', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #EDF2F7' }}>
          <button onClick={onClose} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button
            onClick={() => {
              onSave({ code: form.code || 'OP-NEW', machineType: form.machineType || MACHINE_TYPES[0], name: form.name || 'NEW OP', sam: parseFloat(form.sam) || 0, defects: 0 })
              onClose()
            }}
            style={{ height: 34, padding: '0 18px', background: '#2DB3A0', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Add Operation
          </button>
        </div>
      </div>
    </>
  )
}

export default function OperationMasterPage() {
  const [ops, setOps] = useState<Operation[]>(initialOps)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = ops.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.machineType.toLowerCase().includes(search.toLowerCase()) ||
    o.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (op: Omit<Operation, 'id'>) => {
    setOps(prev => [...prev, { ...op, id: prev.length + 1 }])
  }

  return (
    <AppLayout>
      {showModal && <AddOperationModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>›</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Operation Master</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Operation Master</h1>
        <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Define sewing operations, machine types, insertion rates and possible defects.</p>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #EDF2F7', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>All Operations</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#A0AEC0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
              <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} style={{ height: 32, paddingLeft: 28, paddingRight: 10, fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', width: 160 }} />
            </div>
            <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
              <Download size={13} /> Export
            </button>
            <button onClick={() => setShowModal(true)} style={{ height: 32, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5, background: '#2DB3A0', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#fff', fontWeight: 600, fontFamily: 'inherit' }}>
              <Plus size={13} /> Add Operation
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                {['Code ↑', 'Machine Type', 'Operation Name', 'SAM', 'Defects', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No operations found</td></tr>
              ) : filtered.map((op, i) => (
                <tr key={op.id} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                  <td style={{ padding: '11px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{op.code}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568' }}>{op.machineType}</td>
                  <td style={{ padding: '11px 14px', color: '#2D3748', fontWeight: 500 }}>{op.name}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568' }}>{op.sam}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568' }}>{op.defects > 0 ? op.defects : <span style={{ color: '#CBD5E0' }}>—</span>}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2DB3A0', display: 'flex' }}><ArrowRight size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid #EDF2F7' }}>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>{filtered.length} operation{filtered.length !== 1 ? 's' : ''} found</span>
        </div>
      </div>
    </AppLayout>
  )
}
