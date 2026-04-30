'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import PageHeader from '@/components/ui/PageHeader'
import WorkListList from './_components/WorkListList'
import type { WorkEntry } from './_components/types'

const workEntries: WorkEntry[] = [
  { id: 1, shiftName: 'Shift A', role: 'Supervisor', empId: 'SS0426', title: 'SS0426', name: 'Sarit Pak', lines: ['Line-1', 'Line-2', 'Line-3'], status: 'Active' },
  { id: 2, shiftName: 'Shift B', role: 'QC', empId: 'SS0478', title: 'SS0478', name: 'Sabin Vai', lines: ['Line-1', 'Line-2', 'Line-3', 'Line-4'], status: 'Active' },
  { id: 3, shiftName: 'Shift C', role: 'Mechanic', empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar', lines: ['Line-1', 'Line-2'], status: 'Active' },
  { id: 4, shiftName: 'Shift D', role: 'Mechanic', empId: 'SS0761', title: 'SS0761', name: 'Monitor Lui', lines: ['Line-1', 'Line-2', 'Line-3'], status: 'Active' },
  { id: 5, shiftName: 'Shift E', role: 'QC', empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar', lines: ['Line-1', 'Line-2', 'Line-3'], status: 'Inactive' },
  { id: 6, shiftName: 'Shift F', role: 'Mechanic', empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar', lines: ['Line-1', 'Line-2', 'Line-3'], status: 'Active' },
  { id: 7, shiftName: 'Shift G', role: 'Technician', empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar', lines: ['Line-1', 'Line-2'], status: 'Active' },
  { id: 8, shiftName: 'Shift H', role: 'Technician', empId: 'SS0427', title: 'SS0427', name: 'Sasi Kumar', lines: ['Line-1', 'Line-2'], status: 'Active' },
]

export default function WorkListMasterPage() {
  const [activeTab, setActiveTab] = useState<'Today' | 'This Week'>('Today')
  const [search, setSearch] = useState('')

  return (
    <AppLayout>
      <PageHeader
        title="Work List Master"
        description="Define work types and department assignments for employees."
      />
      <WorkListList
        entries={workEntries}
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </AppLayout>
  )
}
