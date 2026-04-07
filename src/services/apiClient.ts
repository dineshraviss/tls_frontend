import { getAuthToken } from '@/lib/cookies'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  payload?: Record<string, unknown>
}

export async function apiCall<T = Record<string, unknown>>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'POST', payload } = options
  const token = getAuthToken()

  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ endpoint, method, payload }),
  })

  const data = await res.json()

  if (!res.ok && res.status === 401) {
    if (typeof window !== 'undefined') {
      const { clearAuthCookies } = await import('@/lib/cookies')
      clearAuthCookies()
      window.location.href = '/login'
    }
  }

  return data as T
}
