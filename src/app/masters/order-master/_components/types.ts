import type { ValidationRules } from '@/lib/validation'

export interface OrderSize {
  id?: number
  uuid?: string
  size: string
  ord_qty: number
  prod_qty?: number
  prod_per: number
  input_qty?: number
  output_qty?: number
  rej_qty?: number
  rej_per?: number
  wip?: number
  rework_qty?: number
}

export interface Order {
  id: number
  uuid: string
  order_no: number
  colour: string
  order_qty: number
  prod_qty: number
  input_qty: number
  prod_per: number
  output_qty: number
  rej_qty: number
  diff_qty: number
  rework_qty: number
  rework_per: number
  rej_per: number
  wip: number
  style_id: number | null
  total_size: number | null
  order_code: string | null
  status: number
  is_active: number
  created_at: string
  updated_at: string
  orderSizes: OrderSize[]
  style: { buyer: string; style_no: string; style_name: string } | null
}

export interface LinkOrder {
  id: number
  uuid: string
  order_no: number
  colour: string | null
  style_id: number | null
  order_code: string | null
  created_at: string
  updated_at: string
  style: { buyer: string; style_no: string; style_name: string } | null
}

export interface StyleOption {
  id: number
  uuid?: string
  style_no: string
  style_name: string
  buyer: string
}

export interface OrderSizeRow {
  size: string
  ord_qty: string
  prod_per: string
}

export type OrderFormField = 'order_no' | 'colour'
export type FormErrors = Partial<Record<OrderFormField, string>>
export type FormTouched = Partial<Record<OrderFormField, boolean>>

export const orderRules: ValidationRules<OrderFormField> = {
  order_no: { required: 'Order number is required' },
  colour: { required: 'Colour is required' },
}
