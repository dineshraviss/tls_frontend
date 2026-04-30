'use client'

import { type ValidationRules } from '@/lib/validation'

// ── Entities ──
export interface Designation {
  id: number
  uuid: string
  designation_name: string
  dept_id: number
  status: number
  is_active: number
  department?: { id: number; name: string }
}

// ── Form types ──
export type FormField = 'designation_name' | 'dept_id'
export type FormErrors = Partial<Record<FormField, string>>
export type Touched = Partial<Record<FormField, boolean>>

// ── Validation rules ──
export const rules: ValidationRules<FormField> = {
  designation_name: {
    required: 'Designation name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
    maxLength: { value: 100, message: 'Maximum 100 characters' },
  },
  dept_id: { required: 'Department is required' },
}
