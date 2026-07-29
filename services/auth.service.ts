import type { User } from '@/types'
import {
  apiFetch,
  mockDelay,
  USE_MOCK,
  API_BASE_URL,
  clearStoredSession,
} from './api-client'
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

interface JwtPayload {
  exp?: number
  [key: string]: unknown
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

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')

    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const paddedPayload = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '=',
    )

    const decodedPayload = decodeURIComponent(
      Array.from(atob(paddedPayload))
        .map(
          (character) =>
            `%${character.charCodeAt(0)
              .toString(16)
              .padStart(2, '0')}`,
        )
        .join(''),
    )

    return JSON.parse(decodedPayload) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  if (USE_MOCK && token === 'mock-token') {
    return false
  }

  const payload = parseJwtPayload(token)

  if (!payload || typeof payload.exp !== 'number') {
    return true
  }

  return Date.now() >= payload.exp * 1000
}

export function clearSession(): void {
  clearStoredSession()
}

export function getKakaoAuthorizeUrl(): string {
  if (USE_MOCK) {
    return '/auth/callback?mock=1'
  }

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

  if (!code) {
    throw new Error('카카오 인가 코드가 없습니다.')
  }

  const tokenRes = await apiFetch<TokenResponse>(
    `/api/auth/oauth/kakao?code=${encodeURIComponent(code)}`,
    {
      method: 'GET',
    },
  )

  persistSession(tokenRes.accessToken, tokenRes.refreshToken)

  try {
    const user = await fetchMe()

    if (!user) {
      throw new Error('사용자 정보를 가져오지 못했습니다.')
    }

    persistSession(
      tokenRes.accessToken,
      tokenRes.refreshToken,
      user,
    )

    return user
  } catch (error) {
    clearSession()
    throw error
  }
}

export async function fetchMe(): Promise<User | null> {
  if (USE_MOCK) {
    return getStoredUser()
  }

  const token = getToken()

  if (!token || isTokenExpired(token)) {
    clearSession()
    return null
  }

  const res = await apiFetch<UserResponse>('/api/users/me')

  return mapUserResponse(res)
}

export async function updateProfile(
  patch: Partial<User>,
): Promise<User> {
  if (USE_MOCK) {
    const current = getStoredUser() ?? mockUser

    const updated = {
      ...current,
      ...patch,
    }

    persistSession(
      getToken() ?? 'mock-token',
      getRefreshToken() ?? undefined,
      updated,
    )

    return mockDelay(updated, 300)
  }

  const nickname = patch.nickname?.trim()

  if (!nickname) {
    throw new Error('닉네임을 입력해 주세요.')
  }

  const res = await apiFetch<UserResponse>(
    `/api/users/me?nickname=${encodeURIComponent(nickname)}`,
    {
      method: 'PATCH',
    },
  )

  const user = mapUserResponse(res)

  persistSession(
    getToken() ?? '',
    getRefreshToken() ?? undefined,
    user,
  )

  return user
}

/**
 * 현재 로그인한 회원 탈퇴
 *
 * 백엔드:
 * DELETE /api/users/me
 */
export async function withdraw(): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(undefined, 300)
    clearSession()
    return
  }

  await apiFetch<void>('/api/users/me', {
    method: 'DELETE',
  })

  clearSession()
}

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  const token = getToken()

  try {
    if (!USE_MOCK && token && !isTokenExpired(token)) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }
  } catch {
    // 백엔드 로그아웃 요청이 실패하더라도
    // 프론트엔드 세션은 제거합니다.
  } finally {
    clearSession()
  }
}

export function persistSession(
  token: string,
  refreshToken?: string,
  user?: User,
): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(TOKEN_KEY, token)

  if (refreshToken) {
    window.localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken,
    )
  }

  if (user) {
    window.localStorage.setItem(
      USER_KEY,
      JSON.stringify(user),
    )
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = window.localStorage.getItem(TOKEN_KEY)

  if (!token) {
    return null
  }

  if (isTokenExpired(token)) {
    clearSession()
    return null
  }

  return token
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = window.localStorage.getItem(TOKEN_KEY)

  if (!token || isTokenExpired(token)) {
    clearSession()
    return null
  }

  const raw = window.localStorage.getItem(USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as User
  } catch {
    clearSession()
    return null
  }
}

export function isLoggedIn(): boolean {
  const token = getToken()

  return token !== null
}