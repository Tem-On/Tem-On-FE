'use client' 

import { useParams, notFound } from 'next/navigation' 
import { useEffect, useState } from 'react' 
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ShopShell } from '@/components/shop-shell'
import { Button } from '@/components/ui/button'
import { getEventProduct } from '@/services/event.service'

export default function EventProductClient() {
  const params = useParams<{ id: string }>() 
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    getEventProduct(params.id)
      .then((data) => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [params?.id])

  if (loading) return null

  if (!product) return notFound()

  const discount =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.eventPrice) /
            product.originalPrice) *
            100,
        )
      : 0

  return (
    <ShopShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href={`/events/${product.eventId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            이벤트로 돌아가기
          </Button>
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border">
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              {product.category}
            </p>

            <h1 className="text-3xl font-bold">{product.name}</h1>

            {discount > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-500">
                  {discount}%
                </span>

                <span className="text-lg text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
              </div>
            )}

            <div className="text-4xl font-bold">
              {product.eventPrice.toLocaleString()}원
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex justify-between">
                <span>구매 제한</span>
                <span>{product.purchaseLimit ?? 1}개</span>
              </div>

              <div className="flex justify-between">
                <span>재고</span>
                <span>{product.remainingStock}개</span>
              </div>

              <div className="flex justify-between">
                <span>판매량</span>
                <span>{product.soldCount}개</span>
              </div>

              <div className="flex justify-between">
                <span>상태</span>
                <span>{product.status}</span>
              </div>
            </div>

            <Link href={`/queue/${product.eventId}?product=${product.id}`}>
              <Button className="w-full">대기열 입장</Button>
            </Link>
          </div>
        </div>
      </div>
    </ShopShell>
  )
}