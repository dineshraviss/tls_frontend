'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, MoreVertical, ArrowRight } from 'lucide-react'

// ── Types ────────────────────────────────────────────
type ShiftStatus = 'Active' | 'Archive'
type CalendarView = 'Day' | 'Week' | 'Month'

interface Shift {
  id: number
  name: string
  type: string
  factory: string
  start: string
  end: string
  hrs: string
  break: string
  buffer: string
  status: ShiftStatus
}

interface CalendarEvent {
  id: number
  date: string
  label: string
  note: string
  type: string
  hours: string
  buffer: string
}

// ── Mock data ─────────────────────────────────────────
const initialShifts: Shift[] = [
  { id: 1, name: 'Shift A', type: 'Morning',   factory: 'Factory-1 Zone-1',   start: '08:00 AM', end: '02:00 PM', hrs: '6h', break: '30m', buffer: '30m', status: 'Active'  },
  { id: 2, name: 'Shift B', type: 'Afternoon', factory: 'Factory-1 Zone-2',   start: '08:00 AM', end: '02:00 PM', hrs: '8h', break: '30m', buffer: '10m', status: 'Active'  },
  { id: 3, name: 'Shift C', type: 'Night',     factory: 'Factory-1 Zone-1+2', start: '10:00 PM', end: '06:00 AM', hrs: '8h', break: '30m', buffer: '10m', status: 'Archive' },
]

const calendarEvents: CalendarEvent[] = [
  { id: 1, date: '03-17/2026', label: 'St. Patrick Day', note: 'Half day celebration — targets ×0.625', type: 'Celebration', hours: '5h', buffer: '30m' },
]

const TIME_SLOTS = ['08 AM','09 AM','10 AM','11 AM','12 PM','01 PM','02 PM','03 PM','04 PM','05 PM']
const DAY_SHORT  = ['SUN','MON','TUE','WED','THU','FRI','SAT']

// ── Helpers ───────────────────────────────────────────
function getWeekDates(base: Date): Date[] {
  const day = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

// ── Add Shift Modal ───────────────────────────────────
interface AddShiftModalProps {
  onClose: () => void
  onSave: (shift: Omit<Shift, 'id'>) => void
}

function AddShiftModal({ onClose, onSave }: AddShiftModalProps) {
  const [form, setForm] = useState({
    name: '', type: '', factory: '', zone: '',
    startTime: '', endTime: '', bufferLogin: '', bufferLogout: '',
    lunchStart: '', lunchEnd: '', morningBreak: '', eveningBreak: '',
  })
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: form.name || 'New Shift',
      type: form.type || 'Morning',
      factory: `${form.factory || 'Factory-1'}${form.zone ? ' ' + form.zone : ''}`,
      start: form.startTime || '08:00 AM',
      end: form.endTime || '05:00 PM',
      hrs: '8h', break: form.morningBreak || '30m',
      buffer: form.bufferLogin || '10m',
      status: 'Active',
    })
    onClose()
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 34, padding: '0 10px', fontSize: 12.5,
    fontFamily: 'inherit', color: '#2D3748', background: '#fff',
    border: '1px solid #CBD5E0', borderRadius: 5, outline: 'none', boxSizing: 'border-box',
  }
  const sel: React.CSSProperties = { ...inp, cursor: 'pointer' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A5568', marginBottom: 4 }
  const sec: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.07em', marginBottom: 8, marginTop: 4 }
  const r2:  React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 101, backgroundColor: '#fff', borderRadius: 10,
        width: 480, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)',
        display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #EDF2F7', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C' }}>Add Shift</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4, display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <form id="add-shift-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Shift Name</label>
              <input style={inp} placeholder="Shift A" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Type</label>
              <select style={sel} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="">Select type</option>
                <option>Morning</option><option>Afternoon</option><option>Night</option>
              </select>
            </div>
            <div style={{ ...r2, marginBottom: 14 }}>
              <div><label style={lbl}>Factory</label>
                <select style={sel} value={form.factory} onChange={e => set('factory', e.target.value)}>
                  <option value="">Factory 1</option><option value="Factory-1">Factory-1</option><option value="Factory-2">Factory-2</option>
                </select>
              </div>
              <div><label style={lbl}>Zone</label>
                <select style={sel} value={form.zone} onChange={e => set('zone', e.target.value)}>
                  <option value="">Zone</option><option value="Zone-1">Zone-1</option><option value="Zone-2">Zone-2</option><option value="Zone-1+2">Zone-1+2</option>
                </select>
              </div>
            </div>
            <p style={sec}>SHIFT WINDOW</p>
            <div style={{ ...r2, marginBottom: 10 }}>
              <div><label style={lbl}>Start time</label><input type="time" style={inp} value={form.startTime} onChange={e => set('startTime', e.target.value)} /></div>
              <div><label style={lbl}>End time</label><input type="time" style={inp} value={form.endTime} onChange={e => set('endTime', e.target.value)} /></div>
            </div>
            <div style={{ ...r2, marginBottom: 14 }}>
              <div><label style={lbl}>Buffer login</label><input style={inp} placeholder="00:00" value={form.bufferLogin} onChange={e => set('bufferLogin', e.target.value)} /></div>
              <div><label style={lbl}>Buffer logout</label><input style={inp} placeholder="00:00" value={form.bufferLogout} onChange={e => set('bufferLogout', e.target.value)} /></div>
            </div>
            <p style={sec}>LUNCH BREAK</p>
            <div style={{ ...r2, marginBottom: 14 }}>
              <div><label style={lbl}>Lunch start</label><input type="time" style={inp} value={form.lunchStart} onChange={e => set('lunchStart', e.target.value)} /></div>
              <div><label style={lbl}>Lunch end</label><input type="time" style={inp} value={form.lunchEnd} onChange={e => set('lunchEnd', e.target.value)} /></div>
            </div>
            <p style={sec}>SHORT BREAKS</p>
            <div style={{ ...r2, marginBottom: 16 }}>
              <div><label style={lbl}>Morning break</label><input style={inp} placeholder="00:00" value={form.morningBreak} onChange={e => set('morningBreak', e.target.value)} /></div>
              <div><label style={lbl}>Evening break</label><input style={inp} placeholder="00:00" value={form.eveningBreak} onChange={e => set('eveningBreak', e.target.value)} /></div>
            </div>
            <p style={sec}>WORKING TIME SUMMARY</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[{ label: '8h', sub: 'Total' }, { label: '60m', sub: 'Break' }, { label: '7h 30m', sub: 'Net work' }].map(b => (
                <div key={b.sub} style={{ textAlign: 'center', padding: '10px 0', backgroundColor: '#F7FAFC', borderRadius: 6, border: '1px solid #EDF2F7' }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C' }}>{b.label}</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{b.sub}</p>
                </div>
              ))}
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #EDF2F7', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button type="submit" form="add-shift-form" style={{ height: 34, padding: '0 18px', background: '#2DB3A0', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Add Shift
          </button>
        </div>
      </div>
    </>
  )
}

