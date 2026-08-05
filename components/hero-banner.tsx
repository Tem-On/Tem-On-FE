'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveIndicator } from '@/components/live-indicator'
import { Countdown } from '@/components/countdown'
import { cn } from '@/lib/utils'
import type { EventSummary } from '@/types'

const AUTOPLAY_MS = 5000

const EVENT_IMAGES: Record<string, string> = {
  '1': '/images/events/home-living.png',
  '2': '/images/events/tech-friday.png',
}

function HeroSlide({ event, active }: { event: EventSummary; active: boolean }) {

  const eventIdStr = String(event.id)
  const displayImage = EVENT_IMAGES[eventIdStr] || event.image || '/placeholder.svg'

  return (
    <div
      className="relative w-full shrink-0 overflow-hidden"
      aria-hidden={!active}
    >
      <div className="absolute inset-0">
        <Image
          src={displayImage}
          alt=""
          fill
          priority={active}
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
      </div>
      <div className="relative flex flex-col gap-4 px-6 py-12 md:px-12 md:py-20">
        <LiveIndicator className="w-fit bg-background/15 text-background" />
        <h2 className="max-w-xl text-3xl font-bold text-balance md:text-4xl">
          {event.title}
        </h2>
        <p className="max-w-lg text-sm text-background/80 md:text-base">
          {event.description}
        </p>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="rounded-lg bg-background/15 px-3 py-1.5">
            <Countdown target={event.endAt} prefix="종료까지" />
          </span>
        </div>
        <div>
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            tabIndex={active ? 0 : -1}
            render={<Link href={`/events/${event.id}`} />}
          >
            지금 참여하기
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function HeroBanner({ events }: { events: EventSummary[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = events?.length ?? 0

  // 함수형 업데이트로 항상 최신 index를 기준으로 계산한다.
  // (자동 재생 setInterval과 클릭 핸들러가 경쟁해도 stale closure로 되돌아가지 않도록)
  const goTo = useCallback(
    (target: number) => setIndex(((target % count) + count) % count),
    [count],
  )
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  )
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count])

  // 자동 재생 (일시정지 상태가 아니고 슬라이드가 2개 이상일 때만)
  useEffect(() => {
    if (paused || count <= 1) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, count])

  if (count === 0) return null

  return (
    <section
      className="group relative overflow-hidden rounded-2xl bg-foreground text-background"
      aria-roledescription="carousel"
      aria-label="진행 중인 이벤트"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {events.map((event, i) => (
          <HeroSlide key={event.id} event={event} active={i === index} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 이벤트"
            onClick={prev}
            className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-md transition-opacity hover:bg-background/90 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="다음 이벤트"
            onClick={next}
            className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-md transition-opacity hover:bg-background/90 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {events.map((event, i) => (
              <button
                key={event.id}
                type="button"
                aria-label={`${i + 1}번째 이벤트로 이동`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={cn(
                  'h-2 rounded-full bg-background/40 transition-all',
                  i === index ? 'w-6 bg-background' : 'w-2 hover:bg-background/70',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
