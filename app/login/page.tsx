'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Zap, MessageCircle, ShieldCheck, Timer, Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getKakaoAuthorizeUrl } from '@/services/auth.service'

const highlights = [
  { icon: Timer, title: '실시간 대기열', desc: '공정한 선착순 입장 순번' },
  { icon: Boxes, title: '실시간 재고', desc: '초 단위로 갱신되는 재고 현황' },
  { icon: ShieldCheck, title: '안전한 결제', desc: '검증된 결제 시스템' },
]

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleKakao = () => {
    setLoading(true)
    const url = getKakaoAuthorizeUrl()
    if (url.startsWith('/')) {
      router.push(url)
    } else {
      window.location.href = url
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="size-5" />
          </span>
          <span className="text-2xl font-bold tracking-tight">Tem-On</span>
        </Link>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-xl font-bold text-balance">
            실시간 이벤트 커머스, 테몬
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            카카오 계정으로 3초 만에 시작하고 한정 특가에 참여하세요.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border bg-background p-4">
          {highlights.map((h) => (
            <div key={h.title} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <h.icon className="size-4.5" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{h.title}</span>
                <span className="text-xs text-muted-foreground">{h.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={handleKakao}
            disabled={loading}
            className="w-full bg-[#FEE500] text-[#191600] hover:bg-[#FEE500]/90"
          >
            {loading ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <MessageCircle data-icon="inline-start" />
            )}
            카카오로 시작하기
          </Button>
          <p className="text-center text-xs text-muted-foreground text-pretty">
            로그인 시{' '}
            <Link href="#" className="underline underline-offset-2">
              이용약관
            </Link>{' '}
            및{' '}
            <Link href="#" className="underline underline-offset-2">
              개인정보처리방침
            </Link>
            에 동의하게 됩니다.
          </p>
        </div>

        <Link
          href="/"
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          둘러보기로 돌아가기
        </Link>
      </div>
    </main>
  )
}
