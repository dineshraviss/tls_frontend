'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useWindowSize } from '@/hooks/useWindowSize'
import { apiCall } from '@/services/apiClient'
import { setAuthCookies } from '@/lib/cookies'

const loginSchema = z.object({
  username: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const router = useRouter()
  const width = useWindowSize()
  const isMobile = width < 640

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setApiError(null)
    setSuccessMsg(null)
    try {
      const result = await apiCall<{
        status?: boolean
        success?: boolean
        message?: string
        data?: Record<string, unknown>
      }>('/user/login', {
        payload: { username: data.username, password: data.password },
      })

      const resData = (result.data ?? result) as Record<string, unknown>
      const token = (resData.token ?? resData.accessToken) as string | undefined
      const message = (result.message ?? 'Login successful') as string

      if (token) {
        const { token: _t, accessToken: _at, ...user } = resData
        setAuthCookies(token, user)
        setSuccessMsg(message)
        setTimeout(() => router.push('/dashboard'), 800)
      } else {
        setApiError(message || 'Login failed')
      }
    } catch {
      setApiError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed inset-0 flex ${isMobile ? 'flex-col' : 'flex-row'} m-0 p-0`}>

      {/* LEFT: Illustration */}
      {!isMobile && (
        <div className="w-1/2 shrink-0 overflow-hidden bg-[#C8E8F5] relative">
          <Image
            src="/login_leftside.png"
            alt=""
            fill
            className="object-cover object-[50%_30%]"
            priority
          />
        </div>
      )}

      {/* RIGHT: Login */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">

        {/* Centered form */}
        <div className={`flex-1 flex items-center justify-center overflow-y-auto ${isMobile ? 'px-4 py-5' : 'py-5'}`}>
          <div className={`${isMobile ? 'w-full' : 'w-[300px]'} max-w-[360px]`}>

            {/* Logo */}
            <div className="text-center mb-1.5">
              <Image src="/logo.png" alt="iQ2 TLS" width={48} height={48} className="inline-block" />
            </div>
            <div className="text-center mb-4">
              <span className="text-[13px] font-semibold text-t-secondary tracking-wider">iQ2 TLS</span>
            </div>

            {/* Heading */}
            <div className="text-center mb-5">
              <h1 className="m-0 mb-1.5 text-[22px] font-bold text-t-primary leading-tight">Login</h1>
              <p className="m-0 text-[13px] text-t-light leading-normal">
                Enter your email below to login to your account
              </p>
            </div>

            {/* Success */}
            {successMsg && (
              <div className="mb-3.5 px-3 py-2 bg-[#C6F6D5] border border-[#9AE6B4] rounded-[5px] text-xs text-[#276749]">
                {successMsg}
              </div>
            )}

            {/* Error */}
            {apiError && (
              <div className="mb-3.5 px-3 py-2 bg-[#FED7D7] border border-[#FEB2B2] rounded-[5px] text-xs text-[#9B2C2C]">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              <div className="mb-3.5">
                <label className="block text-[13px] font-medium text-t-secondary mb-1.5">Employee ID</label>
                <input
                  type="text"
                  placeholder="EMP4903"
                  autoFocus
                  className={`w-full h-9 px-2.5 text-[13px] font-inherit text-t-primary bg-input
                    border rounded-[5px] outline-none transition-colors
                    placeholder:text-t-lighter
                    focus:border-accent focus:ring-2 focus:ring-accent/15
                    ${errors.username ? 'border-red-500' : 'border-input-line'}`}
                  {...register('username')}
                />
                {errors.username && (
                  <span className="block text-[11px] text-red-500 mt-1">{errors.username.message}</span>
                )}
              </div>

              <div className="mb-3.5">
                <label className="block text-[13px] font-medium text-t-secondary mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                    className={`w-full h-9 px-2.5 pr-9 text-[13px] font-inherit text-t-primary bg-input
                      border rounded-[5px] outline-none transition-colors
                      placeholder:text-t-lighter
                      focus:border-accent focus:ring-2 focus:ring-accent/15
                      ${errors.password ? 'border-red-500' : 'border-input-line'}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-t-lighter flex items-center leading-none"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="block text-[11px] text-red-500 mt-1">{errors.password.message}</span>
                )}
              </div>

              <button type="button" className="bg-transparent border-none p-0 text-[13px] text-t-secondary underline cursor-pointer font-inherit block mb-4 hover:text-accent">
                Forgot your password?
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full h-[38px] bg-accent text-white border-none rounded-[5px] text-sm font-medium font-inherit cursor-pointer tracking-wide
                  disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:bg-accent-hover transition-colors"
              >
                {isLoading && (
                  <svg className="w-[15px] h-[15px] animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Login
              </button>

            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-2.5 border-t border-table-line text-xs text-t-lighter bg-white">
          <span>&copy; 2026 iQ2 TLS</span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            help@tlssystem
          </span>
        </div>

      </div>
    </div>
  )
}
