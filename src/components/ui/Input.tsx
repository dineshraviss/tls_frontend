'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#374151]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[#9CA3AF] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-11 rounded-lg border bg-white px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF]',
              'border-[#D1D5DB] focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10',
              'transition-colors duration-150',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F9FAFB]',
              error && 'border-[#E74C3C] focus:border-[#E74C3C] focus:ring-[#E74C3C]/10',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[#9CA3AF]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#E74C3C] mt-0.5">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
