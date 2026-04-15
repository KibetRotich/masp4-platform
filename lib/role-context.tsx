'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Role = 'admin' | 'me_officer' | 'viewer'

interface RoleCtx {
  role:     Role
  canEdit:  boolean   // admin or me_officer
  loading:  boolean
  email:    string | null
}

const RoleContext = createContext<RoleCtx>({ role: 'viewer', canEdit: false, loading: true, email: null })

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [ctx, setCtx] = useState<RoleCtx>({ role: 'viewer', canEdit: false, loading: true, email: null })

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(d => {
        const role: Role = d.role ?? 'viewer'
        setCtx({ role, canEdit: role === 'admin' || role === 'me_officer', loading: false, email: d.email ?? null })
      })
      .catch(() => setCtx({ role: 'viewer', canEdit: false, loading: false, email: null }))
  }, [])

  return <RoleContext.Provider value={ctx}>{children}</RoleContext.Provider>
}

export function useRole() { return useContext(RoleContext) }
