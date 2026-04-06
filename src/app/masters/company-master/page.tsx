'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Search, Download, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/services/api'
import Toast, { type ToastData } from '@/components/ui/Toast'

// ── Types ────────────────────────────────────────────
interface Company {
  uuid: string
  company_name: string
  address: string
  location: { lat: number; lng: number }
  company_type: string
  max_slot: number
}

// ── Add / Edit Modal ─────────────────────────────────
interface CompanyModalProps {
  company: Company | null
  onClose: () => void
  onSaved: (msg: string) => void
}

function CompanyModal({ company, onClose, onSaved }: CompanyModalProps) {
  const isEdit = !!company
  const [form, setForm] = useState({
    company_name: company?.company_name ?? '',
    address: company?.address ?? '',
    lat: company?.location?.lat?.toString() ?? '',
    lng: company?.location?.lng?.toString() ?? '',
    company_type: company?.company_type ?? '',
    max_slot: company?.max_slot?.toString() ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        company_name: form.company_name,
        address: form.address,
        location: {
          lat: parseFloat(form.lat) || 0,
          lng: parseFloat(form.lng) || 0,
        },
        company_type: form.company_type,
        max_slot: parseInt(form.max_slot) || 1,
      }
      if (isEdit) {
        payload.uuid = company.uuid
        const res = await api.post('/company/update', payload)
        onSaved(res.data?.message || 'Company updated successfully')
      } else {
        const res = await api.post('/company/create', payload)
        onSaved(res.data?.message || 'Company created successfully')
      }
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Failed to save company')
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
  const r2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }

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
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C' }}>{isEdit ? 'Edit Company' : 'Add Company'}</h2>
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
          <form id="company-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Company Name</label>
              <input style={inp} placeholder="TLS Manufacturing" value={form.company_name} onChange={e => set('company_name', e.target.value)} required />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Address</label>
              <input style={inp} placeholder="Enter address" value={form.address} onChange={e => set('address', e.target.value)} required />
            </div>
            <div style={{ ...r2, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Latitude</label>
                <input style={inp} placeholder="12.9675" type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Longitude</label>
                <input style={inp} placeholder="80.1491" type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} />
              </div>
            </div>
            <div style={{ ...r2, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Company Type</label>
                <select style={sel} value={form.company_type} onChange={e => set('company_type', e.target.value)} required>
                  <option value="">Select type</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Service">Service</option>
                  <option value="Trading">Trading</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Max Slot</label>
                <input style={inp} placeholder="3" type="number" min="1" value={form.max_slot} onChange={e => set('max_slot', e.target.value)} required />
              </div>
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #EDF2F7', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button type="submit" form="company-form" disabled={saving} style={{ height: 34, padding: '0 18px', background: '#2DB3A0', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : isEdit ? 'Update Company' : 'Add Company'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete Confirm Modal ─────────────────────────────
function DeleteConfirmModal({ companyName, onConfirm, onClose, deleting }: { companyName: string; onConfirm: () => void; onClose: () => void; deleting: boolean }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 101, backgroundColor: '#fff', borderRadius: 10,
        width: 380, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: '24px 20px',
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#1A202C' }}>Delete Company</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#718096' }}>
          Are you sure you want to delete <strong>{companyName}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} disabled={deleting} style={{ height: 34, padding: '0 18px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, fontSize: 13, color: '#4A5568', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting} style={{ height: 34, padding: '0 18px', background: '#E74C3C', border: 'none', borderRadius: 5, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.7 : 1 }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function CompanyMasterPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)

  // Toast
  const [toast, setToast] = useState<ToastData | null>(null)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/company/companyList', {
        params: { search, company_name: '', page },
      })

      // Handle various response shapes
      const resData = res.data
      console.log('Company list response:', resData)

      const nested = resData?.data ?? resData
      const rows: Company[] = nested?.companies ?? nested?.rows ?? (Array.isArray(nested) ? nested : [])
      const count = nested?.count ?? rows.length
      const pages = nested?.totalPages ?? 1

      setCompanies(rows)
      setTotalCount(count)
      setTotalPages(pages)
    } catch (err) {
      console.error('Company list error:', err)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await api.post('/company/delete', { uuid: deleteTarget.uuid })
      setToast({ message: res.data?.message || 'Company deleted successfully', type: 'success' })
      setDeleteTarget(null)
      fetchCompanies()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setToast({ message: axiosErr.response?.data?.message || 'Failed to delete company', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaved = (msg: string) => {
    setToast({ message: msg, type: 'success' })
    fetchCompanies()
  }

  const openEdit = (company: Company) => {
    setEditCompany(company)
    setShowModal(true)
  }

  const openAdd = () => {
    setEditCompany(null)
    setShowModal(true)
  }

  return (
    <AppLayout>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modals */}
      {showModal && (
        <CompanyModal
          company={editCompany}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          companyName={deleteTarget.company_name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#A0AEC0' }}>Master</span>
        <span style={{ fontSize: 12, color: '#A0AEC0', margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ fontSize: 12, color: '#2D3748', fontWeight: 500 }}>Company Master</span>
      </div>

      {/* Page header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 700, color: '#1A202C' }}>Company Master</h1>
        <p style={{ margin: 0, fontSize: 12, color: '#A0AEC0' }}>Manage company profiles, locations, types and slot configurations.</p>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #EDF2F7', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>All Companies</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#A0AEC0" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                placeholder="Search"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{ height: 32, paddingLeft: 28, paddingRight: 10, fontSize: 12.5, fontFamily: 'inherit', color: '#2D3748', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 5, outline: 'none', width: 160 }}
              />
            </div>
            <button style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #CBD5E0', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#4A5568', fontFamily: 'inherit' }}>
              <Download size={13} /> Export
            </button>
            <button
              onClick={openAdd}
              style={{ height: 32, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5, background: '#2DB3A0', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12.5, color: '#fff', fontWeight: 600, fontFamily: 'inherit' }}
            >
              <Plus size={13} /> Add Company
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ backgroundColor: '#F7FAFC' }}>
                {['#', 'Company Name', 'Address', 'Type', 'Max Slot', 'Location', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11.5, color: '#718096', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>Loading...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No companies found</td></tr>
              ) : (
                companies.map((company, i) => (
                  <tr key={company.uuid} style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                    <td style={{ padding: '11px 14px', color: '#A0AEC0', fontSize: 12 }}>{(page - 1) * 10 + i + 1}</td>
                    <td style={{ padding: '11px 14px', color: '#2DB3A0', fontWeight: 600 }}>{company.company_name}</td>
                    <td style={{ padding: '11px 14px', color: '#4A5568' }}>{company.address}</td>
                    <td style={{ padding: '11px 14px', color: '#4A5568' }}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, backgroundColor: '#EBF8FF', color: '#2B6CB0' }}>
                        {company.company_type}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#4A5568', fontWeight: 600 }}>{company.max_slot}</td>
                    <td style={{ padding: '11px 14px', color: '#718096', fontSize: 11 }}>
                      {company.location?.lat}, {company.location?.lng}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => openEdit(company)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#A0AEC0', display: 'flex' }} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(company)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#FC8181', display: 'flex' }} title="Delete">
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

        {/* Footer with pagination */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>
            {totalCount} compan{totalCount !== 1 ? 'ies' : 'y'} found
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, cursor: page <= 1 ? 'not-allowed' : 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', color: page <= 1 ? '#CBD5E0' : '#718096' }}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 12, color: '#4A5568', minWidth: 60, textAlign: 'center' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 4, cursor: page >= totalPages ? 'not-allowed' : 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', color: page >= totalPages ? '#CBD5E0' : '#718096' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
