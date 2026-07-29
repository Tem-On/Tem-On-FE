import Link from 'next/link'
import Image from 'next/image'
import { CalendarClock, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EventStatusBadge } from '@/components/status-badge'
import { LiveIndicator } from '@/components/live-indicator'
import { Countdown } from '@/components/countdown'
import { formatDateTime } from '@/lib/format'
import type { EventSummary } from '@/types'

export function EventCard({ event }: { event: EventSummary }) {
  const isOpen = event.status === 'OPEN'

  return (
    <Card
      size="sm"
      className="group gap-0 py-0 transition-all hover:ring-primary/40 hover:ring-2"
    >
      <Link href={`/events/${event.id}`} className="flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={event.image || '/placeholder.svg'}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <EventStatusBadge status={event.status} />
            {isOpen && <LiveIndicator />}
          </div>
        </div>
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="size-3.5" />
            상품 {event.productCount}개
          </div>
          <h3 className="line-clamp-1 text-base font-semibold text-balance">
            {event.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <CalendarClock className="size-3.5 text-muted-foreground" />
            {isOpen ? (
              <span className="font-medium text-danger">
                <Countdown target={event.endAt} prefix="종료까지" />
              </span>
            ) : (
              <span className="text-muted-foreground">
                {formatDateTime(event.startAt)} 오픈
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
