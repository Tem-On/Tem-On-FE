import { Suspense } from 'react'
import OrderClient from './OrderClient'

export default function OrderPaymentPage() {
  return (
    <Suspense fallback={null}>
      <OrderClient />
    </Suspense>
  )
}