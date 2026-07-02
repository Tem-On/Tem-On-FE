'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Coins, LogOut, ShoppingBag } from 'lucide-react'
import { ShopShell } from '@/components/shop-shell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { OrderStatusBadge } from '@/components/status-badge'
import { formatKRW, formatDateTime, formatNumber } from '@/lib/format'
import { getMyOrders } from '@/services/order.service'
import { useAuth } from '@/hooks/use-auth'
import type { Order } from '@/types'

export default function MyPage() {
  const router = useRouter()
  const { user, isLoggedIn, ready, logout } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace('/login')
    }
  }, [ready, isLoggedIn, router])

  useEffect(() => {
    if (isLoggedIn) getMyOrders().then(setOrders)
  }, [isLoggedIn])

  if (!ready || !isLoggedIn) {
    return (
      <ShopShell>
        <div className="mx-auto w-full max-w-4xl px-4 py-10">
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </ShopShell>
    )
  }

  return (
    <ShopShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
        <div className="flex flex-col gap-8">
          <Card>
            <CardContent className="flex flex-col items-start gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarImage src={user?.profileImage} alt="" />
                  <AvatarFallback className="text-lg">
                    {user?.nickname?.[0] ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold">{user?.nickname}</span>
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-primary">
                  <Coins className="size-5" />
                  <div className="flex flex-col">
                    <span className="text-xs">보유 포인트</span>
                    <span className="font-bold tabular-nums">
                      {formatNumber(user?.point ?? 0)}P
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={logout}
                  aria-label="로그아웃"
                >
                  <LogOut />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Package className="size-5" />
              <h2 className="text-xl font-bold">주문 내역</h2>
            </div>

            {orders === null ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : orders.length === 0 ? (
              <Empty className="rounded-xl border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingBag />
                  </EmptyMedia>
                  <EmptyTitle>아직 주문 내역이 없습니다</EmptyTitle>
                  <EmptyDescription>
                    진행 중인 이벤트에서 첫 구매를 시작해보세요.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button nativeButton={false} render={<Link href="/events" />}>
                    이벤트 보러가기
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
                    <div className="flex flex-col gap-0.5">
                      <CardTitle className="text-sm text-muted-foreground">
                        {order.orderNumber}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Separator />
                    {order.items.map((item) => (
                      <div
                        key={item.eventProductId}
                        className="flex items-center gap-3"
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatKRW(item.eventPrice)} · {item.quantity}개
                          </span>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        총 결제금액
                      </span>
                      <span className="font-bold">
                        {formatKRW(order.totalAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ShopShell>
  )
}
