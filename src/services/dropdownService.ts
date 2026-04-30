import { apiCall } from './apiClient'

// ── Shared types ────────────────────────────────────────────────────────────────
export interface CompanyOption  { id: number; company_name: string; max_slot?: number }
export interface BranchOption   { id: number; branch_name: string; company_id?: number }
export interface ZoneOption     { id: number; zone_name: string; company_id?: number; branch_id?: number }
export interface LineOption     { id: number; line_name: string; branch_id?: number }
export interface RoleOption     { id: number; uuid?: string; name: string; role?: number }
export interface DeptOption     { id: number; name: string; branch_id?: number }

// ── Internal cache ──────────────────────────────────────────────────────────────
const _cache   = new Map<string, unknown[]>()
const _pending = new Map<string, Promise<unknown[]>>()

const PARAMS = { page: '1', per_page: '500', search: '', status: 'all' }

async function fetchOnce<T>(key: string, fetcher: () => Promise<T[]>): Promise<T[]> {
  if (_cache.has(key))   return _cache.get(key) as T[]
  if (_pending.has(key)) return _pending.get(key) as Promise<T[]>

  const p = fetcher()
    .then(data => { _cache.set(key, data as unknown[]); _pending.delete(key); return data })
    .catch(err  => { _pending.delete(key); throw err })

  _pending.set(key, p as Promise<unknown[]>)
  return p
}

/** Call after creating/updating a master to bust its dropdown cache */
export function clearDropdownCache(key?: 'companies' | 'branches' | 'zones' | 'lines' | 'roles' | 'departments') {
  if (key) { _cache.delete(key); _pending.delete(key) }
  else     { _cache.clear();     _pending.clear() }
}

// ── Public fetch functions ──────────────────────────────────────────────────────
export const fetchCompanies = () =>
  fetchOnce<CompanyOption>('companies', async () => {
    const r = await apiCall<{ data?: { companies?: CompanyOption[] } }>('/company/companyList', { method: 'GET', encrypt: false, payload: PARAMS })
    return r.data?.companies ?? []
  })

export const fetchBranches = () =>
  fetchOnce<BranchOption>('branches', async () => {
    const r = await apiCall<{ data?: { branches?: BranchOption[] } }>('/branch/branchList', { method: 'GET', encrypt: false, payload: PARAMS })
    return r.data?.branches ?? []
  })

export const fetchZones = () =>
  fetchOnce<ZoneOption>('zones', async () => {
    const r = await apiCall<{ data?: { zones?: ZoneOption[] } }>('/zone/zoneList', { method: 'GET', encrypt: false, payload: PARAMS })
    return r.data?.zones ?? []
  })

export const fetchLines = () =>
  fetchOnce<LineOption>('lines', async () => {
    const r = await apiCall<{ data?: { lines?: LineOption[] } }>('/line/list', { method: 'GET', encrypt: false, payload: PARAMS })
    return r.data?.lines ?? []
  })

export const fetchRoles = () =>
  fetchOnce<RoleOption>('roles', async () => {
    const r = await apiCall<{ data?: { roles?: RoleOption[] } }>('/role/list', { method: 'GET', encrypt: false, payload: PARAMS })
    return r.data?.roles ?? []
  })

export const fetchDepartments = () =>
  fetchOnce<DeptOption>('departments', async () => {
    const r = await apiCall<{ data?: { departments?: DeptOption[] } }>('/department/list', { method: 'GET', encrypt: false, payload: PARAMS })
    return r.data?.departments ?? []
  })
