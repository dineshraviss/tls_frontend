'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, Upload, Plus, Pencil, Trash2, X, QrCode, ArrowRight, ChevronDown } from 'lucide-react'

// ── Types ─────────────────────────────────────────────
interface MachineSpec {
  id: string
  brand: string
  model: string
  line: string
  condition: string
  nextMaint: string
  status: 'Active' | 'Offline'
}

interface Operation {
  code: string
  mType: string
  name: string
  sam: number
  defects: number
}

interface MachineType {
  id: number
  name: string
  category: string
  description: string
  machines: number
  active: number
  maintenance: number
  operations: number
  specs: MachineSpec[]
  ops: Operation[]
}

// ── Mock data ─────────────────────────────────────────
const initialTypes: MachineType[] = [
  {
    id: 1, name: '2T Flatlock', category: 'Flatlock',
    description: '2-thread flat seam for activewear and sportswear hemming.',
    machines: 2, active: 2, maintenance: 0, operations: 2,
    specs: [
      { id: 'M-001', brand: 'Yamato', model: 'VF2400', line: 'L1', condition: 'Good', nextMaint: '21 Feb 25', status: 'Active' },
      { id: 'M-002', brand: 'Yamato', model: 'VF2400', line: 'L1', condition: 'Good', nextMaint: '21 Feb 25', status: 'Active' },
    ],
    ops: [
      { code: 'OP-001', mType: '2T Flatlock', name: 'ARM HOLE PIPING',     sam: 0.35, defects: 2 },
      { code: 'OP-002', mType: '2T Flatlock', name: 'BACK POCKET ATTACH',  sam: 0.50, defects: 3 },
    ],
  },
  {
    id: 2, name: '3T Flatlock', category: 'Flatlock',
    description: '3-thread flat seam for heavy-duty activewear.',
    machines: 1, active: 1, maintenance: 0, operations: 1,
    specs: [{ id: 'M-003', brand: 'Yamato', model: 'VF3200', line: 'L2', condition: 'Good', nextMaint: '10 Mar 25', status: 'Active' }],
    ops: [{ code: 'OP-003', mType: '3T Flatlock', name: 'ATTACH POCKET BINDING', sam: 0.50, defects: 2 }],
  },
  {
    id: 3, name: '5T Flatlock', category: 'Flatlock',
    description: '5-thread flat seam for premium sportswear.',
    machines: 2, active: 1, maintenance: 1, operations: 2,
    specs: [
      { id: 'M-004', brand: 'Pegasus', model: 'W500', line: 'L3', condition: 'Fair', nextMaint: '05 Apr 25', status: 'Active' },
      { id: 'M-005', brand: 'Pegasus', model: 'W500', line: 'L3', condition: 'Poor', nextMaint: '01 Mar 25', status: 'Offline' },
    ],
    ops: [
      { code: 'OP-004', mType: '5T Flatlock', name: 'SIDE SEAM JOIN', sam: 0.45, defects: 1 },
      { code: 'OP-005', mType: '5T Flatlock', name: 'SLEEVE HEM',     sam: 0.30, defects: 2 },
    ],
  },
  { id: 4, name: '1N SNLS', category: 'SNLS', description: 'Single needle lock stitch.', machines: 3, active: 3, maintenance: 0, operations: 3, specs: [], ops: [] },
  { id: 5, name: '3T Overlock', category: 'Overlock', description: '3-thread overlock stitch.', machines: 1, active: 1, maintenance: 0, operations: 1, specs: [], ops: [] },
  { id: 6, name: '5T Overlock', category: 'Overlock', description: '5-thread overlock stitch.', machines: 1, active: 0, maintenance: 1, operations: 1, specs: [], ops: [] },
  { id: 7, name: '2T Flatseam', category: 'Flatseam', description: '2-thread flat seam variant.', machines: 1, active: 1, maintenance: 0, operations: 1, specs: [], ops: [] },
  { id: 8, name: '2N DNLS', category: 'DNLS', description: 'Double needle lock stitch.', machines: 1, active: 1, maintenance: 0, operations: 0, specs: [], ops: [] },
]

