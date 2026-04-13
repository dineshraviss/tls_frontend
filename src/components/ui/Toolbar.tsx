'use client'

import { Download, Plus } from 'lucide-react'
import SearchInput from './SearchInput'

interface ToolbarProps {
  title?: string
  search?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  onAdd?: () => void
  addLabel?: string
  showExport?: boolean
  children?: React.ReactNode
}

export default function Toolbar({
  title, search, onSearchChange, searchPlaceholder = 'Search',
  onAdd, addLabel = 'Add New', showExport = true, children,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-table-line gap-2.5 flex-wrap">
      {title && (
        <span className="text-sm font-semibold text-t-secondary">{title}</span>
      )}
      <div className="flex items-center gap-2">
        {children}
        {onSearchChange && (
          <SearchInput
            value={search ?? ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}
        {showExport && (
          <button className="h-8 px-3 flex items-center gap-1.5 bg-card
            border border-input-line rounded-input cursor-pointer select-none
            text-sm2 text-t-body font-inherit
            hover:bg-table-head">
            <Download size={13} /> Export
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="h-8 px-3.5 flex items-center gap-1.5 bg-accent hover:bg-accent-hover
              border-none rounded-input cursor-pointer select-none text-sm2 text-white
              font-semibold font-inherit transition-colors"
          >
            <Plus size={13} /> {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}
