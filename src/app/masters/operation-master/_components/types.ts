'use client'

import type { ValidationRules } from '@/lib/validation'

// ── Entity interfaces ──────────────────────────────────────────────────────────

export interface MachineTypeItem {
  id: number
  type_name: string
  name: string
  machine_count: number
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
  name: string
  machine_id?: string
  machine_no?: string
}

export interface DefectOption {
  id: number
  defect_name: string
  code: string
}

export interface Operation {
  id: number
  uuid: string
  operation_name: string
  code: string
  sam: string | number
  notes: string | null
  machine_type_id: number | null
  machine_id: number | null
  machineType?: { id: number; type_name: string }
  machine?: { id: number; machine_no: string; brand?: string; model_no?: string }
  defects?: number[]
  defect_details?: DefectOption[]
  is_active: number
}

// ── Form types ─────────────────────────────────────────────────────────────────

export interface OperationFormData {
  operation_name: string
  code: string
  sam: string
  notes: string
  machine_type_id: string
  machine_id: string
  defect_ids: number[]
}

export type FormField = 'operation_name' | 'code' | 'sam' | 'machine_type_id'
export type FormErrors = Partial<Record<FormField | 'machine_id', string>>
export type Touched = Partial<Record<FormField | 'machine_id', boolean>>

// ── Validation ─────────────────────────────────────────────────────────────────

export const SAM_RE = /^\d{2}:\d{2}$/

export const rules: ValidationRules<FormField> = {
  operation_name: { required: 'Operation name is required', minLength: { value: 2, message: 'Minimum 2 characters' } },
  code: { required: 'Code is required' },
  sam: {
    required: 'SAM is required',
    pattern: { value: SAM_RE, message: 'SAM must be in MM:SS format (e.g. 02:30)' },
  },
  machine_type_id: { required: 'Machine type is required' },
}
