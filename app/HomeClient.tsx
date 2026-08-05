'use client'

import { useCallback, useEffect, useState } from 'react'
import { ShopShell } from '@/components/shop-shell'
import { HeroBanner } from '@/components/hero-banner'
import { HomeSections } from '@/components/home/home-sections'
import { AdminButton } from '@/components/admin-button'
import {
  getEvents,
  getPopularEventProducts,
  getShowcaseProducts,
} from '@/services/event.service'
import type { EventProduct, EventSummary } from '@/types'

const REFRESH_INTERVAL_MS = 30_000

export default function HomeClient() {
  const [events, setEvents] = useState<EventSummary[]>([])
  const [popular, setPopular] = useState<EventProduct[]>([])
  const [showcase, setShowcase] = useState<EventProduct[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHomeData = useCallback(async () => {
    try {
      setError(null)

      const [eventData, popularData, showcaseData] = await Promise.all([
        getEvents(),
        getPopularEventProducts(),
        getShowcaseProducts(),
      ])

      setEvents(eventData)
      setPopular(popularData)
      setShowcase(showcaseData)
    } catch (error) {
      console.error('홈 화면 데이터 조회 실패:', error)
      setError('홈 화면 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHomeData()

    const intervalId = window.setInterval(
      loadHomeData,
      REFRESH_INTERVAL_MS,
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadHomeData])

  const liveEvents = events.filter((event) => event.status === 'OPEN')
  const upcomingEvents = events.filter(
    (event) => event.status === 'UPCOMING',
  )

  const heroEvents =
    liveEvents.length > 0
      ? liveEvents
      : events.slice(0, 3)

  return (
    <ShopShell>
      <div className="mx-auto flex w-full max-w-6xl justify-end px-4 pt-6">
        <AdminButton />
      </div>

      {loading && (
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <p className="text-sm text-muted-foreground">
            홈 화면 정보를 불러오는 중입니다.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <p className="text-sm text-destructive">
            {error}
          </p>

          <button
            type="button"
            onClick={loadHomeData}
            className="mt-3 rounded-md border px-3 py-2 text-sm"
          >
            다시 불러오기
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {heroEvents.length > 0 && (
            <div className="mx-auto w-full max-w-6xl px-4 pt-6 md:pt-10">
              <HeroBanner events={heroEvents} />
            </div>
          )}

          <HomeSections
            liveEvents={liveEvents}
            upcomingEvents={upcomingEvents}
            popular={popular}
            showcase={showcase}
          />
        </>
      )}
    </ShopShell>
  )
}