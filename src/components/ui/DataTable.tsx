'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T, index: number) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  page?: number
  totalPages?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  countLabel?: string
}

export default function DataTable<T>({
  columns, data, loading, emptyMessage = 'No records found',
  page = 1, totalPages = 1, totalCount = 0,
  onPageChange, countLabel = 'record',
}: DataTableProps<T>) {
  return (
    <div className="bg-card rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-table-head">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-3.5 py-2.5 text-left font-semibold text-[11.5px]
                    text-t-light border-b border-header-line
                    whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-t-lighter text-[13px]">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-t-lighter text-[13px]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-table-line
                    ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-3.5 py-[11px] ${col.className || ''}`}>
                      {col.render ? col.render(row, i) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-table-line flex items-center justify-between">
        <span className="text-xs text-t-lighter">
          {totalCount} {countLabel}{totalCount !== 1 ? 's' : ''} found
        </span>
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="bg-transparent border border-header-line rounded p-1
                flex items-center cursor-pointer disabled:cursor-not-allowed
                text-t-light disabled:text-input-line"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-t-body min-w-[60px] text-center">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="bg-transparent border border-header-line rounded p-1
                flex items-center cursor-pointer disabled:cursor-not-allowed
                text-t-light disabled:text-input-line"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
