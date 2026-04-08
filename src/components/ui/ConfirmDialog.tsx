'use client'

import { useEffect } from 'react'

interface ConfirmDialogProps {
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
  variant?: 'danger' | 'primary'
}

export default function ConfirmDialog({
  title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onClose, loading = false, variant = 'danger',
}: ConfirmDialogProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const btnClass = variant === 'danger'
    ? 'bg-[#E74C3C] hover:bg-[#C0392B] text-white'
    : 'bg-accent hover:bg-accent-hover text-white'

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      {/* Dialog */}
      <div className="relative z-[1] bg-[var(--color-modal-bg)] rounded-[10px]
        w-[calc(100vw-32px)] max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6"
      >
        <h3 className="m-0 mb-2 text-[15px] font-bold text-[var(--color-text-primary)]">{title}</h3>
        <div className="mb-5 text-[13px] text-[var(--color-text-light)]">{message}</div>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-[34px] px-[18px] bg-[var(--color-card-bg)] border border-[var(--color-input-border)]
              rounded-[5px] text-[13px] text-[var(--color-text-body)] cursor-pointer font-inherit
              disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`h-[34px] px-[18px] border-none rounded-[5px] text-[13px] font-semibold
              cursor-pointer font-inherit disabled:opacity-70 transition-colors ${btnClass}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
