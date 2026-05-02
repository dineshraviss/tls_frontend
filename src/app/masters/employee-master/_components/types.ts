'use client'

import { type ValidationRules } from '@/lib/validation'

// ── Entity interfaces ──
export interface Employee {
  id: number
  uuid: string
  name: string
  last_name: string
  emp_code: string
  email: string | null
  mobile: string
  role: number
  join_date: string
  department_id: number
  branch_id: number
  status: number
  is_active: number
  branch?: { id: number; branch_name: string; branch_code: string }
  department?: { id: number; name: string; dept_code: string }
  roleInfo?: { id: number; name: string; short_name: string }
}

export interface BranchOption { id: number; branch_name: string }
export interface RoleOption { id: number; uuid?: string; name: string; role?: number }
export interface DeptOption { id: number; name: string; branch_id?: number }

// ── Form types ──
export type FormField = 'name' | 'last_name' | 'mobile' | 'role' | 'join_date' | 'department_id' | 'branch_id'
export type FormErrors = Partial<Record<FormField | 'email', string>>
export type Touched = Partial<Record<FormField, boolean>>

export const rules: ValidationRules<FormField> = {
  name: { required: 'First name is required', minLength: { value: 2, message: 'Minimum 2 characters' } },
  last_name: { required: 'Last name is required', minLength: { value: 1, message: 'Required' } },
  mobile: { required: 'Mobile is required', pattern: { value: /^\d{10}$/, message: 'Enter valid 10-digit number' } },
  role: { required: 'Role is required' },
  join_date: { required: 'Join date is required' },
  department_id: { required: 'Department is required' },
  branch_id: { required: 'Branch is required' },
}
