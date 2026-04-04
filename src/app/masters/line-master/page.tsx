'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, Plus, X, MoreVertical } from 'lucide-react'

interface LineSlot { start: string; end: string }
interface LineEntry {
  id: number
  zone: string
  line: string
  slots: LineSlot[] // 5 slots
}

const DEFAULT_SLOT: LineSlot = { start: '9:00 AM', end: '5:00 PM' }

const initialLines: LineEntry[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  zone: 'Zone-1',
  line: 'Line-1',
  slots: Array(5).fill(DEFAULT_SLOT),
}))

// ── Add Line Modal ─────────────────────────────────────
function AddLineModal({ onClose, onSave }: { onClose: () => void; onSave: (entry: Omit<LineEntry, 'id'>) => void }) {
  const [zone, setZone] = useState('')
  const [lineNo, setLineNo] = useState('')
  const [auditStart, setAuditStart] = useState('')
  const [slots, setSlots] = useState([
    { start: '', end: '' },
    { start: '', end: '' },
    { start: '', end: '' },
  ])

  const setSlot = (i: number, key: 'start' | 'end', val: string) => {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  }

  const inp: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A5568', marginBottom: 4 }
  const sel: React.CSSProperties = { ...inp, cursor: 'pointer' }
  const sec: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.07em', margin: '14px 0 8px' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, backgroundColor: '#fff', borderRadius: 10, width: 460, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EDF2F7', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C' }}>Add Line</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4, display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* Zone + Line No */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
            <div>
              <label style={lbl}>Zone</label>
              <select style={sel} value={zone} onChange={e => setZone(e.target.value)}>
                <option value="">Select zone</option>
                <option>Zone-1</option><option>Zone-2</option><option>Zone-3</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Line No</label>
              <select style={sel} value={lineNo} onChange={e => setLineNo(e.target.value)}>
                <option value="">Line 10</option>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1}>Line-{i + 1}</option>)}
              </select>
            </div>
          </div>

          {/* Audit start */}
          <p style={sec}>AUDIT START TIMINGS</p>
          <div style={{ marginBottom: 4 }}>
            <label style={lbl}>Audit Start</label>
            <input type="time" style={inp} value={auditStart} onChange={e => setAuditStart(e.target.value)} />
          </div>

          {/* Slots */}
          {slots.map((slot, i) => (
            <div key={i}>
              <p style={sec}>SLOT {i + 1} | START TIME & END TIME</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>Start Time</label>
                  <input type="time" style={inp} value={slot.start} onChange={e => setSlot(i, 'start', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>End Time</label>
                  <input type="time" style={inp} value={slot.end} onChange={e => setSlot(i, 'end', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #EDF2F7', flexShrink: 0 }}>
          <button onClick={onClose} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button
            onClick={() => {
              onSave({
                zone: zone || 'Zone-1',
                line: lineNo || 'Line-1',
                slots: Array(5).fill({ start: slots[0].start || '9:00 AM', end: slots[0].end || '5:00 PM' }),
              })
              onClose()
            }}
            style={{ height: 34, padding: '0 18px', background: '#2DB3A0', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Add Line
          </button>
        </div>
      </div>
    </>
  )
}

export default function LineMasterPage() {
  const [lines, setLines] = useState<LineEntry[]>(initialLines)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = lines.filter(l =>
    l.zone.toLowerCase().includes(search.toLowerCase()) ||
    l.line.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (entry: Omit<LineEntry, 'id'>) => {
    setLines(prev => [...prev, { ...entry, id: prev.length + 1 }])
  }

  const slotCell = (slot: LineSlot): React.CSSProperties => ({
    padding: '6px 10px',
    fontSize: 11,
    color: '#4A5568',
    whiteSpace: 'nowrap',
    lineHeight: 1.6,
  })

  return (
    <AppLayout>
      {showModal && <AddLineModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>›</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Line Master</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Line Master</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Production-line definitions with capacity and supervisor assignment.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#A0AEC0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
            <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} style={{ height: 32, paddingLeft: 28, paddingRight: 10, fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', width: 160 }} />
          </div>
          <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
            <Download size={13} /> Export
          </button>
          <button onClick={() => setShowModal(true)} style={{ height: 32, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5, background: '#2DB3A0', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#fff', fontWeight: 600, fontFamily: 'inherit' }}>
            <Plus size={13} /> Add Line
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>Zone ↑</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>Line ↑</th>
                {[1, 2, 3, 4, 5].map(n => (
                  <th key={n} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>
                    Slot-{n}
                    <div style={{ fontSize: 10, color: '#CBD5E0', fontWeight: 400 }}>Start/End Time</div>
                  </th>
                ))}
                <th style={{ padding: '10px 14px', borderBottom: '1px solid #E2E8F0', width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((line, i) => (
                <tr key={line.id} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                  <td style={{ padding: '8px 14px', color: '#4A5568', fontWeight: 500 }}>{line.zone}</td>
                  <td style={{ padding: '8px 14px', color: '#4A5568', fontWeight: 500 }}>{line.line}</td>
                  {line.slots.map((slot, si) => (
                    <td key={si} style={slotCell(slot)}>
                      <div style={{ color: '#718096', fontSize: 10 }}>S: {slot.start}</div>
                      <div style={{ color: '#718096', fontSize: 10 }}>E: {slot.end}</div>
                    </td>
                  ))}
                  <td style={{ padding: '8px 10px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A0AEC0', display: 'flex' }}><MoreVertical size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #EDF2F7' }}>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>{filtered.length} line{filtered.length !== 1 ? 's' : ''} found</span>
        </div>
      </div>
    </AppLayout>
  )
}
