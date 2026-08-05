import QueueClient from './QueueClient'

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, index) => ({
    eventId: String(index + 1),
  }))
}

export default function QueuePage() {
  return <QueueClient />
}