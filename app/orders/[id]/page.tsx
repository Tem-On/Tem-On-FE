import OrderClient from './OrderClient'

export async function generateStaticParams() {
  return []
}

export default function Page() {
  return <OrderClient />
}