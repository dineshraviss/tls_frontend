'use client'

import IconButton from '@/components/ui/IconButton'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Search, Plus, Pencil, Trash2, QrCode, ArrowRight, MoreVertical } from 'lucide-react'
import { conditionLabel } from './types'
import type { MachineTypeGroup, MachineTypeItem, MachineSpec } from './types'

interface Props {
  // Left panel
  groups: MachineTypeGroup[]
  typesLoading: boolean
  searchType: string
  onSearchTypeChange: (val: string) => void
  selectedId: number | null
  onSelectType: (id: number) => void

  // Right panel — type header
  selected: MachineTypeItem | null
  onEditType: (type: MachineTypeItem) => void
  onDeleteType: (type: MachineTypeItem) => void

  // Right panel — spec sub-tab
  subTab: 'Machine Specification' | 'Operation Master'
  onSubTabChange: (tab: 'Machine Specification' | 'Operation Master') => void

  // Right panel — specs
  specs: MachineSpec[]
  specsLoading: boolean
  onAddSpec: () => void
  onViewSpec: (uuid: string) => void
  onEditSpec: (spec: MachineSpec) => void
  onDeleteSpec: (spec: MachineSpec) => void

  // Spec row context menu
  openMenuId: number | null
  menuPos: { top: number; right: number }
  onOpenSpecMenu: (e: React.MouseEvent<HTMLButtonElement>, id: number) => void
  onCloseMenu: () => void
}

