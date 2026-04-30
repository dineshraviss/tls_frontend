'use client'

import { type ValidationRules } from '@/lib/validation'

// ── Entities ──
export interface Cap {
  id?: number
  cap_name: string
  short_name: string
  notes: string
}

export interface Defect {
  id: number
  uuid: string
  code: string
  defect_name: string
  category: string
  severity: string
  escalation_flag: number
  department_id: number | null
  is_active: number
  department?: { id: number; name: string }
  caps?: Cap[]
  caps_count?: number
}

// ── Form types ──
export type FormField = 'defect_name' | 'category' | 'severity'
export type FormErrors = Partial<Record<FormField | 'department_id', string>>
export type Touched = Partial<Record<FormField | 'department_id', boolean>>

// ── Internal form shape ──
export interface DefectForm {
  defect_name: string
  category: string
  severity: string
  escalation_flag: boolean
  department_id: string
  caps: Cap[]
}

// ── Validation rules ──
export const rules: ValidationRules<FormField> = {
  defect_name: {
    required: 'Defect name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
  },
  category: { required: 'Category is required' },
  severity: { required: 'Severity is required' },
}
