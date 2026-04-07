'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, Upload, Plus, Pencil, Trash2, X, QrCode, ArrowRight, ChevronDown } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import FormInput from '@/components/ui/FormInput'
import Badge from '@/components/ui/Badge'

interface MachineSpec { id: string; brand: string; model: string; line: string; condition: string; nextMaint: string; status: 'Active' | 'Offline' }
interface Operation { code: string; mType: string; name: string; sam: number; defects: number }
interface MachineType { id: number; name: string; category: string; description: string; machines: number; active: number; maintenance: number; operations: number; specs: MachineSpec[]; ops: Operation[] }

const initialTypes: MachineType[] = [
  { id: 1, name: '2T Flatlock', category: 'Flatlock', description: '2-thread flat seam for activewear and sportswear hemming.', machines: 2, active: 2, maintenance: 0, operations: 2,
    specs: [{ id: 'M-001', brand: 'Yamato', model: 'VF2400', line: 'L1', condition: 'Good', nextMaint: '21 Feb 25', status: 'Active' }, { id: 'M-002', brand: 'Yamato', model: 'VF2400', line: 'L1', condition: 'Good', nextMaint: '21 Feb 25', status: 'Active' }],
    ops: [{ code: 'OP-001', mType: '2T Flatlock', name: 'ARM HOLE PIPING', sam: 0.35, defects: 2 }, { code: 'OP-002', mType: '2T Flatlock', name: 'BACK POCKET ATTACH', sam: 0.50, defects: 3 }] },
  { id: 2, name: '3T Flatlock', category: 'Flatlock', description: '3-thread flat seam for heavy-duty activewear.', machines: 1, active: 1, maintenance: 0, operations: 1,
    specs: [{ id: 'M-003', brand: 'Yamato', model: 'VF3200', line: 'L2', condition: 'Good', nextMaint: '10 Mar 25', status: 'Active' }],
    ops: [{ code: 'OP-003', mType: '3T Flatlock', name: 'ATTACH POCKET BINDING', sam: 0.50, defects: 2 }] },
  { id: 3, name: '5T Flatlock', category: 'Flatlock', description: '5-thread flat seam for premium sportswear.', machines: 2, active: 1, maintenance: 1, operations: 2,
    specs: [{ id: 'M-004', brand: 'Pegasus', model: 'W500', line: 'L3', condition: 'Fair', nextMaint: '05 Apr 25', status: 'Active' }, { id: 'M-005', brand: 'Pegasus', model: 'W500', line: 'L3', condition: 'Poor', nextMaint: '01 Mar 25', status: 'Offline' }],
    ops: [{ code: 'OP-004', mType: '5T Flatlock', name: 'SIDE SEAM JOIN', sam: 0.45, defects: 1 }, { code: 'OP-005', mType: '5T Flatlock', name: 'SLEEVE HEM', sam: 0.30, defects: 2 }] },
  { id: 4, name: '1N SNLS', category: 'SNLS', description: 'Single needle lock stitch.', machines: 3, active: 3, maintenance: 0, operations: 3, specs: [], ops: [] },
  { id: 5, name: '3T Overlock', category: 'Overlock', description: '3-thread overlock stitch.', machines: 1, active: 1, maintenance: 0, operations: 1, specs: [], ops: [] },
  { id: 6, name: '5T Overlock', category: 'Overlock', description: '5-thread overlock stitch.', machines: 1, active: 0, maintenance: 1, operations: 1, specs: [], ops: [] },
  { id: 7, name: '2T Flatseam', category: 'Flatseam', description: '2-thread flat seam variant.', machines: 1, active: 1, maintenance: 0, operations: 1, specs: [], ops: [] },
  { id: 8, name: '2N DNLS', category: 'DNLS', description: 'Double needle lock stitch.', machines: 1, active: 1, maintenance: 0, operations: 0, specs: [], ops: [] },
]

