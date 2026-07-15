// ============================================================
// REST API 클라이언트
// 백엔드는 이미 구현되어 있으므로, NEXT_PUBLIC_API_BASE_URL 을
// 설정하면 실제 API 를 호출합니다.
// 값이 없으면 프론트엔드 데모용 mock 데이터를 사용합니다.
// ============================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''

export const USE_MOCK = API_BASE_URL === ''

const TOKEN_KEY = 'temon_token'
const REFRESH_TOKEN_KEY = 'temon_refresh_token'
const USER_KEY = 'temon_user'

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

  /**
   * 인증 토큰.
   * 전달하지 않으면 localStorage에서 조회합니다.
   * null을 명시하면 토큰을 전송하지 않습니다.
   */
  token?: string | null
}

/**
 * 브라우저에 저장된 인증 정보를 모두 삭제합니다.
 */
export function clearStoredSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)

  /*
   * 로그인 상태를 읽는 컴포넌트가 즉시 반응할 수 있도록
   * 사용자 정의 이벤트를 발생시킵니다.
   */
  window.dispatchEvent(new Event('temon-auth-changed'))
}

function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_KEY)
}

/**
 * 현재 요청이 인증 자체를 위한 요청인지 확인합니다.
 *
 * 로그인 API에서 401이 발생했을 때는
 * 강제로 /login으로 이동시키지 않기 위해 사용합니다.
 */
function isAuthRequest(path: string): boolean {
  return (
    path.startsWith('/api/auth/oauth/') ||
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/refresh')
  )
}

/**
 * 401 응답이 발생하면 브라우저의 만료된 로그인 정보를 제거합니다.
 */
function handleUnauthorized(path: string): void {
  if (typeof window === 'undefined') {
    return
  }

  clearStoredSession()

  if (!isAuthRequest(path) && window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

/**
 * 응답 본문에서 오류 메시지를 가져옵니다.
 */
async function getErrorMessage(res: Response): Promise<string> {
  const defaultMessage =
    res.status === 401
      ? '로그인이 만료되었습니다.'
      : res.statusText || '요청 처리 중 오류가 발생했습니다.'

  try {
    const contentType = res.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const data = (await res.json()) as {
        message?: string
        error?: string
      }

      return data.message ?? data.error ?? defaultMessage
    }

    const text = await res.text()
    return text || defaultMessage
  } catch {
    return defaultMessage
  }
}

/**
 * 공통 fetch 래퍼.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options

  /*
   * token이 undefined일 때만 localStorage 토큰을 사용합니다.
   * null을 직접 전달하면 Authorization 헤더를 넣지 않습니다.
   */
  const authToken =
    token === undefined
      ? getToken()
      : token

  let res: Response

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : {}),
        ...headers,
      },
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    })
  } catch {
    throw new ApiError(
      0,
      '서버에 연결할 수 없습니다. 서버 실행 상태를 확인해 주세요.',
    )
  }

  if (!res.ok) {
    const message = await getErrorMessage(res)

    if (res.status === 401) {
      handleUnauthorized(path)
    }

    throw new ApiError(res.status, message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const contentType = res.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return undefined as T
  }

  return (await res.json()) as T
}

/**
 * 데모 모드에서 네트워크 지연을 흉내내는 헬퍼.
 */
export function mockDelay<T>(
  data: T,
  ms = 400,
): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), ms)
  })
}