// ── Calendar View ─────────────────────────────────────
function CalendarView() {
  const today = new Date()
  const [weekBase, setWeekBase] = useState(new Date())
  const [calView, setCalView] = useState<CalendarView>('Week')

  const weekDates = getWeekDates(weekBase)
  const monthLabel = weekDates[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevWeek = () => {
    const d = new Date(weekBase)
    d.setDate(d.getDate() - 7)
    setWeekBase(d)
  }
  const nextWeek = () => {
    const d = new Date(weekBase)
    d.setDate(d.getDate() + 7)
    setWeekBase(d)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #EDF2F7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={prevWeek} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#718096', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A202C', minWidth: 160, textAlign: 'center' }}>
            {monthLabel}
          </span>
          <button onClick={nextWeek} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#718096', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 2, backgroundColor: '#F7FAFC', borderRadius: 6, padding: 3, border: '1px solid #E2E8F0' }}>
          {(['Day', 'Week', 'Month'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => setCalView(v)}
              style={{
                padding: '4px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12.5,
                fontWeight: calView === v ? 600 : 400,
                background: calView === v ? '#2DB3A0' : 'none',
                color: calView === v ? '#fff' : '#718096',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ borderRight: '1px solid #E2E8F0' }} />
            {weekDates.map((date, i) => {
              const isToday = sameDay(date, today)
              return (
                <div key={i} style={{ padding: '10px 0', textAlign: 'center', borderRight: i < 6 ? '1px solid #E2E8F0' : 'none', backgroundColor: isToday ? 'rgba(99,102,241,0.06)' : 'transparent' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#A0AEC0', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {DAY_SHORT[date.getDay()]}
                  </div>
                  <div style={{ width: 28, height: 28, margin: '0 auto', borderRadius: '50%', backgroundColor: isToday ? '#6366F1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? '#fff' : '#2D3748' }}>
                      {String(date.getDate()).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {TIME_SLOTS.map((slot, si) => (
            <div key={slot} style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid #EDF2F7', minHeight: 52 }}>
              <div style={{ padding: '8px 6px 0', textAlign: 'right', fontSize: 10, color: '#A0AEC0', borderRight: '1px solid #E2E8F0', flexShrink: 0 }}>
                {slot}
              </div>
              {weekDates.map((date, di) => {
                const isToday = sameDay(date, today)
                return (
                  <div key={di} style={{ borderRight: di < 6 ? '1px solid #EDF2F7' : 'none', backgroundColor: isToday ? 'rgba(99,102,241,0.04)' : si % 2 === 0 ? '#fff' : '#FAFBFC', minHeight: 52 }} />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '2px solid #E2E8F0', marginTop: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              {['Date', 'Label / Note', 'Type', 'Hours', 'Buffer', ''].map((h, i) => (
                <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarEvents.map(ev => (
              <tr key={ev.id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                <td style={{ padding: '12px 16px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{ev.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 12.5, fontWeight: 600, color: '#2D3748' }}>{ev.label}</p>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#A0AEC0' }}>{ev.note}</p>
                </td>
                <td style={{ padding: '12px 16px', color: '#4A5568' }}>{ev.type}</td>
                <td style={{ padding: '12px 16px', color: '#4A5568', fontWeight: 600 }}>{ev.hours}</td>
                <td style={{ padding: '12px 16px', color: '#4A5568' }}>{ev.buffer}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A0AEC0', display: 'flex' }}>
                      <MoreVertical size={14} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2DB3A0', display: 'flex' }}>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function ShiftMasterPage() {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts)
  const [activeTab, setActiveTab] = useState<'Shift(s)' | 'Calendar'>('Shift(s)')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = shifts.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase()) ||
    s.factory.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (shift: Omit<Shift, 'id'>) => {
    setShifts(prev => [...prev, { ...shift, id: prev.length + 1 }])
  }

  const handleDelete = (id: number) => setShifts(prev => prev.filter(s => s.id !== id))

  const statusStyle = (s: ShiftStatus): React.CSSProperties => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 12,
    fontSize: 11, fontWeight: 500,
    backgroundColor: s === 'Active' ? '#C6F6D5' : '#EDF2F7',
    color: s === 'Active' ? '#276749' : '#718096',
  })

  return (
    <AppLayout>
      {showModal && <AddShiftModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Shift Master</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Shift Master</h1>
        <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Define factory shifts with shift working hours and break times.</p>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #EDF2F7', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {(['Shift(s)', 'Calendar'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 14px', border: 'none', background: activeTab === tab ? '#EBF8F6' : 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? '#2DB3A0' : '#718096', fontFamily: 'inherit', borderBottom: activeTab === tab ? '2px solid #2DB3A0' : '2px solid transparent' }}>
                {tab}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#A0AEC0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
              <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} style={{ height: 32, paddingLeft: 28, paddingRight: 10, fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', width: 160 }} />
            </div>
            <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
              <Download size={13} /> Export
            </button>
            <button onClick={() => setShowModal(true)} style={{ height: 32, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5, background: '#2DB3A0', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#fff', fontWeight: 600, fontFamily: 'inherit' }}>
              <Plus size={13} /> Add Shift
            </button>
          </div>
        </div>

        {activeTab === 'Shift(s)' ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7FAFC' }}>
                    {['#', 'Shift Name', 'Type', 'Factory', 'Start', 'End', 'Hrs', 'Break', 'Buffer %', 'Status', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No shifts found</td></tr>
                  ) : (
                    filtered.map((shift, i) => (
                      <tr key={shift.id} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                        <td style={{ padding: '11px 14px', color: '#A0AEC0', fontSize: 12 }}>{shift.id}</td>
                        <td style={{ padding: '11px 14px', color: '#2DB3A0', fontWeight: 600 }}>{shift.name}</td>
                        <td style={{ padding: '11px 14px', color: '#4A5568' }}>{shift.type}</td>
                        <td style={{ padding: '11px 14px', color: '#4A5568' }}>{shift.factory}</td>
                        <td style={{ padding: '11px 14px', color: '#4A5568' }}>{shift.start}</td>
                        <td style={{ padding: '11px 14px', color: '#4A5568' }}>{shift.end}</td>
                        <td style={{ padding: '11px 14px', color: '#4A5568' }}>{shift.hrs}</td>
                        <td style={{ padding: '11px 14px', color: '#4A5568' }}>{shift.break}</td>
                        <td style={{ padding: '11px 14px', color: '#4A5568' }}>{shift.buffer}</td>
                        <td style={{ padding: '11px 14px' }}><span style={statusStyle(shift.status)}>{shift.status}</span></td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A0AEC0', display: 'flex' }} title="Edit"><Pencil size={13} /></button>
                            <button onClick={() => handleDelete(shift.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#FC8181', display: 'flex' }} title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid #EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#A0AEC0' }}>{filtered.length} shift{filtered.length !== 1 ? 's' : ''} found</span>
            </div>
          </>
        ) : (
          <CalendarView />
        )}
      </div>
    </AppLayout>
  )
}
