import QueueClient from './QueueClient'
import { getShowcaseProducts } from '@/services/event.service'

export async function generateStaticParams() {
  try {
    const eventProducts = await getShowcaseProducts()

    return eventProducts.map((product) => ({
      eventId: String(product.id), // event-product의 id
    }))
  } catch (error) {
    console.error('generateStaticParams failed:', error)
    return []
  }
}

export default function QueuePage() {
  return <QueueClient />
}