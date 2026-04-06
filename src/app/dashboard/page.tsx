'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { ChevronDown } from 'lucide-react'
import { useWindowSize } from '@/hooks/useWindowSize'

// ── Types ──────────────────────────────────────────────
type StatusType = 'Normal' | 'Problem' | 'Warning' | 'Audit Pending'

const STATUS_COLORS: Record<StatusType, { bg: string; text: string }> = {
  Normal:        { bg: '#C6F6D5', text: '#276749' },
  Problem:       { bg: '#FED7D7', text: '#9B2C2C' },
  Warning:       { bg: '#FEEBC8', text: '#9C4221' },
  'Audit Pending': { bg: '#BEE3F8', text: '#2C5282' },
}

// ── Mock data ─────────────────────────────────────────
const statsCards = [
  {
    label: 'Active Lines',
    value: '20',
    sub: 'Zone 1: 12, Zone 2: 8',
    color: '#2DB3A0',
  },
  {
    label: "Today's Output",
    value: '14,832',
    sub: '+12% vs target',
    subColor: '#38A169',
    color: '#3182CE',
  },
  {
    label: 'Active Defects',
    value: '7',
    sub: '3 Critical, 4 Major',
    subColor: '#E53E3E',
    color: '#E53E3E',
  },
  {
    label: 'TLS Online',
    value: '186 / 200',
    sub: '14 offline',
    subColor: '#DD6B20',
    color: '#805AD5',
  },
  {
    label: 'Rework %',
    value: '6.8%',
    sub: 'Target: < 5%',
    subColor: '#E53E3E',
    color: '#DD6B20',
  },
]

const recentOrders = [
  { id: '#17294', name: 'Polo T-Shirt | Green', status: 'Approved',          output: 4834, target: 68 },
  { id: '#17266', name: 'Legging | Red',        status: 'Approved',          output: 3196, target: 38 },
  { id: '#17353', name: 'Polo T-Shirt | Red',   status: 'Approved',          output: 5887, target: 92 },
  { id: '#17294', name: 'Legging | Pink',        status: 'Awaiting for Review', output: 4834, target: 66 },
  { id: '#17294', name: 'Legging | Pink',        status: 'Approved',          output: 4834, target: 66 },
]

const liveStatusRows = [
  { ws: 'WS-1', tlsId: '100001', operation: 'ARM HOLE PIPING',  status: 'Normal'        as StatusType, defects: 0  },
  { ws: 'WS-2', tlsId: '100002', operation: 'ATTACH ELASTIC',   status: 'Problem'       as StatusType, defects: 4  },
  { ws: 'WS-3', tlsId: '100003', operation: 'BACK PANEL JOIN',  status: 'Warning'       as StatusType, defects: 2  },
  { ws: 'WS-4', tlsId: '100004', operation: 'BACK POCKET HEM',  status: 'Audit Pending' as StatusType, defects: 0  },
  { ws: 'WS-5', tlsId: '100004', operation: 'BACK POCKET HEM',  status: 'Audit Pending' as StatusType, defects: 0  },
  { ws: 'WS-6', tlsId: '100004', operation: 'BACK POCKET HEM',  status: 'Audit Pending' as StatusType, defects: 0  },
  { ws: 'WS-7', tlsId: '100005', operation: 'ATTACH WAISTBAND', status: 'Normal'        as StatusType, defects: 0  },
]

const setupItems = [
  { label: 'Work Assigned',     count: 5  },
  { label: 'Shift Master',      count: 3  },
  { label: 'Machine Type',      count: 7  },
  { label: 'Operation Master',  count: 12 },
  { label: 'Line Master',       count: 20 },
  { label: 'Order Master',      count: 9  },
  { label: 'Style Master',      count: 3  },
  { label: 'Defect Master',     count: 3  },
  { label: 'Employee Master',   count: 3  },
]

const lineTabs = ['Line-1','Line-2','Line-3','Line-4','Line-5','Line-6','Line-7','Line-8','Line-9']
const mainTabs = ['Overview','Recent Orders','Analytics','Multi Factory']

const statusBadgeStyle = (s: StatusType): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 500,
  backgroundColor: STATUS_COLORS[s].bg,
  color: STATUS_COLORS[s].text,
})

const orderStatusColor = (s: string) =>
  s === 'Approved' ? { bg: '#C6F6D5', text: '#276749' } : { bg: '#FEEBC8', text: '#9C4221' }