export default function MachineHubList({
  groups, typesLoading, searchType, onSearchTypeChange, selectedId, onSelectType,
  selected, onEditType, onDeleteType,
  subTab, onSubTabChange,
  specs, specsLoading, onAddSpec, onViewSpec, onEditSpec, onDeleteSpec,
  openMenuId, menuPos, onOpenSpecMenu, onCloseMenu,
}: Props) {
  return (
    <>
      <div className="flex gap-0 h-[calc(100vh-220px)] min-h-[400px]">

        {/* Left: grouped machine type list */}
        <div className="w-[270px] shrink-0 bg-card rounded-l-lg border border-header-line flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-table-line shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-t-lighter" />
              <input
                placeholder="Search type"
                value={searchType}
                onChange={e => onSearchTypeChange(e.target.value)}
                className="w-full h-[30px] pl-[26px] pr-2 text-xs font-inherit text-t-secondary bg-table-head border border-header-line rounded-input outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {typesLoading ? (
              <div className="flex flex-col gap-0">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="px-3.5 py-3 border-b border-table-line">
                    <div className="h-3 w-24 bg-table-head rounded animate-pulse mb-1.5" />
                    <div className="h-2.5 w-16 bg-table-head rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <p className="text-xs text-t-lighter text-center py-6">No machine types found</p>
            ) : (
              groups.map(group => (
                <div key={group.variant}>
                  {/* Group header */}
                  <div className="px-3.5 py-2 border-b border-table-line bg-table-head sticky top-0 z-10 flex items-center justify-between gap-2">
                    <p className="m-0 text-xs font-bold text-t-secondary">{group.variant}</p>
                    <p className="m-0 text-xs2 text-t-lighter shrink-0">
                      {group.variant_count} variants | {group.total_machine_count} machines
                    </p>
                  </div>
                  {/* Individual type items */}
                  {group.data.map(t => (
                    <div
                      key={t.id}
                      onClick={() => onSelectType(t.id)}
                      className={`pl-5 pr-3.5 py-2.5 cursor-pointer border-b border-table-line flex justify-between items-center border-l-2 transition-colors
                        ${selectedId === t.id
                          ? 'bg-accent/5 border-l-accent'
                          : 'bg-card hover:bg-card-alt border-l-transparent'}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`m-0 text-sm truncate ${selectedId === t.id ? 'font-semibold text-accent' : 'font-medium text-t-secondary'}`}>
                          {t.type_name}
                        </p>
                        {t.name && (
                          <p className="m-0 text-xs2 text-accent/70 truncate">{t.name}</p>
                        )}
                      </div>
                      <span className="shrink-0 ml-2 min-w-[20px] text-center text-xs2 font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                        {t.machine_count}
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 min-w-0 border border-header-line border-l-0 rounded-r-lg bg-card flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-t-lighter text-sm">
              {typesLoading ? 'Loading...' : 'Select a machine type'}
            </div>
          ) : (
            <>
              {/* Type header */}
              <div className="px-4 py-3.5 border-b border-table-line shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {selected.needle && (
                      <span className="mt-0.5 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded shrink-0">
                        {selected.name ? selected.name.slice(0, 2).toUpperCase() : ''}-{selected.needle}
                        {/^\d+$/.test(selected.needle) ? 'T' : ''}
                      </span>
                    )}
                    <div>
                      <p className="m-0 text-sm font-bold text-t-primary">{selected.type_name}</p>
                      {selected.notes && (
                        <p className="m-0 text-xs text-t-lighter mt-0.5">{selected.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onEditType(selected)}>
                      <Pencil size={12} /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDeleteType(selected)}>
                      <Trash2 size={12} /> Delete
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="px-4 py-3 border-b border-table-line shrink-0 grid grid-cols-4 gap-3">
                {[
                  { label: 'Machines', value: specsLoading ? null : specs.length },
                  { label: 'Active', value: specsLoading ? null : specs.filter(s => s.is_active === 1).length },
                  { label: 'In Maintenance', value: specsLoading ? null : specs.filter(s => s.next_maintenance !== null).length },
                  { label: 'Operations', value: 0 },
                ].map(card => (
                  <div key={card.label} className="flex flex-col gap-1 px-4 py-3 rounded-lg border border-table-line bg-card-alt">
                    <p className="m-0 text-xs text-t-lighter">{card.label}</p>
                    <p className="m-0 text-xl font-bold text-t-primary">
                      {card.value === null ? '--' : card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center justify-between px-4 border-b border-table-line shrink-0">
                <div className="flex gap-0">
                  {(['Machine Specification', 'Operation Master'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => onSubTabChange(tab)}
                      className={`px-3.5 py-2.5 border-none bg-transparent cursor-pointer text-sm2 font-inherit whitespace-nowrap -mb-px
                        ${subTab === tab
                          ? 'font-semibold text-accent border-b-2 border-b-accent'
                          : 'font-normal text-t-light border-b-2 border-b-transparent'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {subTab === 'Machine Specification' && (
                  <Button variant="primary" size="sm" onClick={onAddSpec}>
                    <Plus size={12} /> Add New
                  </Button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {subTab === 'Machine Specification' ? (
                  specsLoading ? (
                    <div className="p-6 text-center text-t-lighter text-sm">Loading...</div>
                  ) : specs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-t-lighter text-sm">
                      No machines registered for this type yet
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-sm2">
                      <thead>
                        <tr className="bg-table-head">
                          {['M - No.', 'Brand', 'Model No', 'Serial No', 'Condition', 'Next Maint.', 'Branch', 'Status', ''].map(
                            (h, i) => (
                              <th
                                key={i}
                                className="px-3.5 py-2.5 text-left font-semibold text-xs text-t-light border-b border-header-line whitespace-nowrap"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {specs.map((spec, i) => (
                          <tr
                            key={spec.uuid}
                            className={`border-b border-table-line ${i % 2 === 0 ? 'bg-card' : 'bg-card-alt'}`}
                          >
                            <td className="px-3.5 py-2.5 text-accent font-semibold">{spec.machine_no}</td>
                            <td className="px-3.5 py-2.5 text-t-body">{spec.brand || '—'}</td>
                            <td className="px-3.5 py-2.5 text-t-body font-mono text-xs">{spec.model_no || '—'}</td>
                            <td className="px-3.5 py-2.5 text-t-body font-mono text-xs">{spec.serial_no || '—'}</td>
                            <td className="px-3.5 py-2.5 text-t-body">
                              {spec.conditionInfo?.value ?? conditionLabel(String(spec.condition))}
                            </td>
                            <td className="px-3.5 py-2.5 text-t-body text-xs">{spec.next_maintenance ?? '—'}</td>
                            <td className="px-3.5 py-2.5 text-t-body text-xs">{spec.branch?.branch_name ?? '—'}</td>
                            <td className="px-3.5 py-2.5">
                              <Badge variant={spec.is_active === 1 ? 'success' : 'default'}>
                                {spec.is_active === 1 ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex items-center gap-1">
                                <IconButton variant="default" title="QR Code">
                                  <QrCode size={13} />
                                </IconButton>
                                <IconButton
                                  variant="accent"
                                  title="View"
                                  onClick={() => onViewSpec(spec.uuid)}
                                >
                                  <ArrowRight size={13} />
                                </IconButton>
                                <IconButton
                                  variant="default"
                                  onClick={e => onOpenSpecMenu(e, spec.id)}
                                >
                                  <MoreVertical size={13} />
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-t-lighter text-sm">
                    Operation Master — coming soon
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fixed ⋮ dropdown for spec rows */}
      {openMenuId !== null && (
        <>
          <div className="fixed inset-0 z-[9990]" onClick={onCloseMenu} />
          <div
            className="fixed z-[9991] bg-modal border border-table-line rounded-card shadow-lg py-1 min-w-[130px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              onClick={() => {
                const s = specs.find(x => x.id === openMenuId)
                if (s) onEditSpec(s)
                onCloseMenu()
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-t-body hover:bg-card-alt transition-colors cursor-pointer"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => {
                const s = specs.find(x => x.id === openMenuId)
                if (s) onDeleteSpec(s)
                onCloseMenu()
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </>
      )}
    </>
  )
}
