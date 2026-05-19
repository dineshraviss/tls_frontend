'use client'

import { X } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface OrderViewProps {
  viewData: Record<string, unknown> | null
  viewLoading: boolean
  onClose: () => void
}

export default function OrderView({ viewData, viewLoading, onClose }: OrderViewProps) {
  if (!viewData && !viewLoading) return null

  const orderSizes = (viewData?.orderSizes as Record<string, unknown>[] | undefined) ?? []
  const style = viewData?.style as Record<string, unknown> | undefined

  return (
    <div className="fixed inset-0 z-[9997] flex justify-end">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-[1] bg-modal w-full max-w-[520px] h-full flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
          <div className="flex-1 min-w-0">
            {viewLoading || !viewData ? (
              <div className="h-5 w-48 bg-table-head rounded animate-pulse" />
            ) : (
              <>
                <h2 className="text-base font-bold text-t-primary leading-snug">
                  Order #{String(viewData.order_no ?? '')}
                  {viewData.order_code ? ` — ${String(viewData.order_code)}` : ''}
                </h2>
                {style && (
                  <p className="text-xs text-t-lighter mt-1">
                    {String(style.buyer ?? '')} · {String(style.style_no ?? '')} · {String(style.style_name ?? '')}
                  </p>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 mt-0.5 p-1 text-t-lighter hover:text-t-body transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Meta */}
        {!viewLoading && viewData && (
          <div className="flex items-center gap-3 px-6 pb-4 shrink-0">
            {!!viewData.colour && (
              <span className="px-2.5 py-0.5 rounded-xl text-xs2 bg-default-badge-bg text-default-badge-text font-medium">
                {String(viewData.colour)}
              </span>
            )}
            <Badge variant={Number(viewData.is_active) === 1 ? 'success' : 'default'}>
              {Number(viewData.is_active) === 1 ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}

        <div className="h-px bg-table-line mx-6 shrink-0" />

        {/* Stats grid */}
        {!viewLoading && viewData && (
          <div className="grid grid-cols-3 gap-2 px-6 py-4 shrink-0">
            {([
              ['Order Qty', viewData.order_qty],
              ['Prod Qty', viewData.prod_qty],
              ['Prod %', `${viewData.prod_per ?? 0}%`],
              ['Input Qty', viewData.input_qty],
              ['Output Qty', viewData.output_qty],
              ['Rej Qty', viewData.rej_qty],
              ['Rej %', `${viewData.rej_per ?? 0}%`],
              ['WIP', viewData.wip],
              ['Rework', viewData.rework_qty],
            ] as [string, string | number | null | undefined][]).map(([label, value]) => (
              <div key={label} className="flex flex-col p-2.5 rounded-card border border-table-line bg-card">
                <span className="text-sm font-bold text-t-primary">{String(value ?? 0)}</span>
                <span className="text-2xs text-t-lighter mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="h-px bg-table-line mx-6 shrink-0" />

        {/* Order Sizes */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {viewLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(n => <div key={n} className="h-10 bg-table-head rounded animate-pulse" />)}
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-t-primary mb-3">
                Order Sizes ({orderSizes.length})
              </h3>
              {orderSizes.length === 0 ? (
                <p className="text-xs text-t-lighter py-6 text-center">No sizes added.</p>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-table-head">
                      <th className="px-3 py-2 text-left font-semibold text-t-lighter">Size</th>
                      <th className="px-3 py-2 text-right font-semibold text-t-lighter">Ord Qty</th>
                      <th className="px-3 py-2 text-right font-semibold text-t-lighter">Prod Qty</th>
                      <th className="px-3 py-2 text-right font-semibold text-t-lighter">Prod %</th>
                      <th className="px-3 py-2 text-right font-semibold text-t-lighter">Rej Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderSizes.map((s, idx) => (
                      <tr
                        key={String(s.size)}
                        className={`border-t border-table-line ${idx % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}
                      >
                        <td className="px-3 py-2 font-semibold text-accent">{String(s.size ?? '')}</td>
                        <td className="px-3 py-2 text-right text-t-body">{String(s.ord_qty ?? 0)}</td>
                        <td className="px-3 py-2 text-right text-t-body">{String(s.prod_qty ?? 0)}</td>
                        <td className="px-3 py-2 text-right text-t-body">{String(s.prod_per ?? 0)}%</td>
                        <td className="px-3 py-2 text-right text-t-body">{String(s.rej_qty ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
