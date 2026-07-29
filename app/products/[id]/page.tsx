import ProductClient from './ProductClient'

export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function Page() {
  return <ProductClient />
}