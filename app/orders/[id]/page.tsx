import OrderClient from './OrderClient'

export async function generateStaticParams() {
  return [{ id: '1' }]
}

export default function Page() {
  return <OrderClient />
}