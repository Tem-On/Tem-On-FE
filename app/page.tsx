import { ShopShell } from '@/components/shop-shell'
import { HeroBanner } from '@/components/hero-banner'
import { HomeSections } from '@/components/home/home-sections'
import { AdminButton } from '@/components/admin-button'
import {
  getEvents,
  getPopularEventProducts,
  getShowcaseProducts,
} from '@/services/event.service'

export default async function HomePage() {
  const [events, popular, showcase] = await Promise.all([
    getEvents(),
    getPopularEventProducts(),
    getShowcaseProducts(),
  ])

  const liveEvents = events.filter((e) => e.status === 'OPEN')
  const upcomingEvents = events.filter((e) => e.status === 'UPCOMING')
  const heroEvents = liveEvents.length > 0 ? liveEvents : events.slice(0, 3)

  return (
    <ShopShell>
      <div className="mx-auto flex w-full max-w-6xl justify-end px-4 pt-6">
        <AdminButton />
      </div>

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
    </ShopShell>
  )
}