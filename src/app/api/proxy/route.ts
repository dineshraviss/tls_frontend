import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'

const API_BASE = process.env.API_BASE_URL || 'https://tlsts.proz.in/api'
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY || ''

function encrypt(data: unknown): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, method = 'POST', payload } = body

    if (!endpoint) {
      return NextResponse.json({ success: false, message: 'Missing endpoint' }, { status: 400 })
    }

    const url = `${API_BASE}${endpoint}`
    const token = request.headers.get('authorization') || ''

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = token

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers,
    }

    // For POST/PUT/PATCH — encrypt payload
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && payload) {
      headers['x-encrypted'] = 'true'
      fetchOptions.body = JSON.stringify({ data: encrypt(payload) })
    }

    // For GET — append query params
    const finalUrl = method.toUpperCase() === 'GET' && payload
      ? `${url}?${new URLSearchParams(payload).toString()}`
      : url

    const res = await fetch(finalUrl, fetchOptions)
    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ success: false, message: 'Proxy request failed' }, { status: 500 })
  }
}
