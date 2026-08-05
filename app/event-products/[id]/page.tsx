import EventProductClient from './EventProductClient'
import { getEventProducts } from '@/services/event.service'

export async function generateStaticParams() {
  const products = await getEventProducts()

  return products.map((product) => ({
    id: String(product.id),
  }))
}

export default function Page() {
  return <EventProductClient />
}