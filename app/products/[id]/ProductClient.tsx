'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react'
import { ShopShell } from '@/components/shop-shell'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { StockBar } from '@/components/stock-bar'
import { EventProductStatusBadge } from '@/components/status-badge'
import { LiveIndicator } from '@/components/live-indicator'
import { formatKRW, discountRate } from '@/lib/format'
import { getEventProduct } from '@/services/event.service'
import { createOrder } from '@/services/order.service'
import { subscribeStock } from '@/services/realtime.service'
import { useAuth } from '@/hooks/use-auth'
import type { EventProduct } from '@/types'

function ProductInner() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { isLoggedIn, ready } = useAuth()

  const [product, setProduct] = useState<EventProduct | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [status, setStatus] = useState<EventProduct['status']>('ON_SALE')
  const [qty, setQty] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getEventProduct(params.id).then((p) => {
      setProduct(p)
      setRemaining(p.remainingStock)
      setStatus(p.status)
    })
  }, [params.id])

  useEffect(() => {
    if (!product || product.status !== 'ON_SALE') return
    const unsub = subscribeStock(
      product.id,
      (msg) => {
        setRemaining(msg.remainingStock)
        setStatus(msg.status)
      },
      {
        remainingStock: product.remainingStock,
        reservedStock: product.reservedStock,
        soldCount: product.soldCount,
      },
    )
    return unsub
  }, [product])

  if (!product) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  const soldOut = status === 'SOLD_OUT' || remaining <= 0
  const rate = discountRate(product.originalPrice, product.eventPrice)

  const maxQty = Math.min(
    product.purchaseLimit ?? 1,
    Math.max(1, remaining),
  )

  const total = product.eventPrice * qty

  const handleOrder = async () => {
    if (!ready) return
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.')
      router.push('/login')
      return
    }
    setSubmitting(true)
    try {
      const order = await createOrder({
        items: [
          {
            eventProductId: product.id,
            name: product.name,
            image: product.image,
            eventPrice: product.eventPrice,
            quantity: qty,
          },
        ],
      })
      router.push(
        `/orders/payment?orderId=${encodeURIComponent(order.id)}`,
      )
    } catch {
      toast.error('주문 생성에 실패했습니다. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft data-icon="inline-start" />
        뒤로
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <EventProductStatusBadge status={soldOut ? 'SOLD_OUT' : status} />
            {!soldOut && status === 'ON_SALE' && (
              <LiveIndicator label="재고 LIVE" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-balance">{product.name}</h1>
            {product.description && (
              <p className="text-sm text-muted-foreground text-pretty">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            {rate > 0 && (
              <span className="text-2xl font-bold text-danger">{rate}%</span>
            )}
            <span className="text-3xl font-bold">
              {formatKRW(product.eventPrice)}
            </span>
          </div>
          <span className="-mt-3 text-sm text-muted-foreground line-through">
            정가 {formatKRW(product.originalPrice)}
          </span>

          <StockBar remaining={remaining} total={product.totalStock} />

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">수량</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                disabled={qty <= 1 || soldOut}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="수량 감소"
              >
                <Minus />
              </Button>
              <span className="w-8 text-center font-mono text-lg font-semibold tabular-nums">
                {qty}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={qty >= maxQty || soldOut}
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                aria-label="수량 증가"
              >
                <Plus />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">총 결제금액</span>
            <span className="text-xl font-bold">{formatKRW(total)}</span>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={soldOut || submitting}
            onClick={handleOrder}
          >
            {submitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <ShoppingBag data-icon="inline-start" />
            )}
            {soldOut ? '품절된 상품입니다' : '바로 구매하기'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            재고가 실시간으로 변동되어 결제 중 품절될 수 있습니다.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          render={<Link href="/events" />}
        >
          다른 이벤트 둘러보기
        </Button>
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <ShopShell>
      <Suspense fallback={null}>
        <ProductInner />
      </Suspense>
    </ShopShell>
  )
}