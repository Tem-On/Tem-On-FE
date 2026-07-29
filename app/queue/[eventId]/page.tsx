import QueueClient from './QueueClient'

export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function Page() {
  return <QueueClient />
}