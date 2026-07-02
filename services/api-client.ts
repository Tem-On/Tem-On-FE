// ============================================================
// REST API 클라이언트
// 백엔드는 이미 구현되어 있으므로, NEXT_PUBLIC_API_BASE_URL 을
// 설정하면 실제 API 를 호출합니다.
// 값이 없으면 프론트엔드 데모용 mock 데이터를 사용합니다.
// ============================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''

export const USE_MOCK = API_BASE_URL === ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** 인증 토큰 (없으면 localStorage 에서 조회) */
  token?: string | null
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('temon_token')
}

/**
 * 공통 fetch 래퍼. 실제 백엔드 연동 지점.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options
  const authToken = token ?? getToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      message = data.message ?? message
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** 데모 모드에서 네트워크 지연을 흉내내는 헬퍼 */
export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}
