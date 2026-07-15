'use client'

import {
  useEffect,
  useState,
} from 'react'
import {
  useParams,
  useRouter,
} from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  CreditCard,
  ShieldCheck,
  Timer,
} from 'lucide-react'
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
import {
  getOrder,
  payOrder,
} from '@/services/order.service'
import type {
  Order,
  PaymentMethod,
} from '@/types'

const methods: {
  id: PaymentMethod
  label: string
  desc: string
}[] = [
  {
    id: 'KAKAO_PAY',
    label: '카카오페이',
    desc: '간편결제',
  },
  {
    id: 'NAVER_PAY',
    label: '네이버페이',
    desc: '간편결제',
  },
  {
    id: 'CARD',
    label: '신용/체크카드',
    desc: '일반결제',
  },
]

export default function OrderPaymentPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [order, setOrder] =
    useState<Order | null>(null)

  const [method, setMethod] =
    useState<PaymentMethod>('KAKAO_PAY')

  const [loading, setLoading] =
    useState(true)

  const [paying, setPaying] =
    useState(false)

  const [deadline] = useState(() =>
    new Date(
      Date.now() + 10 * 60 * 1000,
    ).toISOString(),
  )

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)

        const result = await getOrder(
          params.id,
        )

        setOrder(result)
      } catch (error) {
        console.error(
          '주문 조회 실패:',
          error,
        )

        const message =
          error instanceof Error
            ? error.message
            : '주문 정보를 불러오지 못했습니다.'

        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void loadOrder()
  }, [params.id])

  const handlePay = async () => {
    if (!order) {
      toast.error(
        '주문 정보를 찾을 수 없습니다.',
      )
      return
    }

    if (paying) {
      return
    }

    if (order.status !== 'PENDING') {
      toast.error(
        '결제 가능한 주문 상태가 아닙니다.',
      )
      return
    }

    try {
      setPaying(true)

      const payment = await payOrder(
        order.id,
        method,
      )

      console.log(
        '결제 성공 응답:',
        payment,
      )

      toast.success(
        '결제가 완료되었습니다.',
      )

      router.push(
        `/orders/${order.id}/complete`,
      )
    } catch (error) {
      console.error(
        '결제 실패:',
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : '결제에 실패했습니다. 다시 시도해주세요.'

      toast.error(message)
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <ShopShell>
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">
              주문 / 결제
            </h1>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </ShopShell>
    )
  }

  if (!order) {
    return (
      <ShopShell>
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <p className="text-muted-foreground">
                주문 정보를 불러오지 못했습니다.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.back()
                }
              >
                이전 페이지로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </ShopShell>
    )
  }

  return (
    <ShopShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            주문 / 결제
          </h1>

          <span className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger">
            <Timer className="size-4" />

            <Countdown
              target={deadline}
              prefix="결제 마감"
            />
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                주문 상품
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div
                  key={item.eventProductId}
                  className="flex items-center gap-4"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={
                        item.image ||
                        '/placeholder.svg'
                      }
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
                      item.eventPrice *
                        item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                결제 수단
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2.5">
              {methods.map(
                (paymentMethod) => {
                  const active =
                    method ===
                    paymentMethod.id

                  return (
                    <button
                      key={
                        paymentMethod.id
                      }
                      type="button"
                      disabled={paying}
                      onClick={() =>
                        setMethod(
                          paymentMethod.id,
                        )
                      }
                      className={
                        'flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
                        (active
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50')
                      }
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {
                            paymentMethod.label
                          }
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {
                            paymentMethod.desc
                          }
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
                        {active && (
                          <span className="size-2 rounded-full bg-current" />
                        )}
                      </span>
                    </button>
                  )
                },
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  상품 금액
                </span>

                <span>
                  {formatKRW(
                    order.totalAmount,
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  배송비
                </span>

                <span className="text-success">
                  무료
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  총 결제금액
                </span>

                <span className="text-xl font-bold text-primary">
                  {formatKRW(
                    order.totalAmount,
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" />
            안전한 결제 시스템으로 보호되는
            거래입니다.
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={
              paying ||
              order.status !== 'PENDING'
            }
            onClick={handlePay}
          >
            {paying ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <CreditCard data-icon="inline-start" />
            )}

            {paying
              ? '결제 처리 중...'
              : `${formatKRW(
                  order.totalAmount,
                )} 결제하기`}
          </Button>

          {order.status !== 'PENDING' && (
            <p className="text-center text-sm text-destructive">
              현재 주문 상태가{' '}
              {order.status}이므로 결제할 수
              없습니다.
            </p>
          )}
        </div>
      </div>
    </ShopShell>
  )
}