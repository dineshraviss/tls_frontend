'use client'

import { Search } from 'lucide-react'
import type { StyleSummary } from './types'

function fmt(v: number | null | undefined) {
  if (v === null || v === undefined) return '—'
  return Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface Props {
  data: StyleSummary[]
  loading: boolean
  search: string
  onSearchChange: (v: string) => void
}

export default function StyleSummaryList({ data, loading, search, onSearchChange }: Props) {
  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-table-line bg-card flex-wrap">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter pointer-events-none" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search by buyer, style no. or name..."
            className="h-8 pl-8 pr-3 text-xs bg-input border border-input-line rounded-input outline-none focus:border-accent text-t-secondary w-64"
          />
        </div>
        <span className="text-xs text-t-lighter ml-auto">{data.length} record{data.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-table-head">
              {/* Style info */}
              <th className="px-3 py-2.5 text-left font-semibold text-t-lighter whitespace-nowrap">Buyer</th>
              <th className="px-3 py-2.5 text-left font-semibold text-t-lighter whitespace-nowrap">Style No.</th>
              <th className="px-3 py-2.5 text-left font-semibold text-t-lighter whitespace-nowrap">Style Name</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Total SAM</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Req Manning</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Alloc Manning</th>
              {/* Req targets */}
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap border-l border-table-line">Req 100%/Hr</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Req 100%/Day</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Req 60%/Hr</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Req 60%/Day</th>
              {/* Alloc targets */}
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap border-l border-table-line">Alloc 100%/Hr</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Alloc 100%/Day</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Alloc 60%/Hr</th>
              <th className="px-3 py-2.5 text-right font-semibold text-t-lighter whitespace-nowrap">Alloc 60%/Day</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-row-${i}`} className="border-t border-table-line">
                  {Array.from({ length: 14 }).map((_, j) => (
                    <td key={`skel-cell-${j}`} className="px-3 py-2.5">
                      <div className="h-3.5 bg-table-head rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-10 text-center text-t-lighter">
                  No style summary records found.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.uuid}
                  className={`border-t border-table-line hover:bg-accent/5 transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}
                >
                  <td className="px-3 py-2 font-medium text-t-body">{row.buyer}</td>
                  <td className="px-3 py-2 font-mono text-t-secondary">{row.style_no}</td>
                  <td className="px-3 py-2 font-semibold text-accent">{row.style_name}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.total_sam)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.req_manning)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.allocated_manning)}</td>
                  {/* Req targets */}
                  <td className="px-3 py-2 text-right font-semibold text-accent border-l border-table-line">{fmt(row.req_target_hun_hr)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.req_target_hun_day)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.req_target_six_hr)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.req_target_six_day)}</td>
                  {/* Alloc targets */}
                  <td className="px-3 py-2 text-right font-semibold text-accent border-l border-table-line">{fmt(row.all_target_hun_hr)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.all_target_hun_day)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.all_target_six_hr)}</td>
                  <td className="px-3 py-2 text-right text-t-body">{fmt(row.all_target_six_day)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
