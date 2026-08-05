import ProductClient from './ProductClient'
import { getShowcaseProducts } from '@/services/event.service'

export async function generateStaticParams() {
  try {
    const products = await getShowcaseProducts()

    return products.map((product) => ({
      id: String(product.productId),
    }))
  } catch (error) {
    console.error('generateStaticParams failed:', error)
    return []
  }
}

export default function Page() {
  return <ProductClient />
}