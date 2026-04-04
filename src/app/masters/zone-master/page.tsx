'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/services/api'
import Toast, { type ToastData } from '@/components/ui/Toast'

// ── Types ────────────────────────────────────────────
interface CompanyOption { id: number; company_name: string }
interface BranchOption { id: number; company_id: number; branch_name: string }

interface Zone {
  id: number
  company_id: number
  branch_id: number
  zone_name: string
  zone_code: string
  status: number
  is_active: number
  company?: { id: number; company_name: string; company_code: string }
  branch?: { id: number; branch_name: string; branch_code: string }
}

// ── Add / Edit Modal ─────────────────────────────────
interface ZoneModalProps {
  zone: Zone | null
  companies: CompanyOption[]
  allBranches: BranchOption[]
  onClose: () => void
  onSaved: (msg: string) => void
}

function ZoneModal({ zone, companies, allBranches, onClose, onSaved }: ZoneModalProps) {
  const isEdit = !!zone
  const [form, setForm] = useState({
    company_id: zone?.company_id?.toString() ?? '',
    branch_id: zone?.branch_id?.toString() ?? '',
    zone_name: zone?.zone_name ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  // Filter branches by selected company
  const filteredBranches = allBranches.filter(b => b.company_id === parseInt(form.company_id))

  // Reset branch when company changes
  const handleCompanyChange = (val: string) => {
    setForm(f => ({ ...f, company_id: val, branch_id: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        zone_name: form.zone_name,
        company_id: form.company_id,
        branch_id: form.branch_id,
      }
      if (isEdit) {
        payload.id = zone.id
        const res = await api.post('/zone/update', payload)
        onSaved(res.data?.message || 'Zone updated successfully')
      } else {
        const res = await api.post('/zone/create', payload)
        onSaved(res.data?.message || 'Zone created successfully')
      }
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Failed to save zone')
    } finally {
      setSaving(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 34, padding: '0 10px', fontSize: 12.5,
    fontFamily: 'inherit', color: '#2D3748', background: '#fff',
    border: '1px solid #CBD5E0', borderRadius: 5, outline: 'none', boxSizing: 'border-box',
  }
  const sel: React.CSSProperties = { ...inp, cursor: 'pointer' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A5568', marginBottom: 4 }

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
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C' }}>{isEdit ? 'Edit Zone' : 'Add Zone'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4, display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {error && (
            <div style={{ marginBottom: 12, padding: '8px 12px', backgroundColor: '#FED7D7', border: '1px solid #FEB2B2', borderRadius: 5, fontSize: 12, color: '#9B2C2C' }}>
              {error}
            </div>
          )}
          <form id="zone-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Company</label>
              <select style={sel} value={form.company_id} onChange={e => handleCompanyChange(e.target.value)} required>
                <option value="">Select company</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Branch</label>
              <select style={sel} value={form.branch_id} onChange={e => set('branch_id', e.target.value)} required disabled={!form.company_id}>
                <option value="">{form.company_id ? 'Select branch' : 'Select company first'}</option>
                {filteredBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.branch_name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Zone Name</label>
              <input style={inp} placeholder="Enter zone name" value={form.zone_name} onChange={e => set('zone_name', e.target.value)} required />
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #EDF2F7', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button type="submit" form="zone-form" disabled={saving} style={{ height: 34, padding: '0 18px', background: '#2DB3A0', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : isEdit ? 'Update Zone' : 'Add Zone'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete Confirm Modal ─────────────────────────────
function DeleteConfirmModal({ name, onConfirm, onClose, deleting }: { name: string; onConfirm: () => void; onClose: () => void; deleting: boolean }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 101, backgroundColor: '#fff', borderRadius: 10,
        width: 380, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: '24px 20px',
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#1A202C' }}>Delete Zone</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#718096' }}>
          Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} disabled={deleting} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{ height: 34, padding: '0 18px', background: '#E74C3C', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.7 : 1 }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function ZoneMasterPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [allBranches, setAllBranches] = useState<BranchOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editZone, setEditZone] = useState<Zone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)

  // Fetch companies + branches for dropdowns
  useEffect(() => {
    api.get('/company/companyList').then(res => {
      const data = res.data?.data
      setCompanies(data?.companies ?? data?.rows ?? (Array.isArray(data) ? data : []))
    }).catch(() => {})

    api.get('/branch/branchList').then(res => {
      const data = res.data?.data
      setAllBranches(data?.branches ?? data?.rows ?? (Array.isArray(data) ? data : []))
    }).catch(() => {})
  }, [])

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/zone/zoneList', {
        params: { search, page },
      })
      const resData = res.data
      const nested = resData?.data ?? resData
      const rows: Zone[] = nested?.zones ?? nested?.rows ?? (Array.isArray(nested) ? nested : [])
      const pagination = nested?.pagination
      const count = pagination?.total ?? rows.length
      const pages = pagination?.total_pages ?? 1

      setZones(rows)
      setTotalCount(count)
      setTotalPages(pages)
    } catch (err) {
      console.error('Zone list error:', err)
      setZones([])
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await api.post('/zone/delete', { id: deleteTarget.id })
      setToast({ message: res.data?.message || 'Zone deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchZones()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setToast({ message: axiosErr.response?.data?.message || 'Failed to delete zone', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaved = (msg: string) => {
    setToast({ message: msg, type: 'success' })
    fetchZones()
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showModal && (
        <ZoneModal
          zone={editZone}
          companies={companies}
          allBranches={allBranches}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.zone_name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Zone Master</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Zone Master</h1>
        <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Manage production zones within company branches.</p>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #EDF2F7', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>All Zones</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#A0AEC0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
              <input placeholder="Search" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{ height: 32, paddingLeft: 28, paddingRight: 10, fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', width: 160 }} />
            </div>
            <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
              <Download size={13} /> Export
            </button>
            <button onClick={() => { setEditZone(null); setShowModal(true) }}
              style={{ height: 32, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5, background: '#2DB3A0', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#fff', fontWeight: 600, fontFamily: 'inherit' }}>
              <Plus size={13} /> Add Zone
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                {['#', 'Zone Name', 'Zone Code', 'Company Name', 'Company Code', 'Branch Name', 'Branch Code', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>Loading...</td></tr>
              ) : zones.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No zones found</td></tr>
              ) : (
                zones.map((zone, i) => (
                  <tr key={zone.id} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                    <td style={{ padding: '11px 14px', color: '#A0AEC0', fontSize: 12 }}>{(page - 1) * 30 + i + 1}</td>
                    <td style={{ padding: '11px 14px', color: '#2DB3A0', fontWeight: 600 }}>{zone.zone_name}</td>
                    <td style={{ padding: '11px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{zone.zone_code}</td>
                    <td style={{ padding: '11px 14px', color: '#4A5568' }}>{zone.company?.company_name ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{zone.company?.company_code ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#4A5568' }}>{zone.branch?.branch_name ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#4A5568', fontFamily: 'monospace', fontSize: 12 }}>{zone.branch?.branch_code ?? '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => { setEditZone(zone); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A0AEC0', display: 'flex' }} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(zone)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#FC8181', display: 'flex' }} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>{totalCount} zone{totalCount !== 1 ? 's' : ''} found</span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, cursor: page <= 1 ? 'not-allowed' : 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', color: page <= 1 ? '#CBD5E0' : '#718096' }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 12, color: '#4A5568', minWidth: 60, textAlign: 'center' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, cursor: page >= totalPages ? 'not-allowed' : 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', color: page >= totalPages ? '#CBD5E0' : '#718096' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
