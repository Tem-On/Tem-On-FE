import EventProductClient from './EventProductClient'

export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function Page() {
  return <EventProductClient />
}