// ── Component ─────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [activeLine, setActiveLine] = useState('Line-1')
  const width = useWindowSize()

  const isMobile  = width < 768
  const isTablet  = width >= 768 && width < 1024

  // Stats grid: 2 cols mobile, 3 cols tablet, 5 cols desktop
  const statsCols = isMobile ? 2 : isTablet ? 3 : 5

  // Content row: stacked on mobile/tablet, side-by-side on desktop
  const contentStacked = width < 1100

  return (
    <AppLayout>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${statsCols}, 1fr)`,
        gap: 10,
        marginBottom: 14,
      }}>
        {statsCards.map(card => (
          <div key={card.label} style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: isMobile ? '10px 12px' : '12px 14px',
            borderTop: `3px solid ${card.color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#718096', fontWeight: 500 }}>{card.label}</p>
            <p style={{ margin: '0 0 3px', fontSize: isMobile ? 18 : 20, fontWeight: 700, color: '#1A202C' }}>{card.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: card.subColor ?? '#718096' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0', marginBottom: 14, overflowX: 'auto' }}>
        {mainTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: isMobile ? '8px 10px' : '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: isMobile ? 12 : 13,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#2DB3A0' : '#718096',
              borderBottom: activeTab === tab ? '2px solid #2DB3A0' : '2px solid transparent',
              marginBottom: -1,
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Row */}
      <div style={{
        display: 'flex',
        gap: 14,
        flexDirection: contentStacked ? 'column' : 'row',
      }}>

        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Recent Orders */}
          <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#2D3748' }}>Recent Orders</h3>
            <div style={{
              display: 'flex',
              gap: 10,
              overflowX: isMobile ? 'auto' : 'visible',
              paddingBottom: isMobile ? 4 : 0,
            }}>
              {recentOrders.map((o, i) => {
                const sc = orderStatusColor(o.status)
                return (
                  <div key={i} style={{
                    flex: isMobile ? '0 0 160px' : 1,
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    padding: '10px',
                    minWidth: isMobile ? 160 : 0,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#2D3748' }}>{o.id}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 10,
                        backgroundColor: sc.bg, color: sc.text,
                        whiteSpace: 'nowrap',
                      }}>{o.status}</span>
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: 11, color: '#4A5568' }}>{o.name}</p>
                    <div style={{ height: 4, borderRadius: 2, backgroundColor: '#EDF2F7', overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${o.target}%`, backgroundColor: '#2DB3A0', borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: '#718096' }}>Output: {o.output.toLocaleString()}</span>
                      <span style={{ fontSize: 10, color: '#718096' }}>{o.target}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Line Live Status */}
          <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2D3748' }}>Line Live Status</h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 12, color: '#2D3748' }}>Zone-1</span>
                <ChevronDown size={13} color="#718096" />
              </div>
            </div>

            {/* Line tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0', marginBottom: 12, overflowX: 'auto' }}>
              {lineTabs.map(lt => (
                <button
                  key={lt}
                  onClick={() => setActiveLine(lt)}
                  style={{
                    padding: '5px 10px', border: 'none', background: 'none',
                    cursor: 'pointer', fontSize: 12,
                    fontWeight: activeLine === lt ? 600 : 400,
                    color: activeLine === lt ? '#2DB3A0' : '#718096',
                    borderBottom: activeLine === lt ? '2px solid #2DB3A0' : '2px solid transparent',
                    marginBottom: -1, fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lt}
                </button>
              ))}
            </div>

            {/* Table — scrollable on mobile */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: isMobile ? 480 : 'auto' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7FAFC' }}>
                    {['Workstation','TLS ID','Operation','Status','Defects'].map(h => (
                      <th key={h} style={{
                        padding: '7px 10px', textAlign: 'left',
                        color: '#718096', fontWeight: 600, fontSize: 11,
                        borderBottom: '1px solid #E2E8F0',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveStatusRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: '8px 10px', color: '#2D3748', fontWeight: 500 }}>{row.ws}</td>
                      <td style={{ padding: '8px 10px', color: '#4A5568' }}>{row.tlsId}</td>
                      <td style={{ padding: '8px 10px', color: '#4A5568' }}>{row.operation}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={statusBadgeStyle(row.status)}>{row.status}</span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {row.defects > 0
                          ? <span style={{ ...statusBadgeStyle('Problem'), padding: '2px 8px' }}>{row.defects}</span>
                          : <span style={{ color: '#A0AEC0', fontSize: 11 }}>&mdash;</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Colour legend */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 10, borderTop: '1px solid #EDF2F7', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#718096', fontWeight: 600 }}>TLS Colour Reference</span>
              {(Object.entries(STATUS_COLORS) as [StatusType, { bg: string; text: string }][]).map(([label, c]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c.text }} />
                  <span style={{ fontSize: 10, color: '#718096' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Quick Setup */}
        <div style={{ width: contentStacked ? '100%' : 220, flexShrink: 0 }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 8,
            padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#2D3748' }}>
              Quick Setup Progress
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: '#A0AEC0' }}>Machine configuration checklist</p>
            <div style={{
              display: contentStacked ? 'grid' : 'flex',
              gridTemplateColumns: contentStacked ? (isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)') : undefined,
              flexDirection: contentStacked ? undefined : 'column',
              gap: contentStacked ? 0 : 0,
            }}>
              {setupItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0',
                  borderBottom: i < setupItems.length - 1 ? '1px solid #EDF2F7' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: '#4A5568' }}>{item.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: '#2D3748',
                    backgroundColor: '#EDF2F7', borderRadius: 4,
                    padding: '1px 7px', minWidth: 24, textAlign: 'center',
                  }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
