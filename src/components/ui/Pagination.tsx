'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalCount: number
  perPage: number
  onPageChange: (page: number) => void
  countLabel?: string
}

export default function Pagination({
  page, totalPages, totalCount, perPage, onPageChange, countLabel = 'record',
}: PaginationProps) {
  if (totalCount === 0) return null

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, totalCount)

  // Generate page numbers to show
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (page > 3) pages.push('...')

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) pages.push(i)

      if (page < totalPages - 2) pages.push('...')

      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="px-4 py-3 border-t border-table-line flex items-center justify-between flex-wrap gap-2">
      {/* Count info */}
      <span className="text-xs text-t-lighter">
        Showing {from}-{to} of {totalCount} {countLabel}{totalCount !== 1 ? 's' : ''}
      </span>

      {/* Page controls */}
      {totalPages >= 1 && (
        <div className="flex items-center gap-1">
          {/* First */}
          <button
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-input border border-header-line
              bg-transparent cursor-pointer select-none disabled:cursor-not-allowed
              text-t-light disabled:text-t-lighter disabled:opacity-50
              hover:enabled:bg-table-head transition-colors"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Prev */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-input border border-header-line
              bg-transparent cursor-pointer select-none disabled:cursor-not-allowed
              text-t-light disabled:text-t-lighter disabled:opacity-50
              hover:enabled:bg-table-head transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-t-lighter">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-input border text-xs
                  cursor-pointer select-none transition-colors font-medium
                  ${p === page
                    ? 'bg-accent border-accent text-white'
                    : 'bg-transparent border-header-line text-t-body hover:bg-table-head'}`}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-input border border-header-line
              bg-transparent cursor-pointer select-none disabled:cursor-not-allowed
              text-t-light disabled:text-t-lighter disabled:opacity-50
              hover:enabled:bg-table-head transition-colors"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-input border border-header-line
              bg-transparent cursor-pointer select-none disabled:cursor-not-allowed
              text-t-light disabled:text-t-lighter disabled:opacity-50
              hover:enabled:bg-table-head transition-colors"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