// ── Add Machine Type Modal ──
function AddMachineTypeModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, desc: string) => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  return (
    <Modal title="Add Machine Type" onClose={onClose} footer={
      <>
        <button onClick={onClose} className="h-[34px] px-[18px] bg-card border border-input-line rounded-[5px] text-[13px] text-t-body cursor-pointer font-inherit">Cancel</button>
        <button onClick={() => { onSave(name, desc); onClose() }} className="h-[34px] px-[18px] bg-accent hover:bg-accent-hover border-none rounded-[5px] text-[13px] text-white font-semibold cursor-pointer font-inherit">Add Machine Type</button>
      </>
    }>
      <div className="flex flex-col gap-3">
        <FormInput label="Machine Type Name" placeholder="e.g. Flatlock" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] font-medium text-t-body">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description" className="w-full h-[72px] px-2.5 py-2 text-[12.5px] text-t-secondary bg-input border border-input-line rounded-[5px] outline-none resize-none focus:border-accent focus:ring-2 focus:ring-accent/15" />
        </div>
      </div>
    </Modal>
  )
}

// ── QR Code Modal ──
function QRCodeModal({ spec, onClose }: { spec: MachineSpec; onClose: () => void }) {
  return (
    <Modal title="Machine Specification QR Code" onClose={onClose} footer={
      <button className="h-[34px] px-[18px] bg-accent hover:bg-accent-hover border-none rounded-[5px] text-[13px] text-white font-semibold cursor-pointer font-inherit inline-flex items-center gap-1.5">
        <Download size={13} /> Download QR Code
      </button>
    }>
      <div className="text-center">
        <div className="w-[140px] h-[140px] mx-auto mb-4 border border-header-line rounded-md flex items-center justify-center bg-table-head relative overflow-hidden">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <rect x="8" y="8" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3"/>
            <rect x="13" y="13" width="18" height="18" fill="currentColor"/>
            <rect x="84" y="8" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3"/>
            <rect x="89" y="13" width="18" height="18" fill="currentColor"/>
            <rect x="8" y="84" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3"/>
            <rect x="13" y="89" width="18" height="18" fill="currentColor"/>
            <text x="60" y="56" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">iQ2</text>
            <text x="60" y="67" textAnchor="middle" fontSize="9" fontWeight="bold" className="fill-accent">TLS</text>
          </svg>
        </div>
        <p className="m-0 mb-1 text-xs text-t-body">Model No: <strong>{spec.model}</strong></p>
        <p className="m-0 text-xs text-t-body">Serial No: <strong>TLS-S00547</strong></p>
      </div>
    </Modal>
  )
}

// ── Add Operation Modal ──
function AddOperationModal({ machineTypeName, onClose, onSave }: { machineTypeName: string; onClose: () => void; onSave: (op: Omit<Operation, 'defects'>) => void }) {
  const [form, setForm] = useState({ name: '', code: '', sam: '', defects: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal title="Add Operation" onClose={onClose} footer={
      <>
        <button onClick={onClose} className="h-[34px] px-[18px] bg-card border border-input-line rounded-[5px] text-[13px] text-t-body cursor-pointer font-inherit">Cancel</button>
        <button onClick={() => { onSave({ code: form.code || 'OP-NEW', mType: machineTypeName, name: form.name || 'NEW OPERATION', sam: parseFloat(form.sam) || 0 }); onClose() }}
          className="h-[34px] px-[18px] bg-accent hover:bg-accent-hover border-none rounded-[5px] text-[13px] text-white font-semibold cursor-pointer font-inherit">Add Operation</button>
      </>
    }>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] font-medium text-t-body">Machine Type</label>
          <div className="w-full h-[34px] px-2.5 flex items-center justify-between bg-table-head border border-input-line rounded-[5px] text-[12.5px] text-t-secondary cursor-default">
            <span>{machineTypeName}</span><ChevronDown size={13} className="text-t-lighter" />
          </div>
        </div>
        <FormInput label="Operation Name" placeholder="e.g. ARM HOLE PIPING" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
        <div className="grid grid-cols-2 gap-2.5">
          <FormInput label="Op Code" placeholder="OP-010" value={form.code} onChange={e => set('code', e.target.value)} />
          <FormInput label="SAM (minutes)" placeholder="0.5" type="number" step="0.01" value={form.sam} onChange={e => set('sam', e.target.value)} />
        </div>
        <FormInput label="Possible Defects" placeholder="+ Add defects" value={form.defects} onChange={e => set('defects', e.target.value)} />
      </div>
    </Modal>
  )
}

