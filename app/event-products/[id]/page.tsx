import EventProductClient from './EventProductClient'

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, index) => ({
    id: String(index + 1),
  }))
}

export default function Page() {
  return <EventProductClient />
}