'use client'

import ViewModal from '@/components/ui/ViewModal'
import Badge from '@/components/ui/Badge'

interface ShiftModifyViewProps {
  viewData: Record<string, unknown> | null
  viewLoading: boolean
  onClose: () => void
}

export default function ShiftModifyView({ viewData, viewLoading, onClose }: ShiftModifyViewProps) {
  if (!viewData) return null

  return (
    <ViewModal
      title="Shift Modify Details"
      loading={viewLoading}
      onClose={onClose}
      size="md"
      fields={[
        { label: 'Shift Name', value: viewData.shift_name as string },
        { label: 'Type', value: <Badge variant="info">{viewData.type as string}</Badge> },
        { label: 'Branch', value: (viewData.branch as Record<string, unknown>)?.branch_name as string ?? '—' },
        { label: 'Zone', value: (viewData.zone as Record<string, unknown>)?.zone_name as string ?? '—' },
        { label: 'Start Time', value: (viewData.start_time as string)?.slice(0, 5) },
        { label: 'End Time', value: (viewData.end_time as string)?.slice(0, 5) },
        { label: 'Hours', value: `${viewData.hrs}h` },
        { label: 'Break', value: `${viewData.breakMins}m` },
        { label: 'Buffer Login', value: (viewData.start_buffer_time as string)?.slice(0, 5) ?? '—' },
        { label: 'Buffer Logout', value: (viewData.end_buffer_time as string)?.slice(0, 5) ?? '—' },
        { label: 'Date', value: viewData.date as string ?? '—' },
        { label: 'Lunch Start', value: (viewData.lunch_start as string)?.slice(0, 5) ?? '—' },
        { label: 'Lunch End', value: (viewData.lunch_end as string)?.slice(0, 5) ?? '—' },
        { label: 'Status', value: <Badge variant={viewData.is_active === 1 ? 'success' : 'default'}>{viewData.is_active === 1 ? 'Active' : 'Inactive'}</Badge> },
      ]}
    />
  )
}
