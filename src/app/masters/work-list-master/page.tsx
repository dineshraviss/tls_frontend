'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, SlidersHorizontal, ArrowUp } from 'lucide-react'

type WorkStatus = 'Active' | 'Inactive'

interface WorkEntry {
  id: number
  shiftName: string
  role: string
  empId: string
  title: string
  name: string
  lines: string[]
  status: WorkStatus
}

const workEntries: WorkEntry[] = [
  { id: 1, shiftName: 'Shift A', role: 'Supervisor',  empId: 'SS0426', title: 'SS0426', name: 'Sarit Pak',    lines: ['Line-1','Line-2','Line-3'],           status: 'Active'   },
  { id: 2, shiftName: 'Shift B', role: 'QC',          empId: 'SS0478', title: 'SS0478', name: 'Sabin Vai',    lines: ['Line-1','Line-2','Line-3','Line-4'],  status: 'Active'   },
  { id: 3, shiftName: 'Shift C', role: 'Mechanic',    empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar',   lines: ['Line-1','Line-2'],                    status: 'Active'   },
  { id: 4, shiftName: 'Shift D', role: 'Mechanic',    empId: 'SS0761', title: 'SS0761', name: 'Monitor Lui',  lines: ['Line-1','Line-2','Line-3'],           status: 'Active'   },
  { id: 5, shiftName: 'Shift E', role: 'QC',          empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar',   lines: ['Line-1','Line-2','Line-3'],           status: 'Inactive' },
  { id: 6, shiftName: 'Shift F', role: 'Mechanic',    empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar',   lines: ['Line-1','Line-2','Line-3'],           status: 'Active'   },
  { id: 7, shiftName: 'Shift G', role: 'Technician',  empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar',   lines: ['Line-1','Line-2'],                    status: 'Active'   },
  { id: 8, shiftName: 'Shift H', role: 'Technician',  empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar',   lines: ['Line-1','Line-2'],                    status: 'Active'   },
]

const LINE_COLORS: Record<string, { bg: string; text: string }> = {
  'Line-1': { bg: '#EBF8FF', text: '#2B6CB0' },
  'Line-2': { bg: '#F0FFF4', text: '#276749' },
  'Line-3': { bg: '#FFF5F5', text: '#9B2C2C' },
  'Line-4': { bg: '#FFFFF0', text: '#7B6F00' },
}

const lineChipColor = (line: string) =>
  LINE_COLORS[line] ?? { bg: '#EDF2F7', text: '#4A5568' }

export default function WorkListMasterPage() {
  const [activeTab, setActiveTab] = useState<'Today' | 'This Week'>('Today')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [sortLinesAsc, setSortLinesAsc] = useState(true)

  const filtered = workEntries.filter(w =>
    w.shiftName.toLowerCase().includes(search.toLowerCase()) ||
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.role.toLowerCase().includes(search.toLowerCase()) ||
    w.empId.toLowerCase().includes(search.toLowerCase())
  )

  const allSelected = filtered.length > 0 && filtered.every(w => selected.includes(w.id))

  const toggleAll = () => {
    if (allSelected) setSelected([])
    else setSelected(filtered.map(w => w.id))
  }

  const toggleRow = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const statusStyle = (s: WorkStatus): React.CSSProperties => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
    backgroundColor: s === 'Active' ? '#C6F6D5' : '#EDF2F7',
    color: s === 'Active' ? '#276749' : '#718096',
  })

  const checkboxStyle = (checked: boolean): React.CSSProperties => ({
    width: 14, height: 14, borderRadius: 3,
    border: `1.5px solid ${checked ? '#2DB3A0' : '#CBD5E0'}`,
    backgroundColor: checked ? '#2DB3A0' : '#fff',
    cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  })

  return (
    <AppLayout>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Work List Master</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Work List Master</h1>
        <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Define work types and department assignments for employees.</p>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #EDF2F7', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {(['Today', 'This Week'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 14px', border: 'none', background: activeTab === tab ? '#EBF8F6' : 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? '#2DB3A0' : '#718096', fontFamily: 'inherit' }}>
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
            <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
              <SlidersHorizontal size={13} /> Filter
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                <th style={{ padding: '10px 14px', borderBottom: '1px solid #E2E8F0', width: 40 }}>
                  <div onClick={toggleAll} style={checkboxStyle(allSelected)}>
                    {allSelected && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </th>
                {['Sn.', 'Shift Name', 'Role', 'Emp ID', 'Title', 'Name'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                <th onClick={() => setSortLinesAsc(v => !v)} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Lines
                    <ArrowUp size={12} style={{ transform: sortLinesAsc ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
                  </div>
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No records found</td></tr>
              ) : (
                filtered.map((entry, i) => {
                  const isChecked = selected.includes(entry.id)
                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: isChecked ? 'rgba(45,179,160,0.04)' : i % 2 === 0 ? '#fff' : '#FAFBFC', cursor: 'default' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <div onClick={() => toggleRow(entry.id)} style={checkboxStyle(isChecked)}>
                          {isChecked && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#A0AEC0', fontSize: 12 }}>{entry.id}</td>
                      <td style={{ padding: '11px 14px', color: '#2DB3A0', fontWeight: 600 }}>{entry.shiftName}</td>
                      <td style={{ padding: '11px 14px', color: '#4A5568' }}>{entry.role}</td>
                      <td style={{ padding: '11px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{entry.empId}</td>
                      <td style={{ padding: '11px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{entry.title}</td>
                      <td style={{ padding: '11px 14px', color: '#2D3748', fontWeight: 500 }}>{entry.name}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {entry.lines.map(line => {
                            const c = lineChipColor(line)
                            return (
                              <span key={line} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, backgroundColor: c.bg, color: c.text, whiteSpace: 'nowrap' }}>
                                {line}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={statusStyle(entry.status)}>{entry.status}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid #EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>
            {selected.length > 0
              ? `${selected.length} of ${filtered.length} selected`
              : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </div>
    </AppLayout>
  )
}
