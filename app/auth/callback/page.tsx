'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { loginWithKakao } from '@/services/auth.service'
import { notifyAuthChange } from '@/hooks/use-auth'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) {
      return
    }

    ran.current = true

    const code = params.get('code') ?? undefined
    const redirect = params.get('redirect') || '/'

    console.log('[Kakao Callback] 페이지 실행')
    console.log('[Kakao Callback] code 존재 여부:', Boolean(code))
    console.log(
      '[Kakao Callback] API Base URL:',
      process.env.NEXT_PUBLIC_API_BASE_URL,
    )

    if (!code) {
      setError('카카오 인가 코드가 없습니다.')
      return
    }

    loginWithKakao(code)
      .then((user) => {
        console.log('[Kakao Callback] 로그인 성공:', user)
        console.log(
          '[Kakao Callback] access token 저장 여부:',
          Boolean(localStorage.getItem('temon_token')),
        )

        notifyAuthChange()
        router.replace(redirect)
      })
      .catch((cause: unknown) => {
        console.error('[Kakao Callback] 로그인 실패:', cause)

        const message =
          cause instanceof Error
            ? cause.message
            : '카카오 로그인 처리 중 오류가 발생했습니다.'

        setError(message)
      })
  }, [params, router])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Zap className="size-6" />
      </span>

      {error ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-danger">로그인에 실패했습니다.</p>
          <p className="max-w-md text-xs text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="text-sm underline underline-offset-2"
          >
            다시 시도하기
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          로그인 처리 중입니다...
        </div>
      )}
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  )
}