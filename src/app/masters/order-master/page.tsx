'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Toast from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { apiCall } from '@/services/apiClient'
import { PER_PAGE } from '@/lib/constants'
import type { ToastData } from '@/components/ui/Toast'
import type { Order, LinkOrder } from './_components/types'
import OrderList from './_components/OrderList'
import OrderLinkList from './_components/OrderLinkList'
import OrderForm from './_components/OrderForm'
import OrderView from './_components/OrderView'

type Tab = 'in-process' | 'unlinked'

export default function OrderMasterPage() {
  const [tab, setTab] = useState<Tab>('in-process')

  // ── In-Process Orders ──────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderColour, setOrderColour] = useState('all')
  const [orderStatus, setOrderStatus] = useState('all')
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersPerPage, setOrdersPerPage] = useState(PER_PAGE)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [ordersTotalCount, setOrdersTotalCount] = useState(0)

  // ── Linked / Unlinked Orders ───────────────────────────────────────────────────
  const [linkOrders, setLinkOrders] = useState<LinkOrder[]>([])
  const [linkLoading, setLinkLoading] = useState(true)
  const [linkSearch, setLinkSearch] = useState('')
  const [linkStatus, setLinkStatus] = useState('all')
  const [linkPage, setLinkPage] = useState(1)
  const [linkPerPage, setLinkPerPage] = useState(PER_PAGE)
  const [linkTotalPages, setLinkTotalPages] = useState(1)
  const [linkTotalCount, setLinkTotalCount] = useState(0)

  // ── Header stats ───────────────────────────────────────────────────────────────
  const [statTotal, setStatTotal] = useState(0)
  const [statUnlinked, setStatUnlinked] = useState(0)

  // ── Modals ─────────────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Order | LinkOrder | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [viewData, setViewData] = useState<Record<string, unknown> | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const uniqueColours = [...new Set(orders.map(o => o.colour).filter(Boolean))]

  // ── Fetch orders ───────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await apiCall<{
        data?: { records?: Order[]; pagination?: { total: number; total_pages: number } }
      }>('/order/list', {
        method: 'GET',
        encrypt: false,
        payload: {
          page: ordersPage,
          per_page: ordersPerPage,
          status: orderStatus,
          colour: orderColour,
          order_no: 'all',
          style_id: 'all',
          ...(orderSearch ? { search: orderSearch } : {}),
        },
      })
      setOrders(res.data?.records ?? [])
      setOrdersTotalCount(res.data?.pagination?.total ?? 0)
      setOrdersTotalPages(res.data?.pagination?.total_pages ?? 1)
    } catch { setOrders([]) }
    finally { setOrdersLoading(false) }
  }, [ordersPage, ordersPerPage, orderStatus, orderColour, orderSearch])

  // ── Fetch link orders ──────────────────────────────────────────────────────────
  const fetchLinkOrders = useCallback(async () => {
    setLinkLoading(true)
    try {
      const res = await apiCall<{
        data?: { records?: LinkOrder[]; pagination?: { total: number; total_pages: number } }
      }>('/order/linkorderlist', {
        method: 'GET',
        encrypt: false,
        payload: {
          page: linkPage,
          per_page: linkPerPage,
          status: linkStatus,
          search: linkSearch,
        },
      })
      setLinkOrders(res.data?.records ?? [])
      setLinkTotalCount(res.data?.pagination?.total ?? 0)
      setLinkTotalPages(res.data?.pagination?.total_pages ?? 1)
    } catch { setLinkOrders([]) }
    finally { setLinkLoading(false) }
  }, [linkPage, linkPerPage, linkStatus, linkSearch])

  // ── Stats on mount ─────────────────────────────────────────────────────────────
  useEffect(() => {
    apiCall<{ data?: { pagination?: { total: number } } }>(
      '/order/list',
      { method: 'GET', encrypt: false, payload: { page: 1, per_page: 1, status: 'all', colour: 'all', order_no: 'all', style_id: 'all' } }
    ).then(res => setStatTotal(res.data?.pagination?.total ?? 0)).catch(() => {})

    apiCall<{ data?: { pagination?: { total: number } } }>(
      '/order/linkorderlist',
      { method: 'GET', encrypt: false, payload: { page: 1, per_page: 1, status: 'unlinked', search: '' } }
    ).then(res => setStatUnlinked(res.data?.pagination?.total ?? 0)).catch(() => {})
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useEffect(() => { fetchLinkOrders() }, [fetchLinkOrders])

  // ── Delete ─────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await apiCall<{ success?: boolean; message?: string }>('/order/delete', {
        payload: { uuid: deleteTarget.uuid },
      })
      if (res.success === false) {
        setToast({ message: res.message || 'Delete failed', type: 'error' })
        return
      }
      setToast({ message: res.message || 'Order deleted', type: 'success' })
      setDeleteTarget(null)
      fetchOrders()
      fetchLinkOrders()
    } catch { setToast({ message: 'Failed to delete order', type: 'error' }) }
    finally { setDeleting(false) }
  }

  // ── Save ───────────────────────────────────────────────────────────────────────
  const handleSave = async (payload: Record<string, unknown>) => {
    const isEdit = !!editOrder
    const res = await apiCall<{ success?: boolean; message?: string }>(
      isEdit ? '/order/update' : '/order/create',
      { payload }
    )
    if (res.success !== false) {
      setToast({ message: res.message || (isEdit ? 'Order updated' : 'Order created'), type: 'success' })
      fetchOrders()
      fetchLinkOrders()
    }
    return res
  }

  // ── View ───────────────────────────────────────────────────────────────────────
  const handleView = async (uuid: string) => {
    setViewLoading(true)
    setViewData({})
    try {
      const res = await apiCall<{ data?: Record<string, unknown> }>('/order/show', {
        method: 'GET',
        encrypt: false,
        payload: { uuid },
      })
      setViewData(res.data ?? res)
    } catch { setViewData(null) }
    finally { setViewLoading(false) }
  }

  const statInProcess = Math.max(0, statTotal - statUnlinked)

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showModal && (
        <OrderForm
          order={editOrder}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <OrderView
        viewData={viewData !== null ? (viewLoading ? null : viewData) : null}
        viewLoading={viewLoading}
        onClose={() => setViewData(null)}
      />

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Order"
          message={<>Are you sure you want to delete Order <strong>#{deleteTarget.order_no}</strong>?</>}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-t-primary">Order Hub</h1>
          <p className="text-xs text-t-lighter mt-0.5">
            Manage production orders, track progress and control OB links to unlock TLS Sewing
          </p>
        </div>
        <div className="flex gap-3">
          {([
            { label: 'In-Process', value: statInProcess },
            { label: 'Unlinked', value: statUnlinked },
            { label: 'Total Orders', value: statTotal },
          ] as { label: string; value: number }[]).map(s => (
            <div
              key={s.label}
              className="flex flex-col items-center px-5 py-2.5 border border-header-line rounded-card bg-card min-w-[100px]"
            >
              <span className="text-xl font-bold text-t-primary leading-tight">
                {String(s.value).padStart(2, '0')}
              </span>
              <span className="text-2xs text-t-lighter mt-0.5 whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-b border-header-line mb-0" />

      {/* ── Tabs ── */}
      <div className="flex border-b border-table-line bg-card">
        {(['in-process', 'unlinked'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-t-lighter hover:text-t-body'
            }`}
          >
            {t === 'in-process' ? 'In-Process Orders' : 'Unlinked Orders'}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === 'in-process' ? (
        <OrderList
          data={orders}
          loading={ordersLoading}
          search={orderSearch}
          colour={orderColour}
          status={orderStatus}
          page={ordersPage}
          perPage={ordersPerPage}
          totalPages={ordersTotalPages}
          totalCount={ordersTotalCount}
          colours={uniqueColours}
          onSearchChange={v => { setOrderSearch(v); setOrdersPage(1) }}
          onColourChange={v => { setOrderColour(v); setOrdersPage(1) }}
          onStatusChange={v => { setOrderStatus(v); setOrdersPage(1) }}
          onAdd={() => { setEditOrder(null); setShowModal(true) }}
          onEdit={row => { setEditOrder(row); setShowModal(true) }}
          onDelete={setDeleteTarget}
          onView={handleView}
          onPageChange={setOrdersPage}
          onPerPageChange={setOrdersPerPage}
        />
      ) : (
        <OrderLinkList
          data={linkOrders}
          loading={linkLoading}
          search={linkSearch}
          status={linkStatus}
          page={linkPage}
          perPage={linkPerPage}
          totalPages={linkTotalPages}
          totalCount={linkTotalCount}
          onSearchChange={v => { setLinkSearch(v); setLinkPage(1) }}
          onStatusChange={v => { setLinkStatus(v); setLinkPage(1) }}
          onView={handleView}
          onDelete={setDeleteTarget}
          onPageChange={setLinkPage}
          onPerPageChange={setLinkPerPage}
        />
      )}
    </AppLayout>
  )
}
