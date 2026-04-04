'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { useWindowSize } from '@/hooks/useWindowSize'
import { authService } from '@/services/api'
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
      const response = await authService.login({
        username: data.username,
        password: data.password,
      })

      const result = response.data

      // Extract token - handle various response shapes
      const resData = result.data ?? result
      const token = resData.token ?? resData.accessToken
      const message = result.message ?? 'Login successful'

      if (token) {
        const { token: _t, accessToken: _at, ...user } = resData
        setAuthCookies(token, user)
        setSuccessMsg(message)
        setTimeout(() => router.push('/dashboard'), 800)
      } else {
        setApiError(message || 'Login failed')
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setApiError(axiosErr.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        @keyframes lspin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .lf-input {
          display: block;
          width: 100%;
          height: 36px;
          padding: 0 10px;
          font-size: 13px;
          font-family: inherit;
          color: #1A202C;
          background: #ffffff;
          border: 1px solid #CBD5E0;
          border-radius: 5px;
          outline: none;
          box-sizing: border-box;
        }
        .lf-input::placeholder {
          color: #A0AEC0;
          font-size: 13px;
        }
        .lf-input:focus {
          border-color: #2DB3A0;
          box-shadow: 0 0 0 2px rgba(45,179,160,0.15);
        }
        .lf-input.err { border-color: #E53E3E; }

        .lf-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #2D3748;
          margin-bottom: 5px;
        }
        .lf-field {
          margin-bottom: 14px;
        }
        .lf-errmsg {
          display: block;
          font-size: 11px;
          color: #E53E3E;
          margin-top: 3px;
        }
        .lf-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 38px;
          background: #2DB3A0;
          color: #ffffff;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.01em;
        }
        .lf-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .lf-btn:not(:disabled):hover { background: #26A090; }

        .lf-forgot {
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          color: #2D3748;
          text-decoration: underline;
          cursor: pointer;
          font-family: inherit;
          display: block;
          margin-bottom: 16px;
        }
        .lf-forgot:hover { color: #2DB3A0; }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        margin: 0, padding: 0,
      }}>

        {/* LEFT: Illustration — hidden on mobile */}
        {!isMobile && <div style={{
          width: '50%',
          flexShrink: 0,
          overflow: 'hidden',
          background: '#C8E8F5',
          position: 'relative',
        }}>
          <Image
            src="/login_leftside.png"
            alt=""
            fill
            style={{
              objectFit: 'cover',
              objectPosition: '50% 30%',
            }}
            priority
          />
        </div>}

        {/* RIGHT: Login */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          overflow: 'hidden',
        }}>

          {/* Vertically centered form */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: isMobile ? '20px 16px' : '20px 0',
          }}>
            <div style={{ width: isMobile ? '100%' : 300, maxWidth: 360 }}>

              {/* Logo */}
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <Image
                  src="/logo.png"
                  alt="iQ2 TLS"
                  width={48}
                  height={48}
                  style={{ display: 'inline-block' }}
                />
              </div>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3748', letterSpacing: '0.05em' }}>
                  iQ2 TLS
                </span>
              </div>

              {/* Heading */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h1 style={{
                  margin: '0 0 6px',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#1A202C',
                  lineHeight: 1.2,
                }}>
                  Login
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  color: '#718096',
                  lineHeight: 1.5,
                }}>
                  Enter your email below to login to your account
                </p>
              </div>

              {/* Success Message */}
              {successMsg && (
                <div style={{
                  marginBottom: 14,
                  padding: '8px 12px',
                  backgroundColor: '#C6F6D5',
                  border: '1px solid #9AE6B4',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#276749',
                }}>
                  {successMsg}
                </div>
              )}

              {/* API Error */}
              {apiError && (
                <div style={{
                  marginBottom: 14,
                  padding: '8px 12px',
                  backgroundColor: '#FED7D7',
                  border: '1px solid #FEB2B2',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#9B2C2C',
                }}>
                  {apiError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <div className="lf-field">
                  <label className="lf-label">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP4903"
                    autoFocus
                    className={`lf-input${errors.username ? ' err' : ''}`}
                    {...register('username')}
                  />
                  {errors.username && (
                    <span className="lf-errmsg">{errors.username.message}</span>
                  )}
                </div>

                <div className="lf-field">
                  <label className="lf-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                      className={`lf-input${errors.password ? ' err' : ''}`}
                      style={{ paddingRight: 34 }}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                      style={{
                        position: 'absolute', right: 8, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        padding: 0, cursor: 'pointer',
                        color: '#A0AEC0', display: 'flex', alignItems: 'center',
                        lineHeight: 1,
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="lf-errmsg">{errors.password.message}</span>
                  )}
                </div>

                <button type="button" className="lf-forgot">
                  Forgot your password?
                </button>

                <button type="submit" className="lf-btn" disabled={isLoading}>
                  {isLoading && (
                    <svg
                      style={{ width: 15, height: 15, animation: 'lspin 1s linear infinite', flexShrink: 0 }}
                      viewBox="0 0 24 24" fill="none"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Login
                </button>

              </form>
            </div>
          </div>

          {/* Footer — pinned to bottom */}
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 24px',
            borderTop: '1px solid #EDF2F7',
            fontSize: 12,
            color: '#A0AEC0',
            background: '#ffffff',
          }}>
            <span>&copy; 2026 iQ2 TLS</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              help@tlssystem
            </span>
          </div>

        </div>
      </div>
    </>
  )
}
