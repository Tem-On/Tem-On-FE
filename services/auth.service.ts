import type { User } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import { mockUser } from './mock-data'

const TOKEN_KEY = 'temon_token'
const USER_KEY = 'temon_user'

/**
 * 카카오 로그인 시작. 실제 환경에서는 백엔드가 내려주는
 * 카카오 인가 URL 로 리다이렉트합니다.
 */
export function getKakaoAuthorizeUrl(): string {
  if (USE_MOCK) return '/auth/callback?mock=1'
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`
}

/**
 * 카카오 콜백 처리 → 토큰 교환.
 */
export async function loginWithKakao(code?: string): Promise<User> {
  if (USE_MOCK) {
    const user = await mockDelay(mockUser)
    persistSession('mock-token', user)
    return user
  }
  const res = await apiFetch<{ token: string; user: User }>(
    '/api/auth/kakao',
    { method: 'POST', body: { code } },
  )
  persistSession(res.token, res.user)
  return res.user
}

export async function fetchMe(): Promise<User | null> {
  if (USE_MOCK) return getStoredUser()
  return apiFetch<User>('/api/users/me')
}

export async function updateProfile(patch: Partial<User>): Promise<User> {
  if (USE_MOCK) {
    const current = getStoredUser() ?? mockUser
    const updated = { ...current, ...patch }
    persistSession(getToken() ?? 'mock-token', updated)
    return mockDelay(updated, 300)
  }
  return apiFetch<User>('/api/users/me', { method: 'PATCH', body: patch })
}

export function logout() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

// -------- 세션 헬퍼 --------

export function persistSession(token: string, user: User) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

export function isLoggedIn(): boolean {
  return getToken() !== null
}
