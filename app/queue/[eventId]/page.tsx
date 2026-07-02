'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Users, Clock, ArrowLeft, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { LiveIndicator } from '@/components/live-indicator'
import { formatNumber, formatDuration } from '@/lib/format'
import { enterQueue, leaveQueue } from '@/services/queue.service'
import { subscribeQueue } from '@/services/realtime.service'
import type { QueueState } from '@/types'

function QueueRing({
  position,
  total,
}: {
  position: number
  total: number
}) {
  const progressed = total > 0 ? Math.min(1, (total - position) / total) : 0
  const size = 220
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progressed)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          내 대기 순번
        </span>
        <span className="font-mono text-4xl font-bold tabular-nums">
          {formatNumber(position)}
        </span>
        <span className="text-xs text-muted-foreground">번째</span>
      </div>
    </div>
  )
}

function QueueInner() {
  const router = useRouter()
  const params = useParams<{ eventId: string }>()
  const search = useSearchParams()
  const eventId = params.eventId
  const productId = search.get('product') ?? undefined

  const [state, setState] = useState<QueueState | null>(null)
  const [entering, setEntering] = useState(false)
  const enteredRef = useRef(false)

  useEffect(() => {
    let unsub: (() => void) | undefined
    enterQueue(eventId, productId).then((initial) => {
      setState(initial)
      unsub = subscribeQueue(
        eventId,
        (msg) => {
          setState((prev) => ({
            ...(prev as QueueState),
            position: msg.position,
            totalWaiting: msg.totalWaiting,
            estimatedSeconds: msg.estimatedSeconds,
            canEnter: msg.canEnter,
            status: msg.status,
          }))
        },
        { position: initial.position, totalWaiting: initial.totalWaiting },
      )
    })
    return () => unsub?.()
  }, [eventId, productId])

  // 입장 가능 상태가 되면 자동으로 상품 페이지로 이동
  useEffect(() => {
    if (state?.canEnter && !enteredRef.current) {
      enteredRef.current = true
      setEntering(true)
      const t = setTimeout(() => {
        if (productId) {
          router.replace(`/products/${productId}?entered=1`)
        } else {
          router.replace(`/events/${eventId}?entered=1`)
        }
      }, 1400)
      return () => clearTimeout(t)
    }
  }, [state?.canEnter, productId, eventId, router])

  const handleLeave = async () => {
    await leaveQueue(eventId)
    router.replace(`/events/${eventId}`)
  }

  const canEnter = state?.canEnter

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-3xl border bg-background p-8 text-center shadow-sm">
        {!state ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Spinner className="size-6" />
            <p className="text-sm text-muted-foreground">
              대기열에 입장하는 중입니다...
            </p>
          </div>
        ) : canEnter ? (
          <div className="flex flex-col items-center gap-5 py-8">
            <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
              <PartyPopper className="size-8" />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">입장 순서가 되었습니다!</h1>
              <p className="text-sm text-muted-foreground">
                구매 페이지로 이동합니다.
              </p>
            </div>
            {entering && <Spinner className="size-5" />}
          </div>
        ) : (
          <>
            <LiveIndicator label="대기열 LIVE" />
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-bold text-balance">
                잠시만 기다려주세요
              </h1>
              <p className="text-sm text-muted-foreground text-pretty">
                공정한 선착순 입장을 위해 대기열을 운영하고 있습니다.
              </p>
            </div>

            <QueueRing
              position={state.position}
              total={state.totalWaiting}
            />

            <div className="grid w-full grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-4">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-mono text-lg font-bold tabular-nums">
                  {formatNumber(state.totalWaiting)}
                </span>
                <span className="text-xs text-muted-foreground">
                  총 대기 인원
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-4">
                <Clock className="size-4 text-muted-foreground" />
                <span className="font-mono text-lg font-bold tabular-nums">
                  {formatDuration(state.estimatedSeconds)}
                </span>
                <span className="text-xs text-muted-foreground">
                  예상 대기 시간
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-pretty">
              이 페이지를 벗어나면 대기 순번이 사라집니다. 창을 닫지 말고
              기다려주세요.
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              className="text-muted-foreground"
            >
              <ArrowLeft data-icon="inline-start" />
              대기 취소하고 나가기
            </Button>
          </>
        )}
      </div>

      <Button
        variant="link"
        size="sm"
        className="mt-4 text-muted-foreground"
        nativeButton={false}
        render={<Link href="/events" />}
      >
        다른 이벤트 보기
      </Button>
    </main>
  )
}

export default function QueuePage() {
  return (
    <Suspense fallback={null}>
      <QueueInner />
    </Suspense>
  )
}
