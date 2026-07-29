'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { EventCard } from '@/components/event-card'
import { PopularProductCard } from '@/components/popular-product-card'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import type { EventProduct, EventSummary } from '@/types'

interface HomeSectionsProps {
  liveEvents: EventSummary[]
  upcomingEvents: EventSummary[]
  popular: EventProduct[]
  showcase: EventProduct[]
}

const ALL = '전체'

export function HomeSections({
  liveEvents,
  upcomingEvents,
  popular,
  showcase,
}: HomeSectionsProps) {
  // 콘텐츠가 있는 섹션만 네비게이션에 노출
  const sections = useMemo(
    () =>
      [
        liveEvents.length > 0 && { id: 'live', label: '진행 중' },
        showcase.length > 0 && { id: 'category', label: '카테고리' },
        popular.length > 0 && { id: 'popular', label: '인기 상품' },
        upcomingEvents.length > 0 && { id: 'upcoming', label: '오픈 예정' },
      ].filter(Boolean) as { id: string; label: string }[],
    [liveEvents.length, showcase.length, popular.length, upcomingEvents.length],
  )

  const [active, setActive] = useState(sections[0]?.id ?? '')
  // 클릭 스크롤 중에는 스파이가 흔들리지 않도록 잠시 잠금
  const lockRef = useRef(false)

  // 카테고리 목록: 전체 + 쇼케이스 상품의 카테고리
  const categories = useMemo(() => {
    const set = new Set<string>()
    showcase.forEach((p) => p.category && set.add(p.category))
    return [ALL, ...Array.from(set)]
  }, [showcase])

  const [category, setCategory] = useState(ALL)
  const filteredShowcase = useMemo(
    () =>
      category === ALL
        ? showcase
        : showcase.filter((p) => p.category === category),
    [showcase, category],
  )

  // ---- 스크롤 스파이 ----
  // IntersectionObserver 대신 스크롤 위치 기반으로 계산한다.
  // 카테고리 필터로 섹션 높이가 급변해도 "기준선 위에 있는 마지막 섹션"을
  // 활성으로 삼기 때문에 잘못된 섹션(예: 인기 상품)으로 튀지 않는다.
  useEffect(() => {
    const computeActive = () => {
      if (lockRef.current) return
      // sticky 네비 하단 기준선
      const line = 160
      // 페이지 최하단에 도달하면 마지막 섹션을 활성화
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      if (atBottom) {
        setActive(sections[sections.length - 1]?.id ?? '')
        return
      }
      let current = sections[0]?.id ?? ''
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top - line <= 0) current = s.id
      }
      setActive(current)
    }
    computeActive()
    window.addEventListener('scroll', computeActive, { passive: true })
    window.addEventListener('resize', computeActive)
    return () => {
      window.removeEventListener('scroll', computeActive)
      window.removeEventListener('resize', computeActive)
    }
  }, [sections])

  // 카테고리 필터 변경 시에는 활성 탭을 '카테고리'로 고정(첫 렌더 제외)
  const didMountRef = useRef(false)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    setActive('category')
    lockRef.current = true
    const t = window.setTimeout(() => {
      lockRef.current = false
    }, 500)
    return () => window.clearTimeout(t)
  }, [category])

  const handleNavClick = useCallback((id: string) => {
    setActive(id)
    lockRef.current = true
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      lockRef.current = false
    }, 700)
  }, [])

  return (
    <>
      {/* 앵커 네비게이션 (스크롤 스파이) */}
      <nav
        aria-label="섹션 이동"
        className="sticky top-16 z-30 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 max-md:top-[6.75rem]"
      >
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto py-2">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleNavClick(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
              className={cn(
                'relative shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                active === s.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <div className="flex flex-col gap-14">
          {liveEvents.length > 0 && (
            <section
              id="live"
              className="flex scroll-mt-40 flex-col gap-5 md:scroll-mt-32"
            >
              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-danger">
                    진행 중인 라이브
                  </span>
                  <h2 className="text-xl font-bold md:text-2xl">
                    지금 참여할 수 있는 이벤트
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/events" />}
                >
                  전체보기
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {liveEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {showcase.length > 0 && (
            <section
              id="category"
              className="flex scroll-mt-40 flex-col gap-5 md:scroll-mt-32"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-primary">
                  카테고리별
                </span>
                <h2 className="text-xl font-bold md:text-2xl">
                  원하는 카테고리를 골라보세요
                </h2>
              </div>
              <ToggleGroup
                value={[category]}
                onValueChange={(value) => {
                  const next = value[value.length - 1]
                  setCategory(next ?? ALL)
                }}
                variant="outline"
                className="flex-wrap"
              >
                {categories.map((c) => (
                  <ToggleGroupItem key={c} value={c}>
                    {c}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {filteredShowcase.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {filteredShowcase.map((product) => (
                    <PopularProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  해당 카테고리에 등록된 상품이 없어요.
                </p>
              )}
            </section>
          )}

          {popular.length > 0 && (
            <section
              id="popular"
              className="flex scroll-mt-40 flex-col gap-5 md:scroll-mt-32"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-primary">
                  인기 상품
                </span>
                <h2 className="text-xl font-bold md:text-2xl">
                  실시간 판매 랭킹
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {popular.map((product, i) => (
                  <PopularProductCard
                    key={product.id}
                    product={product}
                    rank={i + 1}
                  />
                ))}
              </div>
            </section>
          )}

          {upcomingEvents.length > 0 && (
            <section
              id="upcoming"
              className="flex scroll-mt-40 flex-col gap-5 md:scroll-mt-32"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  오픈 예정
                </span>
                <h2 className="text-xl font-bold md:text-2xl">
                  곧 시작하는 이벤트
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
