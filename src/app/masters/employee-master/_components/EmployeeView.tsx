'use client'

import Badge from '@/components/ui/Badge'
import ViewModal from '@/components/ui/ViewModal'

interface EmployeeViewProps {
  viewData: Record<string, unknown> | null
  viewLoading: boolean
  onClose: () => void
}

export default function EmployeeView({ viewData, viewLoading, onClose }: EmployeeViewProps) {
  if (!viewData) return null

  return (
    <ViewModal
      title="Employee Details"
      loading={viewLoading}
      onClose={onClose}
      size="md"
      fields={[
        { label: 'Employee Code', value: viewData.emp_code as string },
        { label: 'Name', value: `${viewData.name} ${viewData.last_name}` },
        { label: 'Mobile', value: viewData.mobile as string },
        { label: 'Email', value: (viewData.email as string) ?? '—' },
        {
          label: 'Role',
          value: (
            <Badge variant="info">
              {(viewData.roleInfo as Record<string, unknown>)?.name as string ?? viewData.role}
            </Badge>
          ),
        },
        {
          label: 'Department',
          value: (viewData.department as Record<string, unknown>)?.name as string ?? '—',
        },
        {
          label: 'Branch',
          value: (viewData.branch as Record<string, unknown>)?.branch_name as string ?? '—',
        },
        { label: 'Join Date', value: viewData.join_date as string },
        {
          label: 'Status',
          value: (
            <Badge variant={viewData.is_active === 1 ? 'success' : 'default'}>
              {viewData.is_active === 1 ? 'Active' : 'Inactive'}
            </Badge>
          ),
        },
      ]}
    />
  )
}
