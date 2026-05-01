'use client'

import ViewModal from '@/components/ui/ViewModal'
import Badge from '@/components/ui/Badge'

interface Props {
  viewData: Record<string, unknown> | null
  viewLoading: boolean
  onClose: () => void
}

export default function CompanyView({ viewData, viewLoading, onClose }: Props) {
  if (!viewData) return null

  const location = viewData.location as Record<string, unknown> | undefined

  return (
    <ViewModal
      title="Company Details"
      loading={viewLoading}
      onClose={onClose}
      fields={[
        { label: 'Company Name', value: viewData.company_name as string },
        { label: 'Company Code', value: viewData.company_code as string },
        { label: 'Company Type', value: <Badge variant="info">{viewData.company_type as string}</Badge> },
        { label: 'Max Slot', value: String(viewData.max_slot ?? '—') },
        { label: 'Address', value: viewData.address as string, fullWidth: true },
        { label: 'Location', value: `${location?.lat ?? '—'}, ${location?.lng ?? '—'}` },
        {
          label: 'Status',
          value: (
            <Badge variant={viewData.status === 1 ? 'success' : 'default'}>
              {viewData.status === 1 ? 'Active' : 'Inactive'}
            </Badge>
          ),
        },
      ]}
    />
  )
}
