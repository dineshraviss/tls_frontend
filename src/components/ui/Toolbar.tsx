'use client'

import { Search, Download, Plus } from 'lucide-react'

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
        <span className="text-[13px] font-semibold text-t-secondary">{title}</span>
      )}
      <div className="flex items-center gap-2">
        {children}
        {onSearchChange && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-t-lighter" />
            <input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="h-8 pl-7 pr-2.5 text-[12.5px] font-inherit
                text-t-secondary bg-table-head
                border border-header-line rounded-[5px]
                outline-none w-40 focus:border-[#2DB3A0]"
            />
          </div>
        )}
        {showExport && (
          <button className="h-8 px-3 flex items-center gap-1.5 bg-card
            border border-input-line rounded-[5px] cursor-pointer
            text-[12.5px] text-t-body font-inherit
            hover:bg-table-head">
            <Download size={13} /> Export
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="h-8 px-3.5 flex items-center gap-1.5 bg-[#2DB3A0] hover:bg-[#26A090]
              border-none rounded-[5px] cursor-pointer text-[12.5px] text-white
              font-semibold font-inherit transition-colors"
          >
            <Plus size={13} /> {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}
