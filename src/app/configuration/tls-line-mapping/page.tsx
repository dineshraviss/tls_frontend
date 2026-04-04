'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, MoreVertical } from 'lucide-react'

interface MappingRow {
  id: number
  machineId: string
  mcType: string
  brandModel: string
  seq: number
  machineType: string
  operation: string
  tlsId: string
  status: 'Active' | 'Offline'
}

const rows: MappingRow[] = [
  { id: 1, machineId: 'MC-001', mcType: '2T Flatlock', brandModel: 'Brother 15005', seq: 10, machineType: '2T Flatlock', operation: 'ARM HOLE PIPING',  tlsId: '3010311', status: 'Active'  },
  { id: 2, machineId: 'MC-001', mcType: '2T Flatlock', brandModel: 'Brother 15005', seq: 11, machineType: '2T Flatlock', operation: 'ARM HOLE PIPING',  tlsId: '3010311', status: 'Offline' },
]

export default function TLSLineMappingPage() {
  const [search, setSearch] = useState('')

  const filtered = rows.filter(r =>
    r.machineId.toLowerCase().includes(search.toLowerCase()) ||
    r.operation.toLowerCase().includes(search.toLowerCase()) ||
    r.tlsId.includes(search)
  )

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Configuration</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>TLS & Line Mapping</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>TLS & Line Mapping</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Trace every mapping. TLS ID Device to Line Operation — tracking line visibility.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} color="#A0AEC0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
          <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} style={{ height: 32, paddingLeft: 28, paddingRight: 10, fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', width: 180 }} />
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                {['Machine ID', 'MC Type', 'Brand / Model', 'Seq', 'Machine Type', 'Operation', 'TLS ID', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No mappings found</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                  <td style={{ padding: '11px 14px', color: '#2DB3A0', fontWeight: 600 }}>{row.machineId}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568' }}>{row.mcType}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568' }}>{row.brandModel}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568' }}>{row.seq}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568' }}>{row.machineType}</td>
                  <td style={{ padding: '11px 14px', color: '#2D3748', fontWeight: 500 }}>{row.operation}</td>
                  <td style={{ padding: '11px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{row.tlsId}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, backgroundColor: row.status === 'Active' ? '#C6F6D5' : '#FED7D7', color: row.status === 'Active' ? '#276749' : '#9B2C2C' }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A0AEC0', display: 'flex' }}><MoreVertical size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #EDF2F7' }}>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>{filtered.length} mapping{filtered.length !== 1 ? 's' : ''} found</span>
        </div>
      </div>
    </AppLayout>
  )
}
