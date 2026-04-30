import { type ValidationRules } from '@/lib/validation'

export interface Company {
  uuid: string
  company_name: string
  address: string
  location: { lat: number; lng: number }
  company_type: string
  max_slot: number
  status: number
}

export type FormField = 'company_name' | 'address' | 'lat' | 'lng' | 'company_type' | 'max_slot'
export type FormErrors = Partial<Record<FormField, string>>
export type Touched = Partial<Record<FormField, boolean>>

export const COMPANY_TYPE_OPTIONS = [
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Service', label: 'Service' },
  { value: 'Trading', label: 'Trading' },
  { value: 'Other', label: 'Other' },
]

export const rules: ValidationRules<FormField> = {
  company_name: {
    required: 'Company name is required',
    minLength: { value: 2, message: 'Minimum 2 characters' },
    maxLength: { value: 100, message: 'Maximum 100 characters' },
  },
  address: {
    required: 'Address is required',
    minLength: { value: 3, message: 'Minimum 3 characters' },
  },
  company_type: {
    required: 'Company type is required',
  },
  max_slot: {
    required: 'Max slot is required',
    min: { value: 1, message: 'Minimum value is 1' },
    max: { value: 50, message: 'Maximum value is 50' },
  },
  lat: {
    pattern: { value: /^-?\d+(\.\d+)?$/, message: 'Enter a valid latitude' },
  },
  lng: {
    pattern: { value: /^-?\d+(\.\d+)?$/, message: 'Enter a valid longitude' },
  },
}
