import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CalendarClock, Package } from 'lucide-react'
import { ShopShell } from '@/components/shop-shell'
import { EventProductCard } from '@/components/event-product-card'
import { EventStatusBadge } from '@/components/status-badge'
import { LiveIndicator } from '@/components/live-indicator'
import { Countdown } from '@/components/countdown'
import { formatDateTime } from '@/lib/format'
import { getEventDetail } from '@/services/event.service'

const EVENT_IMAGES: Record<string, string> = {
  '1': '/images/events/home-living.png',
  '2': '/images/events/tech-friday.png',
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let event

  try {
    event = await getEventDetail(id)
  } catch {
    notFound()
  }

  const displayImage = EVENT_IMAGES[id] || event.image || '/placeholder.svg'

  const isOpen = event.status === 'OPEN'

  return (
    <ShopShell>
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0">
          <Image
            src={displayImage}
            alt={event.title || '이벤트 이미지'}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/40" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 md:py-16">
          <div className="flex items-center gap-2">
            <EventStatusBadge status={event.status} />
            {isOpen && (
              <LiveIndicator className="bg-background/15 text-background" />
            )}
          </div>

          <h1 className="max-w-2xl text-3xl font-bold text-balance md:text-4xl">
            {event.title}
          </h1>

          <p className="max-w-xl text-sm text-background/80 md:text-base">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Package className="size-4" />
              상품 {event.productCount}개
            </span>

            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              {isOpen ? (
                <Countdown target={event.endAt} prefix="종료까지" />
              ) : (
                `${formatDateTime(event.startAt)} 오픈`
              )}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold md:text-2xl">이벤트 상품</h2>
            <p className="text-sm text-muted-foreground">
              재고는 실시간으로 변동됩니다. 원하는 상품의 대기열에 입장하세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {event.products.map((product) => (
              <EventProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </ShopShell>
  )
}

export async function generateStaticParams() {
  const response = await fetch(
    'https://api.temon.shop/api/events'
  )

  const events: Array<{ id: number }> = await response.json()

  return events.map((event) => ({
    id: String(event.id),
  }))
}