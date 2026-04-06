import axios from 'axios'
import { encryptPayload } from '@/lib/crypto'
import { getAuthToken, clearAuthCookies } from '@/lib/cookies'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add auth token + encrypt payload
api.interceptors.request.use((config) => {
  // Attach Bearer token from cookie
  if (typeof window !== 'undefined') {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  // Encrypt request body (POST/PUT/PATCH)
  if (config.data && ['post', 'put', 'patch'].includes(config.method ?? '')) {
    config.data = encryptPayload(config.data)
    config.headers['x-encrypted'] = 'true'
  }

  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        clearAuthCookies()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/user/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}
