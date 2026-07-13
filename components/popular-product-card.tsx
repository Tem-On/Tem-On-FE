import Link from 'next/link'
import Image from 'next/image'
import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EventProductStatusBadge } from '@/components/status-badge'
import { formatKRW, formatNumber, discountRate } from '@/lib/format'
import type { EventProduct } from '@/types'

export function PopularProductCard({
  product,
  rank,
}: {
  product: EventProduct
  rank?: number
}) {
  const rate = discountRate(product.originalPrice, product.eventPrice)

  return (
    <Card size="sm" className="group gap-0 py-0">
      <Link
        href={`/event-products/${product.id}`}
        className="flex flex-col"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {rank !== undefined && (
            <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
              {rank}
            </span>
          )}
          <div className="absolute right-2 top-2">
            <EventProductStatusBadge status={product.status} />
          </div>
        </div>
        <CardContent className="flex flex-col gap-1.5 py-3">
          <div className="flex items-center gap-1 text-xs font-medium text-danger">
            <Flame className="size-3.5" />
            {formatNumber(product.soldCount)}개 판매
          </div>
          <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
          <div className="flex items-baseline gap-1.5">
            {rate > 0 && (
              <span className="text-sm font-bold text-danger">{rate}%</span>
            )}
            <span className="text-base font-bold">
              {formatKRW(product.eventPrice)}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
