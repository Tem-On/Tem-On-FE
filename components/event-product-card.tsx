import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { EventProduct } from '@/types'

export function EventProductCard({ product }: { product: EventProduct }) {
  const discountRate =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.eventPrice) /
            product.originalPrice) *
            100,
        )
      : 0

  return (
    <Card
      size="sm"
      className="group gap-0 overflow-hidden py-0 transition-all hover:ring-2 hover:ring-primary/40"
    >
      <Link href={`/event-products/${product.id}`} className="flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {discountRate > 0 && (
            <div className="absolute left-2 top-2 rounded bg-danger px-2 py-1 text-xs font-bold text-white">
              {discountRate}%
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-2 p-3">
          <p className="text-xs text-muted-foreground">{product.category}</p>

          <h3 className="line-clamp-2 text-sm font-semibold">
            {product.name}
          </h3>

          <div className="flex flex-col">
            {product.originalPrice > product.eventPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}

            <span className="text-base font-bold">
              {product.eventPrice.toLocaleString()}원
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>구매 제한 {product.purchaseLimit ?? 1}개</span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="size-3.5" />
              {product.status}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}