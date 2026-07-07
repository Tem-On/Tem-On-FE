import type { User } from '@/types'
import { apiFetch, mockDelay, USE_MOCK, API_BASE_URL, } from './api-client'
import { mockUser } from './mock-data'

const TOKEN_KEY = 'temon_token'
const REFRESH_TOKEN_KEY = 'temon_refresh_token'
const USER_KEY = 'temon_user'

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID
const KAKAO_REDIRECT_URI =
  process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ||
  'http://localhost:3000/auth/callback'

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

interface UserResponse {
  id: number
  email: string
  nickname: string
  role: string
  status: string
}

function mapUserResponse(res: UserResponse): User {
  return {
    id: String(res.id),
    nickname: res.nickname,
    email: res.email ?? '',
    profileImage: '',
    phone: '',
    point: 0,
    createdAt: '',
  }
}

export function getKakaoAuthorizeUrl(): string {
  if (USE_MOCK) return '/auth/callback?mock=1'

  return (
    'https://kauth.kakao.com/oauth/authorize' +
    `?client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
    '&response_type=code'
  )
}

export async function loginWithKakao(code?: string): Promise<User> {
  if (USE_MOCK) {
    const user = await mockDelay(mockUser)
    persistSession('mock-token', undefined, user)
    return user
  }

  const tokenRes = await apiFetch<TokenResponse>(
    `/api/auth/oauth/kakao?code=${code}`,
    {
      method: 'GET',
    },
  )

  persistSession(tokenRes.accessToken, tokenRes.refreshToken)

  const user = await fetchMe()

  if (!user) {
    throw new Error('사용자 정보를 가져오지 못했습니다.')
  }

  persistSession(tokenRes.accessToken, tokenRes.refreshToken, user)

  return user
}

export async function fetchMe(): Promise<User | null> {
  if (USE_MOCK) return getStoredUser()

  const res = await apiFetch<UserResponse>('/api/users/me')
  return mapUserResponse(res)
}

export async function updateProfile(patch: Partial<User>): Promise<User> {
  if (USE_MOCK) {
    const current = getStoredUser() ?? mockUser
    const updated = { ...current, ...patch }
    persistSession(getToken() ?? 'mock-token', getRefreshToken() ?? undefined, updated)
    return mockDelay(updated, 300)
  }

  const res = await apiFetch<UserResponse>(
    `/api/users/me?nickname=${encodeURIComponent(patch.nickname ?? '')}`,
    {
      method: 'PATCH',
    },
  )

  const user = mapUserResponse(res)
    persistSession(getToken() ?? '', getRefreshToken() ?? undefined, user)

    return user
  }

  export async function logout() {
    if (typeof window === 'undefined') return

    const token = getToken()

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    } catch {
     
    } finally {
      window.localStorage.removeItem(TOKEN_KEY)
      window.localStorage.removeItem(REFRESH_TOKEN_KEY)
      window.localStorage.removeItem(USER_KEY)
    }
}

export function persistSession(token: string, refreshToken?: string, user?: User) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(TOKEN_KEY, token)

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

export function isLoggedIn(): boolean {
  return getToken() !== null
}