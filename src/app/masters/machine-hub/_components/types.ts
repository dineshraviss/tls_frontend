export interface MachineTypeItem {
  id: number
  uuid: string
  type_name: string
  needle?: string
  name?: string
  notes?: string | null
  machine_count: string | number
}

export interface MachineTypeGroup {
  variant: string
  variant_count: number
  total_machine_count: number
  data: MachineTypeItem[]
}

export interface MachineSpec {
  id: number
  uuid: string
  machine_no: string
  machine_type_id: number
  brand: string
  model_no: string
  condition: number
  serial_no: string
  purchase_date: string
  last_oil_change: string | null
  next_maintenance: string | null
  warranty: number | null
  branch_id: number | null
  qr_code: string | null
  is_active: number
  branch?: { id: number; branch_name: string; address?: string } | null
  conditionInfo?: { id: number; type: string; value: string } | null
  stockType?: { id: number; type_name: string; needle: string | null; name: string | null }
  file?: string | null
  createdByUser?: { id: number; name: string; emp_code: string | null }
  updatedByUser?: { id: number; name: string; emp_code: string | null } | null
}

export const CONDITION_OPTIONS = [
  { value: '1', label: 'Good' },
  { value: '2', label: 'Fair' },
  { value: '3', label: 'Poor' },
]

export const conditionLabel = (val: string): string =>
  CONDITION_OPTIONS.find(o => o.value === String(val))?.label ?? val
