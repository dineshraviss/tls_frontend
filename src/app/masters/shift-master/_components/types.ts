'use client'

import { type ValidationRules } from '@/lib/validation'

export interface Shift {
  id: number
  uuid: string
  shift_name: string
  type: string
  start_time: string
  end_time: string
  hrs: string
  breakMins: string
  start_buffer_time: string
  end_buffer_time: string
  branch_id: number
  zone_id: number
  lunch_start: string
  lunch_end: string
  mrg_break_start: string
  mrg_break_end: string
  evg_break_start: string
  evg_break_end: string
  status: number
  is_active: number
  branch?: { id: number; branch_name: string }
  zone?: { id: number; zone_name: string }
}

export interface BranchOption { id: number; branch_name: string }
export interface ZoneOption { id: number; zone_name: string; branch_id: number }

export type FormField = 'shift_name' | 'type' | 'start_time' | 'end_time' | 'hrs' | 'breakMins' | 'branch_id' | 'zone_id'
export type FormErrors = Partial<Record<string, string>>
export type Touched = Partial<Record<FormField, boolean>>

export const rules: ValidationRules<FormField> = {
  shift_name: { required: 'Shift name is required', minLength: { value: 2, message: 'Minimum 2 characters' } },
  type: { required: 'Type is required' },
  start_time: { required: 'Start time is required' },
  end_time: { required: 'End time is required' },
  hrs: { required: 'Hours is required' },
  breakMins: { required: 'Break minutes is required' },
  branch_id: { required: 'Branch is required' },
  zone_id: { required: 'Zone is required' },
}

export const SHIFT_TYPES = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night', label: 'Night' },
]
