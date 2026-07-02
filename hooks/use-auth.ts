'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@/types'
import {
  getStoredUser,
  logout as logoutService,
} from '@/services/auth.service'

const AUTH_EVENT = 'temon-auth-change'

/** localStorage 기반 클라이언트 인증 상태 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setReady(true)
    const sync = () => setUser(getStoredUser())
    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const logout = useCallback(() => {
    logoutService()
    window.dispatchEvent(new Event(AUTH_EVENT))
  }, [])

  return { user, isLoggedIn: !!user, ready, logout }
}

/** 로그인/프로필 변경 후 헤더 등 구독자에게 알림 */
export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT))
}
