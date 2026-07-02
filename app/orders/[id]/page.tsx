'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { CreditCard, ShieldCheck, Timer } from 'lucide-react'
import { ShopShell } from '@/components/shop-shell'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Countdown } from '@/components/countdown'
import { formatKRW } from '@/lib/format'
import { getOrder, payOrder } from '@/services/order.service'
import type { Order } from '@/types'

const methods = [
  { id: 'kakaopay', label: '카카오페이', desc: '간편결제' },
  { id: 'card', label: '신용/체크카드', desc: '일반결제' },
  { id: 'transfer', label: '계좌이체', desc: '실시간 이체' },
]

export default function OrderPaymentPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [method, setMethod] = useState('kakaopay')
  const [paying, setPaying] = useState(false)
  const [deadline] = useState(() =>
    new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  )

  useEffect(() => {
    getOrder(params.id).then(setOrder)
  }, [params.id])

  const handlePay = async () => {
    if (!order) return
    setPaying(true)
    try {
      await payOrder(order.id)
      router.push(`/orders/${order.id}/complete`)
    } catch {
      toast.error('결제에 실패했습니다. 다시 시도해주세요.')
      setPaying(false)
    }
  }

  return (
    <ShopShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">주문 / 결제</h1>
          <span className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger">
            <Timer className="size-4" />
            <Countdown target={deadline} prefix="결제 마감" />
          </span>
        </div>

        {!order ? (
          <div className="mt-6 flex flex-col gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>주문 상품</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
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
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        수량 {item.quantity}개
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatKRW(item.eventPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>결제 수단</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                {methods.map((m) => {
                  const active = method === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={
                        'flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ' +
                        (active
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50')
                      }
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{m.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {m.desc}
                        </span>
                      </div>
                      <span
                        className={
                          'flex size-5 items-center justify-center rounded-full border ' +
                          (active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30')
                        }
                      >
                        {active && <span className="size-2 rounded-full bg-current" />}
                      </span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">상품 금액</span>
                  <span>{formatKRW(order.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">배송비</span>
                  <span className="text-success">무료</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">총 결제금액</span>
                  <span className="text-xl font-bold text-primary">
                    {formatKRW(order.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" />
              안전한 결제 시스템으로 보호되는 거래입니다.
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={paying}
              onClick={handlePay}
            >
              {paying ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <CreditCard data-icon="inline-start" />
              )}
              {formatKRW(order.totalAmount)} 결제하기
            </Button>
          </div>
        )}
      </div>
    </ShopShell>
  )
}