// ── Add Machine Type Modal ────────────────────────────
function AddMachineTypeModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, desc: string) => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const inp: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A5568', marginBottom: 4 }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, backgroundColor: '#fff', borderRadius: 10, width: 420, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EDF2F7' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C' }}>Add Machine Type</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4, display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Machine Type Name</label>
            <input style={inp} placeholder="e.g. Flatlock" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={lbl}>Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Brief description of this machine type and its use case"
              style={{ ...inp, height: 72, padding: '8px 10px', resize: 'none' as const }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #EDF2F7' }}>
          <button onClick={onClose} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={() => { onSave(name, desc); onClose() }} style={{ height: 34, padding: '0 18px', background: '#2DB3A0', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Add Machine Type
          </button>
        </div>
      </div>
    </>
  )
}

// ── QR Code Modal ─────────────────────────────────────
function QRCodeModal({ spec, onClose }: { spec: MachineSpec; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, backgroundColor: '#fff', borderRadius: 10, width: 340, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EDF2F7' }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1A202C' }}>Machine Specification QR Code</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4, display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          {/* QR placeholder */}
          <div style={{ width: 140, height: 140, margin: '0 auto 16px', border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7FAFC', position: 'relative', overflow: 'hidden' }}>
            {/* Simple QR visual placeholder */}
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Corner squares */}
              <rect x="8" y="8" width="28" height="28" fill="none" stroke="#1A202C" strokeWidth="3"/>
              <rect x="13" y="13" width="18" height="18" fill="#1A202C"/>
              <rect x="84" y="8" width="28" height="28" fill="none" stroke="#1A202C" strokeWidth="3"/>
              <rect x="89" y="13" width="18" height="18" fill="#1A202C"/>
              <rect x="8" y="84" width="28" height="28" fill="none" stroke="#1A202C" strokeWidth="3"/>
              <rect x="13" y="89" width="18" height="18" fill="#1A202C"/>
              {/* Logo center */}
              <text x="60" y="56" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1A202C">iQ2</text>
              <text x="60" y="67" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2DB3A0">TLS</text>
              {/* Dots pattern */}
              {[44,50,56,62,68,74].map(x => [44,50,56,62,68,74].map(y => Math.random() > 0.5 && (
                <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill="#1A202C" />
              )))}
            </svg>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: '#4A5568' }}>Model No: <strong>{spec.model}</strong></p>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#4A5568' }}>Serial No: <strong>TLS-S00547</strong></p>
          <button style={{ height: 34, padding: '0 18px', background: '#2DB3A0', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> Download QR Code
          </button>
        </div>
      </div>
    </>
  )
}

