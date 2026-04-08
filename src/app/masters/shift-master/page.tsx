'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'
import Toolbar from '@/components/ui/Toolbar'
import Modal from '@/components/ui/Modal'
import FormInput from '@/components/ui/FormInput'
import FormSelect from '@/components/ui/FormSelect'
import Badge from '@/components/ui/Badge'

type ShiftStatus = 'Active' | 'Archive'
type CalendarView = 'Day' | 'Week' | 'Month'

interface Shift { id: number; name: string; type: string; factory: string; start: string; end: string; hrs: string; break: string; buffer: string; status: ShiftStatus }
interface CalendarEvent { id: number; date: string; label: string; note: string; type: string; hours: string; buffer: string }

const initialShifts: Shift[] = [
  { id: 1, name: 'Shift A', type: 'Morning', factory: 'Factory-1 Zone-1', start: '08:00 AM', end: '02:00 PM', hrs: '6h', break: '30m', buffer: '30m', status: 'Active' },
  { id: 2, name: 'Shift B', type: 'Afternoon', factory: 'Factory-1 Zone-2', start: '08:00 AM', end: '02:00 PM', hrs: '8h', break: '30m', buffer: '10m', status: 'Active' },
  { id: 3, name: 'Shift C', type: 'Night', factory: 'Factory-1 Zone-1+2', start: '10:00 PM', end: '06:00 AM', hrs: '8h', break: '30m', buffer: '10m', status: 'Archive' },
]
const calendarEvents: CalendarEvent[] = [
  { id: 1, date: '03-17/2026', label: 'St. Patrick Day', note: 'Half day celebration — targets ×0.625', type: 'Celebration', hours: '5h', buffer: '30m' },
]
const TIME_SLOTS = ['08 AM','09 AM','10 AM','11 AM','12 PM','01 PM','02 PM','03 PM','04 PM','05 PM']
const DAY_SHORT = ['SUN','MON','TUE','WED','THU','FRI','SAT']

function getWeekDates(base: Date): Date[] {
  const day = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d })
}
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

// ── Add Shift Modal ──
function AddShiftModal({ onClose, onSave }: { onClose: () => void; onSave: (s: Omit<Shift, 'id'>) => void }) {
  const [form, setForm] = useState({ name: '', type: '', factory: '', zone: '', startTime: '', endTime: '', bufferLogin: '', bufferLogout: '', lunchStart: '', lunchEnd: '', morningBreak: '', eveningBreak: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name: form.name || 'New Shift', type: form.type || 'Morning', factory: `${form.factory || 'Factory-1'}${form.zone ? ' ' + form.zone : ''}`, start: form.startTime || '08:00 AM', end: form.endTime || '05:00 PM', hrs: '8h', break: form.morningBreak || '30m', buffer: form.bufferLogin || '10m', status: 'Active' })
    onClose()
  }

  return (
    <Modal title="Add Shift" onClose={onClose} size="md" footer={
      <>
        <button type="button" onClick={onClose} className="h-[34px] px-[18px] bg-card border border-input-line rounded-[5px] text-[13px] text-t-body cursor-pointer font-inherit">Cancel</button>
        <button type="submit" form="add-shift-form" className="h-[34px] px-[18px] bg-accent hover:bg-accent-hover border-none rounded-[5px] text-[13px] text-white font-semibold cursor-pointer font-inherit">Add Shift</button>
      </>
    }>
      <form id="add-shift-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormInput label="Shift Name" placeholder="Shift A" value={form.name} onChange={e => set('name', e.target.value)} />
        <FormSelect label="Type" value={form.type} onChange={e => set('type', e.target.value)} options={[{value:'Morning',label:'Morning'},{value:'Afternoon',label:'Afternoon'},{value:'Night',label:'Night'}]} placeholder="Select type" />
        <div className="grid grid-cols-2 gap-2.5">
          <FormSelect label="Factory" value={form.factory} onChange={e => set('factory', e.target.value)} options={[{value:'Factory-1',label:'Factory-1'},{value:'Factory-2',label:'Factory-2'}]} placeholder="Factory 1" />
          <FormSelect label="Zone" value={form.zone} onChange={e => set('zone', e.target.value)} options={[{value:'Zone-1',label:'Zone-1'},{value:'Zone-2',label:'Zone-2'},{value:'Zone-1+2',label:'Zone-1+2'}]} placeholder="Zone" />
        </div>
        <p className="text-[11px] font-bold text-t-lighter tracking-wider mt-1 mb-0">SHIFT WINDOW</p>
        <div className="grid grid-cols-2 gap-2.5">
          <FormInput label="Start time" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
          <FormInput label="End time" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <FormInput label="Buffer login" placeholder="00:00" value={form.bufferLogin} onChange={e => set('bufferLogin', e.target.value)} />
          <FormInput label="Buffer logout" placeholder="00:00" value={form.bufferLogout} onChange={e => set('bufferLogout', e.target.value)} />
        </div>
        <p className="text-[11px] font-bold text-t-lighter tracking-wider mt-1 mb-0">LUNCH BREAK</p>
        <div className="grid grid-cols-2 gap-2.5">
          <FormInput label="Lunch start" type="time" value={form.lunchStart} onChange={e => set('lunchStart', e.target.value)} />
          <FormInput label="Lunch end" type="time" value={form.lunchEnd} onChange={e => set('lunchEnd', e.target.value)} />
        </div>
        <p className="text-[11px] font-bold text-t-lighter tracking-wider mt-1 mb-0">SHORT BREAKS</p>
        <div className="grid grid-cols-2 gap-2.5">
          <FormInput label="Morning break" placeholder="00:00" value={form.morningBreak} onChange={e => set('morningBreak', e.target.value)} />
          <FormInput label="Evening break" placeholder="00:00" value={form.eveningBreak} onChange={e => set('eveningBreak', e.target.value)} />
        </div>
        <p className="text-[11px] font-bold text-t-lighter tracking-wider mt-1 mb-0">WORKING TIME SUMMARY</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ label: '8h', sub: 'Total' }, { label: '60m', sub: 'Break' }, { label: '7h 30m', sub: 'Net work' }].map(b => (
            <div key={b.sub} className="text-center py-2.5 bg-table-head rounded-md border border-table-line">
              <p className="m-0 text-[15px] font-bold text-t-primary">{b.label}</p>
              <p className="m-0 text-[10px] text-t-lighter mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>
      </form>
    </Modal>
  )
}

