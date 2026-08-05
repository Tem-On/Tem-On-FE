import ProductClient from './ProductClient'

export function generateStaticParams() {
  return Array.from({ length: 31 }, (_, index) => ({
    id: String(index + 1),
  }))
}

export default function Page() {
  return <ProductClient />
}