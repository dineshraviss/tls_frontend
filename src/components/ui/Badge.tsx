'use client'

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default'

const variants: Record<BadgeVariant, string> = {
  success: 'bg-[#C6F6D5] text-[#276749]',
  error: 'bg-[#FED7D7] text-[#9B2C2C]',
  warning: 'bg-[#FEEBC8] text-[#9C4221]',
  info: 'bg-[#BEE3F8] text-[#2C5282]',
  default: 'bg-[#EDF2F7] text-[#718096]',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[11px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
