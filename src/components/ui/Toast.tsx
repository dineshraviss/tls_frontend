'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertTriangle } from 'lucide-react'

export interface ToastData {
  message: string
  type: 'success' | 'error'
}

interface ToastProps extends ToastData {
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const isSuccess = type === 'success'

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      borderRadius: 8,
      backgroundColor: isSuccess ? '#C6F6D5' : '#FED7D7',
      border: `1px solid ${isSuccess ? '#9AE6B4' : '#FEB2B2'}`,
      color: isSuccess ? '#276749' : '#9B2C2C',
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      minWidth: 280,
      maxWidth: 420,
      animation: 'toastSlideIn 0.3s ease',
    }}>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      {isSuccess ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: 'inherit', opacity: 0.6 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
