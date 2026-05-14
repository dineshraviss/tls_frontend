'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Toast, { type ToastData } from '@/components/ui/Toast'
import { apiCall } from '@/services/apiClient'
import StyleSummaryList from './_components/StyleSummaryList'
import type { StyleSummary } from './_components/types'

export default function StyleSummaryPage() {
  const [records, setRecords] = useState<StyleSummary[]>([])
  const [loading, setLoading]  = useState(true)
  const [search, setSearch]    = useState('')
  const [toast, setToast]      = useState<ToastData | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<{ data?: StyleSummary[] }>(
        '/operationbullatin/stylesummary',
        { method: 'GET', encrypt: false }
      )
      setRecords(res.data ?? [])
    } catch {
      setRecords([])
      setToast({ message: 'Failed to load style summary', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = search
    ? records.filter(r =>
        r.buyer.toLowerCase().includes(search.toLowerCase()) ||
        r.style_no.toLowerCase().includes(search.toLowerCase()) ||
        r.style_name.toLowerCase().includes(search.toLowerCase())
      )
    : records

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-t-primary">Style Summary</h1>
          <p className="text-xs text-t-lighter mt-0.5">
            Auto-generated when Operation Bulletin (OB) is saved — all values are read-only
          </p>
        </div>
        <div className="flex flex-col items-center px-5 py-2.5 border border-header-line rounded-card bg-card min-w-[100px]">
          <span className="text-xl font-bold text-t-primary leading-tight">
            {String(records.length).padStart(2, '0')}
          </span>
          <span className="text-2xs text-t-lighter mt-0.5 whitespace-nowrap">Total Styles</span>
        </div>
      </div>
      <div className="border-b border-header-line mb-0" />

      <StyleSummaryList
        data={filtered}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
      />
    </AppLayout>
  )
}
