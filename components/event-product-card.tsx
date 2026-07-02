'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StockBar } from '@/components/stock-bar'
import { EventProductStatusBadge } from '@/components/status-badge'
import { LiveIndicator } from '@/components/live-indicator'
import { formatKRW, discountRate } from '@/lib/format'
import { subscribeStock } from '@/services/realtime.service'
import type { EventProduct } from '@/types'

export function EventProductCard({ product }: { product: EventProduct }) {
  const router = useRouter()
  const [remaining, setRemaining] = useState(product.remainingStock)
  const [status, setStatus] = useState(product.status)

  useEffect(() => {
    if (product.status !== 'ON_SALE') return
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

  const soldOut = status === 'SOLD_OUT' || remaining <= 0
  const rate = discountRate(product.originalPrice, product.eventPrice)

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3">
          <EventProductStatusBadge status={soldOut ? 'SOLD_OUT' : status} />
        </div>
        {status === 'ON_SALE' && !soldOut && (
          <div className="absolute right-3 top-3">
            <LiveIndicator label="재고 LIVE" />
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-2.5">
        <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          {rate > 0 && (
            <span className="text-base font-bold text-danger">{rate}%</span>
          )}
          <span className="text-lg font-bold">
            {formatKRW(product.eventPrice)}
          </span>
        </div>
        <span className="text-sm text-muted-foreground line-through">
          {formatKRW(product.originalPrice)}
        </span>
        <StockBar remaining={remaining} total={product.totalStock} className="mt-1" />
      </CardContent>

      <CardFooter className="bg-transparent border-0 pt-0">
        <Button
          className="w-full"
          disabled={soldOut || status === 'STOPPED'}
          onClick={() =>
            router.push(`/queue/${product.eventId}?product=${product.id}`)
          }
        >
          <Users data-icon="inline-start" />
          {soldOut ? '품절' : '대기열 입장'}
        </Button>
      </CardFooter>
    </Card>
  )
}
