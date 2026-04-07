'use client'

import { forwardRef } from 'react'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  touched?: boolean
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
        <textarea
          ref={ref}
          className={`w-full px-2.5 py-2 text-[12.5px] font-inherit resize-none
            text-t-secondary bg-input
            border border-input-line rounded-[5px]
            outline-none transition-colors
            focus:border-[#2DB3A0] focus:ring-2 focus:ring-[#2DB3A0]/15
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-t-lighter
            ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}
            ${className}`}
          rows={3}
          {...props}
        />
        {showError && (
          <span className="text-[11px] text-red-500 mt-0.5">{error}</span>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
export default FormTextarea