// ── Add Operation Modal ────────────────────────────────
function AddOperationModal({ machineTypeName, onClose, onSave }: { machineTypeName: string; onClose: () => void; onSave: (op: Omit<Operation, 'defects'>) => void }) {
  const [form, setForm] = useState({ name: '', code: '', sam: '', defects: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inp: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A5568', marginBottom: 4 }

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
            <div style={{ ...inp, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7FAFC', cursor: 'default' }}>
              <span style={{ fontSize: 12.5, color: '#2D3748' }}>{machineTypeName}</span>
              <ChevronDown size={13} color="#A0AEC0" />
            </div>
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
              onSave({ code: form.code || 'OP-NEW', mType: machineTypeName, name: form.name || 'NEW OPERATION', sam: parseFloat(form.sam) || 0 })
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

// ── Operation Detail Panel ────────────────────────────
function OperationDetailPanel({ op, machineTypeName, onClose }: { op: Operation; machineTypeName: string; onClose: () => void }) {
  const defects = [
    { name: 'Needle Distance', level: 'Normal',   color: '#BEE3F8', text: '#2C5282' },
    { name: 'Uneven Stitch',   level: 'Bad',      color: '#FED7D7', text: '#9B2C2C' },
    { name: 'Needle Distance', level: 'Critical', color: '#FED7D7', text: '#9B2C2C' },
  ]
  return (
    <div style={{ width: 280, flexShrink: 0, borderLeft: '1px solid #E2E8F0', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #EDF2F7' }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: '#A0AEC0', fontWeight: 600 }}>{machineTypeName} | {op.code}</p>
          <h3 style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#1A202C' }}>{op.name}</h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4, display: 'flex' }}><X size={16} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.07em' }}>OPERATION NAME</p>
        <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{op.name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '10px', backgroundColor: '#F7FAFC', borderRadius: 6 }}>
            <p style={{ margin: '0 0 3px', fontSize: 10, color: '#A0AEC0' }}>Op Code</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{op.code}</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F7FAFC', borderRadius: 6 }}>
            <p style={{ margin: '0 0 3px', fontSize: 10, color: '#A0AEC0' }}>Machine Type</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{op.mType}</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F7FAFC', borderRadius: 6, gridColumn: 'span 2' }}>
            <p style={{ margin: '0 0 3px', fontSize: 10, color: '#A0AEC0' }}>SAM (minutes)</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{op.sam}</p>
          </div>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.07em' }}>POSSIBLE DEFECTS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {defects.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#F7FAFC', borderRadius: 6 }}>
              <span style={{ fontSize: 12, color: '#4A5568' }}>{d.name}</span>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10, backgroundColor: d.color, color: d.text }}>{d.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function MachineHubPage() {
  const [types, setTypes] = useState<MachineType[]>(initialTypes)
  const [selectedId, setSelectedId] = useState<number>(1)
  const [subTab, setSubTab] = useState<'Machine Specification' | 'Operation Master'>('Machine Specification')
  const [searchType, setSearchType] = useState('')
  const [showAddType, setShowAddType] = useState(false)
  const [showQR, setShowQR] = useState<MachineSpec | null>(null)
  const [showAddOp, setShowAddOp] = useState(false)
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null)

  const selected = types.find(t => t.id === selectedId)!

  const filteredTypes = types.filter(t =>
    t.name.toLowerCase().includes(searchType.toLowerCase()) ||
    t.category.toLowerCase().includes(searchType.toLowerCase())
  )

  const addType = (name: string, desc: string) => {
    const cat = name.split(' ').pop() ?? name
    setTypes(prev => [...prev, { id: prev.length + 1, name, category: cat, description: desc, machines: 0, active: 0, maintenance: 0, operations: 0, specs: [], ops: [] }])
  }

  const addOperation = (op: Omit<Operation, 'defects'>) => {
    setTypes(prev => prev.map(t => t.id === selectedId ? { ...t, ops: [...t.ops, { ...op, defects: 0 }], operations: t.operations + 1 } : t))
  }

  const specCount = selected.specs.length
  const opCount   = selected.ops.length

  return (
    <AppLayout>
      {showAddType && <AddMachineTypeModal onClose={() => setShowAddType(false)} onSave={addType} />}
      {showQR      && <QRCodeModal spec={showQR} onClose={() => setShowQR(null)} />}
      {showAddOp   && <AddOperationModal machineTypeName={selected.name} onClose={() => setShowAddOp(false)} onSave={addOperation} />}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>›</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Machine Hub</span>
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Machine Hub</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Assign operations to a style with SAM values, sequence & manning.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#A0AEC0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
            <input placeholder="Search" style={{ height: 32, paddingLeft: 28, paddingRight: 10, fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', width: 160 }} />
          </div>
          <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
            <Download size={13} /> Export
          </button>
          <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
            <Upload size={13} /> Import
          </button>
          <button onClick={() => setShowAddType(true)} style={{ height: 32, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5, background: '#2DB3A0', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#fff', fontWeight: 600, fontFamily: 'inherit' }}>
            <Plus size={13} /> Add Machine Type
          </button>
        </div>
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0', marginBottom: 12 }}>
        {['Machine Type', 'Maintenance'].map(tab => (
          <button key={tab} style={{ padding: '7px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === 'Machine Type' ? 600 : 400, color: tab === 'Machine Type' ? '#2DB3A0' : '#718096', borderBottom: tab === 'Machine Type' ? '2px solid #2DB3A0' : '2px solid transparent', marginBottom: -1, fontFamily: 'inherit' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 260px)', minHeight: 400 }}>

        {/* Left: machine type list */}
        <div style={{ width: 220, flexShrink: 0, backgroundColor: '#fff', borderRadius: '8px 0 0 8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #EDF2F7', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={12} color="#A0AEC0" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                placeholder="Search"
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                style={{ width: '100%', height: 30, paddingLeft: 26, paddingRight: 8, fontSize: 12, fontFamily: 'inherit', color: '#2D3748', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredTypes.map(t => (
              <div
                key={t.id}
                onClick={() => { setSelectedId(t.id); setSelectedOp(null) }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #EDF2F7',
                  backgroundColor: selectedId === t.id ? '#EBF8F6' : '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: selectedId === t.id ? 600 : 500, color: selectedId === t.id ? '#2DB3A0' : '#2D3748' }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: selectedId === t.id ? '#2DB3A0' : '#A0AEC0' }}>{t.category}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: selectedId === t.id ? '#2DB3A0' : '#A0AEC0', backgroundColor: selectedId === t.id ? 'rgba(45,179,160,0.12)' : '#EDF2F7', borderRadius: 10, padding: '1px 8px' }}>
                  {t.machines}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div style={{ flex: 1, minWidth: 0, border: '1px solid #E2E8F0', borderLeft: 'none', borderRadius: '0 8px 8px 0', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Type header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EDF2F7', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#2DB3A0', backgroundColor: 'rgba(45,179,160,0.1)', padding: '2px 8px', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>
                  FL-2T
                </span>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#1A202C' }}>{selected.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>{selected.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ height: 30, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12, color: '#4A5568', fontFamily: 'inherit' }}>
                  <Pencil size={12} /> Edit
                </button>
                <button style={{ height: 30, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #FEB2B2', borderRadius: 5, cursor: 'pointer', fontSize: 12, color: '#E53E3E', fontFamily: 'inherit' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 0, marginTop: 14, border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
              {[{ label: 'Machines', value: selected.machines }, { label: 'Active', value: selected.active }, { label: 'In Maintenance', value: selected.maintenance || '--' }, { label: 'Operations', value: selected.operations }].map((s, i) => (
                <div key={s.label} style={{ padding: '10px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid #E2E8F0' : 'none' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 11, color: '#A0AEC0', whiteSpace: 'nowrap' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A202C' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-tabs + content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #EDF2F7', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {(['Machine Specification', 'Operation Master'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setSubTab(tab); setSelectedOp(null) }}
                    style={{ padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: subTab === tab ? 600 : 400, color: subTab === tab ? '#2DB3A0' : '#718096', borderBottom: subTab === tab ? '2px solid #2DB3A0' : '2px solid transparent', marginBottom: -1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    {tab} <span style={{ fontSize: 11, color: '#A0AEC0', marginLeft: 4 }}>{tab === 'Machine Specification' ? specCount : opCount}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => subTab === 'Operation Master' ? setShowAddOp(true) : undefined}
                style={{ height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, background: '#2DB3A0', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600, fontFamily: 'inherit' }}
              >
                <Plus size={12} /> Add New
              </button>
            </div>

            {/* Sub-tab content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {subTab === 'Machine Specification' ? (
                  specCount === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A0AEC0', fontSize: 13 }}>
                      No machines registered for this type yet
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F7FAFC' }}>
                          {['M. No ↑', 'Brand', 'Model', 'Line ↑', 'Condition ↑', 'Next Maint. ↑', 'Status', ''].map((h, i) => (
                            <th key={i} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.specs.map((spec, i) => (
                          <tr key={spec.id} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                            <td style={{ padding: '10px 14px', color: '#2DB3A0', fontWeight: 600 }}>{spec.id}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{spec.brand}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{spec.model}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{spec.line}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{spec.condition}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{spec.nextMaint}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, backgroundColor: spec.status === 'Active' ? '#C6F6D5' : '#FED7D7', color: spec.status === 'Active' ? '#276749' : '#9B2C2C' }}>
                                {spec.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => setShowQR(spec)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A0AEC0', display: 'flex' }} title="QR Code"><QrCode size={13} /></button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2DB3A0', display: 'flex' }} title="View"><ArrowRight size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : (
                  opCount === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A0AEC0', fontSize: 13 }}>
                      No operations for this type yet
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F7FAFC' }}>
                          {['Code', 'M-Type', 'Operation Name', 'SAM', 'Defects', ''].map((h, i) => (
                            <th key={i} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.ops.map((op, i) => (
                          <tr key={op.code} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: selectedOp?.code === op.code ? 'rgba(45,179,160,0.04)' : i % 2 === 0 ? '#fff' : '#FAFBFC', cursor: 'pointer' }} onClick={() => setSelectedOp(op)}>
                            <td style={{ padding: '10px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{op.code}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{op.mType}</td>
                            <td style={{ padding: '10px 14px', color: '#2D3748', fontWeight: 500 }}>{op.name}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{op.sam}</td>
                            <td style={{ padding: '10px 14px', color: '#4A5568' }}>{op.defects}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2DB3A0', display: 'flex' }}><ArrowRight size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>

              {/* Operation detail side panel */}
              {selectedOp && subTab === 'Operation Master' && (
                <OperationDetailPanel op={selectedOp} machineTypeName={selected.name} onClose={() => setSelectedOp(null)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
