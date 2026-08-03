import { ShopShell } from '@/components/shop-shell'
import { EventCard } from '@/components/event-card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { CalendarX } from 'lucide-react'
import { getEvents } from '@/services/event.service'

export const metadata = {
  title: '이벤트 | Tem-On',
}

function Section({
  title,
  accent,
  events,
}: {
  title: string
  accent: string
  events: Awaited<ReturnType<typeof getEvents>>
}) {
  if (events.length === 0) return null
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className={`text-sm font-medium ${accent}`}>{title}</span>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = []

  try {
    events = await getEvents()
  } catch {
    events = []
  }

  const live = events.filter((e) => e.status === 'OPEN')
  const upcoming = events.filter((e) => e.status === 'UPCOMING')
  const closed = events.filter((e) => e.status === 'CLOSED')

  return (
    <ShopShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">전체 이벤트</h1>
          <p className="text-sm text-muted-foreground">
            선착순 라이브 커머스 이벤트에 참여하고 한정 특가 상품을 만나보세요.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-12">
          <Section title="진행 중인 라이브" accent="text-danger" events={live} />
          <Section
            title="오픈 예정"
            accent="text-primary"
            events={upcoming}
          />
          <Section
            title="종료된 이벤트"
            accent="text-muted-foreground"
            events={closed}
          />

          {events.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarX />
                </EmptyMedia>
                <EmptyTitle>진행 중인 이벤트가 없습니다</EmptyTitle>
                <EmptyDescription>
                  새로운 이벤트가 열리면 알려드릴게요.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </ShopShell>
  )
}