// ── Operation Detail Panel ──
function OperationDetailPanel({ op, machineTypeName, onClose }: { op: Operation; machineTypeName: string; onClose: () => void }) {
  const defects = [
    { name: 'Needle Distance', level: 'Normal', variant: 'info' as const },
    { name: 'Uneven Stitch', level: 'Bad', variant: 'error' as const },
    { name: 'Needle Distance', level: 'Critical', variant: 'error' as const },
  ]
  return (
    <div className="w-[280px] shrink-0 border-l border-header-line bg-card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-table-line">
        <div>
          <p className="m-0 text-[10px] text-t-lighter font-semibold">{machineTypeName} | {op.code}</p>
          <h3 className="m-0 mt-0.5 text-[13px] font-bold text-t-primary">{op.name}</h3>
        </div>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-1 text-t-lighter flex"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3.5">
        <p className="m-0 mb-3 text-[11px] font-bold text-t-lighter tracking-wider">OPERATION NAME</p>
        <p className="m-0 mb-4 text-[13px] font-semibold text-t-secondary">{op.name}</p>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-2.5 bg-table-head rounded-md"><p className="m-0 mb-0.5 text-[10px] text-t-lighter">Op Code</p><p className="m-0 text-[13px] font-semibold text-t-secondary">{op.code}</p></div>
          <div className="p-2.5 bg-table-head rounded-md"><p className="m-0 mb-0.5 text-[10px] text-t-lighter">Machine Type</p><p className="m-0 text-[13px] font-semibold text-t-secondary">{op.mType}</p></div>
          <div className="p-2.5 bg-table-head rounded-md col-span-2"><p className="m-0 mb-0.5 text-[10px] text-t-lighter">SAM (minutes)</p><p className="m-0 text-[13px] font-semibold text-t-secondary">{op.sam}</p></div>
        </div>
        <p className="m-0 mb-2.5 text-[11px] font-bold text-t-lighter tracking-wider">POSSIBLE DEFECTS</p>
        <div className="flex flex-col gap-2">
          {defects.map((d, i) => (
            <div key={i} className="flex justify-between items-center px-2.5 py-2 bg-table-head rounded-md">
              <span className="text-xs text-t-body">{d.name}</span>
              <Badge variant={d.variant}>{d.level}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──
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
  const filteredTypes = types.filter(t => t.name.toLowerCase().includes(searchType.toLowerCase()) || t.category.toLowerCase().includes(searchType.toLowerCase()))

  const addType = (name: string, desc: string) => {
    const cat = name.split(' ').pop() ?? name
    setTypes(prev => [...prev, { id: prev.length + 1, name, category: cat, description: desc, machines: 0, active: 0, maintenance: 0, operations: 0, specs: [], ops: [] }])
  }
  const addOperation = (op: Omit<Operation, 'defects'>) => {
    setTypes(prev => prev.map(t => t.id === selectedId ? { ...t, ops: [...t.ops, { ...op, defects: 0 }], operations: t.operations + 1 } : t))
  }

  return (
    <AppLayout>
      {showAddType && <AddMachineTypeModal onClose={() => setShowAddType(false)} onSave={addType} />}
      {showQR && <QRCodeModal spec={showQR} onClose={() => setShowQR(null)} />}
      {showAddOp && <AddOperationModal machineTypeName={selected.name} onClose={() => setShowAddOp(false)} onSave={addOperation} />}

      <Breadcrumb items={[{ label: 'Master' }, { label: 'Machine Hub', active: true }]} />

      <PageHeader title="Machine Hub" description="Assign operations to a style with SAM values, sequence & manning.">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter" />
            <input placeholder="Search" className="h-8 pl-7 pr-2.5 text-[12.5px] font-inherit text-t-secondary bg-card border border-header-line rounded-[5px] outline-none w-40 focus:border-accent" />
          </div>
          <button className="h-8 px-3 flex items-center gap-1.5 bg-card border border-input-line rounded-[5px] cursor-pointer text-[12.5px] text-t-body font-inherit hover:bg-table-head"><Download size={13} /> Export</button>
          <button className="h-8 px-3 flex items-center gap-1.5 bg-card border border-input-line rounded-[5px] cursor-pointer text-[12.5px] text-t-body font-inherit hover:bg-table-head"><Upload size={13} /> Import</button>
          <button onClick={() => setShowAddType(true)} className="h-8 px-3.5 flex items-center gap-1.5 bg-accent hover:bg-accent-hover border-none rounded-[5px] cursor-pointer text-[12.5px] text-white font-semibold font-inherit"><Plus size={13} /> Add Machine Type</button>
        </div>
      </PageHeader>

      {/* Main tabs */}
      <div className="flex gap-0 border-b border-header-line mb-3">
        {['Machine Type', 'Maintenance'].map(tab => (
          <button key={tab} className={`px-4 py-[7px] border-none bg-transparent cursor-pointer text-[13px] font-inherit -mb-px ${tab === 'Machine Type' ? 'font-semibold text-accent border-b-2 border-b-accent' : 'font-normal text-t-light border-b-2 border-b-transparent'}`}>{tab}</button>
        ))}
      </div>

      {/* Body */}
      <div className="flex gap-0 h-[calc(100vh-260px)] min-h-[400px]">
        {/* Left: machine type list */}
        <div className="w-[220px] shrink-0 bg-card rounded-l-lg border border-header-line flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-table-line shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-t-lighter" />
              <input placeholder="Search" value={searchType} onChange={e => setSearchType(e.target.value)}
                className="w-full h-[30px] pl-[26px] pr-2 text-xs font-inherit text-t-secondary bg-table-head border border-header-line rounded-[5px] outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTypes.map(t => (
              <div key={t.id} onClick={() => { setSelectedId(t.id); setSelectedOp(null) }}
                className={`px-3.5 py-2.5 cursor-pointer border-b border-table-line flex justify-between items-center ${selectedId === t.id ? 'bg-accent/5' : 'bg-card hover:bg-card-alt'}`}>
                <div>
                  <p className={`m-0 mb-0.5 text-[13px] ${selectedId === t.id ? 'font-semibold text-accent' : 'font-medium text-t-secondary'}`}>{t.name}</p>
                  <p className={`m-0 text-[11px] ${selectedId === t.id ? 'text-accent' : 'text-t-lighter'}`}>{t.category}</p>
                </div>
                <span className={`text-xs font-semibold rounded-[10px] px-2 py-px ${selectedId === t.id ? 'text-accent bg-accent/10' : 'text-t-lighter bg-card-alt'}`}>{t.machines}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 min-w-0 border border-header-line border-l-0 rounded-r-lg bg-card flex flex-col overflow-hidden">
          {/* Type header */}
          <div className="px-4 py-3.5 border-b border-table-line shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex gap-2.5 items-start">
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0 mt-0.5">FL-2T</span>
                <div>
                  <p className="m-0 mb-0.5 text-sm font-bold text-t-primary">{selected.name}</p>
                  <p className="m-0 text-xs text-t-lighter">{selected.description}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="h-[30px] px-3 flex items-center gap-1 bg-card border border-input-line rounded-[5px] cursor-pointer text-xs text-t-body font-inherit"><Pencil size={12} /> Edit</button>
                <button className="h-[30px] px-3 flex items-center gap-1 bg-card border border-[#FEB2B2] rounded-[5px] cursor-pointer text-xs text-red-500 font-inherit"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-4 mt-3.5 border border-header-line rounded-md overflow-hidden">
              {[{ label: 'Machines', value: selected.machines }, { label: 'Active', value: selected.active }, { label: 'In Maintenance', value: selected.maintenance || '--' }, { label: 'Operations', value: selected.operations }].map((s, i) => (
                <div key={s.label} className={`px-5 py-2.5 text-center ${i < 3 ? 'border-r border-header-line' : ''}`}>
                  <p className="m-0 mb-0.5 text-[11px] text-t-lighter whitespace-nowrap">{s.label}</p>
                  <p className="m-0 text-lg font-bold text-t-primary">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 border-b border-table-line shrink-0">
              <div className="flex gap-0">
                {(['Machine Specification', 'Operation Master'] as const).map(tab => (
                  <button key={tab} onClick={() => { setSubTab(tab); setSelectedOp(null) }}
                    className={`px-3.5 py-2.5 border-none bg-transparent cursor-pointer text-[12.5px] font-inherit whitespace-nowrap -mb-px
                      ${subTab === tab ? 'font-semibold text-accent border-b-2 border-b-accent' : 'font-normal text-t-light border-b-2 border-b-transparent'}`}>
                    {tab} <span className="text-[11px] text-t-lighter ml-1">{tab === 'Machine Specification' ? selected.specs.length : selected.ops.length}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => subTab === 'Operation Master' ? setShowAddOp(true) : undefined}
                className="h-7 px-3 flex items-center gap-1 bg-accent hover:bg-accent-hover border-none rounded-[5px] cursor-pointer text-xs text-white font-semibold font-inherit">
                <Plus size={12} /> Add New
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 overflow-y-auto">
                {subTab === 'Machine Specification' ? (
                  selected.specs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-t-lighter text-[13px]">No machines registered for this type yet</div>
                  ) : (
                    <table className="w-full border-collapse text-[12.5px]">
                      <thead>
                        <tr className="bg-table-head">
                          {['M. No \u2191', 'Brand', 'Model', 'Line \u2191', 'Condition \u2191', 'Next Maint. \u2191', 'Status', ''].map((h, i) => (
                            <th key={i} className="px-3.5 py-[9px] text-left font-semibold text-[11.5px] text-t-light border-b border-header-line whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.specs.map((spec, i) => (
                          <tr key={spec.id} className={`border-b border-table-line ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}>
                            <td className="px-3.5 py-2.5 text-accent font-semibold">{spec.id}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{spec.brand}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{spec.model}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{spec.line}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{spec.condition}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{spec.nextMaint}</td>
                            <td className="px-3.5 py-2.5"><Badge variant={spec.status === 'Active' ? 'success' : 'error'}>{spec.status}</Badge></td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex gap-1">
                                <button onClick={() => setShowQR(spec)} className="bg-transparent border-none cursor-pointer p-1 text-t-lighter flex hover:text-t-light" title="QR Code"><QrCode size={13} /></button>
                                <button className="bg-transparent border-none cursor-pointer p-1 text-accent flex hover:text-accent-hover" title="View"><ArrowRight size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : (
                  selected.ops.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-t-lighter text-[13px]">No operations for this type yet</div>
                  ) : (
                    <table className="w-full border-collapse text-[12.5px]">
                      <thead>
                        <tr className="bg-table-head">
                          {['Code', 'M-Type', 'Operation Name', 'SAM', 'Defects', ''].map((h, i) => (
                            <th key={i} className="px-3.5 py-[9px] text-left font-semibold text-[11.5px] text-t-light border-b border-header-line whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.ops.map((op, i) => (
                          <tr key={op.code} onClick={() => setSelectedOp(op)}
                            className={`border-b border-table-line cursor-pointer ${selectedOp?.code === op.code ? 'bg-accent/[0.04]' : i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}>
                            <td className="px-3.5 py-2.5 font-mono text-xs text-t-body">{op.code}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{op.mType}</td>
                            <td className="px-3.5 py-2.5 text-t-secondary font-medium">{op.name}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{op.sam}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{op.defects}</td>
                            <td className="px-3.5 py-2.5"><button className="bg-transparent border-none cursor-pointer p-1 text-accent flex"><ArrowRight size={13} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
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
