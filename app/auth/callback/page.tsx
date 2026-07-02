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
  const [error, setError] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const code = params.get('code') ?? undefined
    loginWithKakao(code)
      .then(() => {
        notifyAuthChange()
        const redirect = params.get('redirect') || '/'
        router.replace(redirect)
      })
      .catch(() => setError(true))
  }, [params, router])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Zap className="size-6" />
      </span>
      {error ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-danger">로그인에 실패했습니다.</p>
          <button
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