// ── Calendar View ──
function CalendarView() {
  const today = new Date()
  const [weekBase, setWeekBase] = useState(new Date())
  const [calView, setCalView] = useState<CalendarView>('Week')
  const weekDates = getWeekDates(weekBase)
  const monthLabel = weekDates[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-table-line">
        <div className="flex items-center gap-2.5">
          <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d) }} className="bg-transparent border-none cursor-pointer p-1 text-t-light flex items-center"><ChevronLeft size={18} /></button>
          <span className="text-[15px] font-bold text-t-primary min-w-[160px] text-center">{monthLabel}</span>
          <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d) }} className="bg-transparent border-none cursor-pointer p-1 text-t-light flex items-center"><ChevronRight size={18} /></button>
        </div>
        <div className="flex gap-0.5 bg-table-head rounded-md p-0.5 border border-header-line">
          {(['Day', 'Week', 'Month'] as CalendarView[]).map(v => (
            <button key={v} onClick={() => setCalView(v)} className={`px-3.5 py-1 border-none rounded cursor-pointer text-[12.5px] font-inherit transition-all ${calView === v ? 'bg-accent text-white font-semibold' : 'bg-transparent text-t-light font-normal'}`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Week grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-header-line">
            <div className="border-r border-header-line" />
            {weekDates.map((date, i) => {
              const isToday = sameDay(date, today)
              return (
                <div key={i} className={`py-2.5 text-center ${i < 6 ? 'border-r border-header-line' : ''} ${isToday ? 'bg-indigo-500/5' : ''}`}>
                  <div className="text-[10px] font-semibold text-t-lighter tracking-wider mb-1">{DAY_SHORT[date.getDay()]}</div>
                  <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center ${isToday ? 'bg-indigo-500' : ''}`}>
                    <span className={`text-[13px] ${isToday ? 'font-bold text-white' : 'font-medium text-t-secondary'}`}>{String(date.getDate()).padStart(2, '0')}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {TIME_SLOTS.map((slot, si) => (
            <div key={slot} className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-table-line min-h-[52px]">
              <div className="pt-2 pr-1.5 text-right text-[10px] text-t-lighter border-r border-header-line shrink-0">{slot}</div>
              {weekDates.map((date, di) => {
                const isToday = sameDay(date, today)
                return <div key={di} className={`min-h-[52px] ${di < 6 ? 'border-r border-table-line' : ''} ${isToday ? 'bg-indigo-500/[0.04]' : si % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`} />
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Events table */}
      <div className="border-t-2 border-header-line">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-table-head">
              {['Date', 'Label / Note', 'Type', 'Hours', 'Buffer', ''].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-semibold text-[11.5px] text-t-light border-b border-header-line whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarEvents.map(ev => (
              <tr key={ev.id} className="border-b border-table-line">
                <td className="px-4 py-3 font-mono text-xs text-t-body">{ev.date}</td>
                <td className="px-4 py-3">
                  <p className="m-0 mb-0.5 text-[12.5px] font-semibold text-t-secondary">{ev.label}</p>
                  <p className="m-0 text-[11.5px] text-t-lighter">{ev.note}</p>
                </td>
                <td className="px-4 py-3 text-t-body">{ev.type}</td>
                <td className="px-4 py-3 text-t-body font-semibold">{ev.hours}</td>
                <td className="px-4 py-3 text-t-body">{ev.buffer}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <button className="bg-transparent border-none cursor-pointer p-1 text-t-lighter flex"><MoreVertical size={14} /></button>
                    <button className="bg-transparent border-none cursor-pointer p-1 text-accent flex"><ArrowRight size={14} /></button>
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

// ── Main Page ──
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
  const handleSave = (shift: Omit<Shift, 'id'>) => setShifts(prev => [...prev, { ...shift, id: prev.length + 1 }])
  const handleDelete = (id: number) => setShifts(prev => prev.filter(s => s.id !== id))

  return (
    <AppLayout>
      {showModal && <AddShiftModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      <Breadcrumb items={[{ label: 'Master' }, { label: 'Shift Master', active: true }]} />
      <PageHeader title="Shift Master" description="Define factory shifts with shift working hours and break times." />

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-table-line gap-2.5 flex-wrap">
          <div className="flex gap-0.5">
            {(['Shift(s)', 'Calendar'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3.5 py-1.5 border-none rounded-[5px] cursor-pointer text-[12.5px] font-inherit ${activeTab === tab ? 'bg-accent/10 font-semibold text-accent border-b-2 border-b-accent' : 'bg-transparent font-normal text-t-light border-b-2 border-b-transparent'}`}>{tab}</button>
            ))}
          </div>
          <Toolbar search={search} onSearchChange={setSearch} onAdd={() => setShowModal(true)} addLabel="Add Shift" />
        </div>

        {activeTab === 'Shift(s)' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-table-head">
                    {['#', 'Shift Name', 'Type', 'Factory', 'Start', 'End', 'Hrs', 'Break', 'Buffer %', 'Status', ''].map((h, i) => (
                      <th key={i} className="px-3.5 py-2.5 text-left font-semibold text-[11.5px] text-t-light border-b border-header-line whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} className="p-8 text-center text-t-lighter text-[13px]">No shifts found</td></tr>
                  ) : filtered.map((shift, i) => (
                    <tr key={shift.id} className={`border-b border-table-line ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}>
                      <td className="px-3.5 py-[11px] text-t-lighter text-xs">{shift.id}</td>
                      <td className="px-3.5 py-[11px] text-accent font-semibold">{shift.name}</td>
                      <td className="px-3.5 py-[11px] text-t-body">{shift.type}</td>
                      <td className="px-3.5 py-[11px] text-t-body">{shift.factory}</td>
                      <td className="px-3.5 py-[11px] text-t-body">{shift.start}</td>
                      <td className="px-3.5 py-[11px] text-t-body">{shift.end}</td>
                      <td className="px-3.5 py-[11px] text-t-body">{shift.hrs}</td>
                      <td className="px-3.5 py-[11px] text-t-body">{shift.break}</td>
                      <td className="px-3.5 py-[11px] text-t-body">{shift.buffer}</td>
                      <td className="px-3.5 py-[11px]"><Badge variant={shift.status === 'Active' ? 'success' : 'default'}>{shift.status}</Badge></td>
                      <td className="px-3.5 py-[11px]">
                        <div className="flex gap-1.5 items-center">
                          <button className="bg-transparent border-none cursor-pointer p-1 text-t-lighter flex hover:text-accent" title="Edit"><Pencil size={13} /></button>
                          <button onClick={() => handleDelete(shift.id)} className="bg-transparent border-none cursor-pointer p-1 text-[#FC8181] flex hover:text-red-500" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-table-line flex items-center justify-between">
              <span className="text-xs text-t-lighter">{filtered.length} shift{filtered.length !== 1 ? 's' : ''} found</span>
            </div>
          </>
        ) : (
          <CalendarView />
        )}
      </div>
    </AppLayout>
  )
}
