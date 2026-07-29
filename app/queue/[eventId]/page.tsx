import QueueClient from './QueueClient'

export async function generateStaticParams() {
  return [
    { eventId: '1' },
    { eventId: '2' },
  ]
}

export default function QueuePage() {
  return <QueueClient />
}