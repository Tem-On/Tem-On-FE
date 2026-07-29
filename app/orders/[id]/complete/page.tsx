'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Package, Receipt } from 'lucide-react'
import { ShopShell } from '@/components/shop-shell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/status-badge'
import { formatKRW, formatDateTime } from '@/lib/format'
import { getOrder } from '@/services/order.service'
import type { Order } from '@/types'

export default function OrderCompletePage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    getOrder(params.id).then((o) =>
      setOrder({
        ...o,
        status: 'PAID',
        paidAt: o.paidAt ?? new Date().toISOString(),
      }),
    )
  }, [params.id])

  return (
    <ShopShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-9" />
          </span>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              결제가 완료되었습니다
            </h1>

            <p className="text-pretty text-sm text-muted-foreground">
              선착순 구매에 성공했어요! 주문 내역을 확인해보세요.
            </p>
          </div>
        </div>

        {!order ? (
          <Skeleton className="mt-8 h-56 w-full rounded-xl" />
        ) : (
          <Card className="mt-8">
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="size-4" />
                  {order.orderNumber}
                </div>

                <OrderStatusBadge status={order.status} />
              </div>

              <Separator />

              {order.items.map((item) => (
                <div
                  key={item.eventProductId}
                  className="flex items-center gap-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">
                      {item.name}
                    </span>

                    <span className="text-sm text-muted-foreground">
                      수량 {item.quantity}개
                    </span>
                  </div>

                  <span className="font-semibold">
                    {formatKRW(
                      item.eventPrice * item.quantity,
                    )}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    결제일시
                  </span>

                  <span>
                    {order.paidAt
                      ? formatDateTime(order.paidAt)
                      : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    총 결제금액
                  </span>

                  <span className="text-lg font-bold text-primary">
                    {formatKRW(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href="/events" />}
          >
            계속 쇼핑하기
          </Button>

          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href="/mypage" />}
          >
            <Package data-icon="inline-start" />
            주문 내역 보기
          </Button>
        </div>
      </div>
    </ShopShell>
  )
}