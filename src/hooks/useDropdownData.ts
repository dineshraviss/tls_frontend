'use client'

import { useState, useEffect } from 'react'
import {
  fetchCompanies, fetchBranches, fetchZones, fetchLines, fetchRoles, fetchDepartments,
  type CompanyOption, type BranchOption, type ZoneOption, type LineOption, type RoleOption, type DeptOption,
} from '@/services/dropdownService'

export type { CompanyOption, BranchOption, ZoneOption, LineOption, RoleOption, DeptOption }

interface DropdownOptions {
  companies?:   boolean
  branches?:    boolean
  zones?:       boolean
  lines?:       boolean
  roles?:       boolean
  departments?: boolean
}

export function useDropdownData(options: DropdownOptions) {
  const [companies,   setCompanies]   = useState<CompanyOption[]>([])
  const [branches,    setBranches]    = useState<BranchOption[]>([])
  const [zones,       setZones]       = useState<ZoneOption[]>([])
  const [lines,       setLines]       = useState<LineOption[]>([])
  const [roles,       setRoles]       = useState<RoleOption[]>([])
  const [departments, setDepartments] = useState<DeptOption[]>([])

  useEffect(() => {
    if (options.companies)   fetchCompanies().then(setCompanies).catch(() => {})
    if (options.branches)    fetchBranches().then(setBranches).catch(() => {})
    if (options.zones)       fetchZones().then(setZones).catch(() => {})
    if (options.lines)       fetchLines().then(setLines).catch(() => {})
    if (options.roles)       fetchRoles().then(setRoles).catch(() => {})
    if (options.departments) fetchDepartments().then(setDepartments).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { companies, branches, zones, lines, roles, departments }
}
