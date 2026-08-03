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
  // =========================================================================
  // 1. [디버깅 로그] GitHub Actions 빌드 콘솔에서 어떤 URL을 호출하는지 확인
  // =========================================================================
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  console.log('==================================================')
  console.log('[BUILD DEBUG] 현재 환경변수 API BASE URL:', baseUrl)
  console.log('[BUILD DEBUG] 실제 호출되는 전체 URL:', `${baseUrl}/api/events`)
  console.log('==================================================')

  // =========================================================================
  // 2. [빌드 에러 방어] try-catch 추가
  //    백엔드가 401을 주거나 꺼져있어도 빌드가 멈추지 않고 빈 배열로 정적 생성 진행
  // =========================================================================
  let events: Awaited<ReturnType<typeof getEvents>> = []

  try {
    events = await getEvents()
  } catch (error) {
    console.warn('[BUILD WARN] 빌드 시점 API 호출 실패. 빈 목록으로 페이지를 생성합니다.', error)
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
