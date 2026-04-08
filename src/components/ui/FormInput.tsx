'use client'

import { forwardRef } from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  touched?: boolean
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, touched, className = '', required, ...props }, ref) => {
    const showError = error && touched !== false
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[11.5px] font-medium text-t-body">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-[34px] px-2.5 text-[12.5px] font-inherit
            text-t-secondary bg-input
            border border-input-line rounded-[5px]
            outline-none transition-colors
            focus:border-[#2DB3A0] focus:ring-2 focus:ring-[#2DB3A0]/15
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-t-lighter
            ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}
            ${className}`}
          {...props}
        />
        {showError && (
          <span className="text-[11px] text-red-500 mt-0.5">{error}</span>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
export default FormInput
