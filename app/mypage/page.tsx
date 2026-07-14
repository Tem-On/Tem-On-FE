'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Coins,
  LogOut,
  ShoppingBag,
  Pencil,
  UserRoundX,
} from 'lucide-react'
import { toast } from 'sonner'
import { ShopShell } from '@/components/shop-shell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { OrderStatusBadge } from '@/components/status-badge'
import {
  formatKRW,
  formatDateTime,
  formatNumber,
} from '@/lib/format'
import { getMyOrders } from '@/services/order.service'
import {
  updateProfile,
  withdraw,
} from '@/services/auth.service'
import {
  notifyAuthChange,
  useAuth,
} from '@/hooks/use-auth'
import type { Order } from '@/types'

export default function MyPage() {
  const router = useRouter()

  const {
    user,
    isLoggedIn,
    ready,
    logout,
  } = useAuth()

  const [orders, setOrders] = useState<Order[] | null>(null)

  const [isEditingNickname, setIsEditingNickname] =
    useState(false)

  const [nickname, setNickname] = useState('')

  const [isUpdatingNickname, setIsUpdatingNickname] =
    useState(false)

  const [isWithdrawing, setIsWithdrawing] =
    useState(false)

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace('/login')
    }
  }, [ready, isLoggedIn, router])

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    getMyOrders()
      .then(setOrders)
      .catch((error) => {
        console.error(error)
        setOrders([])
        toast.error('주문 내역을 불러오지 못했습니다.')
      })
  }, [isLoggedIn])

  useEffect(() => {
    setNickname(user?.nickname ?? '')
  }, [user])

  const handleStartNicknameEdit = () => {
    setNickname(user?.nickname ?? '')
    setIsEditingNickname(true)
  }

  const handleCancelNicknameEdit = () => {
    setNickname(user?.nickname ?? '')
    setIsEditingNickname(false)
  }

  const handleUpdateNickname = async () => {
    const trimmedNickname = nickname.trim()

    if (!trimmedNickname) {
      toast.error('닉네임을 입력해 주세요.')
      return
    }

    if (trimmedNickname === user?.nickname) {
      toast.error('현재 닉네임과 동일합니다.')
      return
    }

    try {
      setIsUpdatingNickname(true)

      await updateProfile({
        nickname: trimmedNickname,
      })

      notifyAuthChange()
      setIsEditingNickname(false)

      toast.success('닉네임이 변경되었습니다.')
    } catch (error) {
      console.error(error)

      const message =
        error instanceof Error
          ? error.message
          : '닉네임 변경에 실패했습니다.'

      toast.error(message)
    } finally {
      setIsUpdatingNickname(false)
    }
  }

  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      '정말 회원 탈퇴하시겠습니까?\n탈퇴한 계정은 복구할 수 없습니다.',
    )

    if (!confirmed) {
      return
    }

    const doubleConfirmed = window.confirm(
      '회원 탈퇴를 진행하면 현재 계정에서 로그아웃됩니다.\n계속하시겠습니까?',
    )

    if (!doubleConfirmed) {
      return
    }

    try {
      setIsWithdrawing(true)

      await withdraw()

      notifyAuthChange()

      toast.success('회원 탈퇴가 완료되었습니다.')

      router.replace('/')
      router.refresh()
    } catch (error) {
      console.error(error)

      const message =
        error instanceof Error
          ? error.message
          : '회원 탈퇴에 실패했습니다.'

      toast.error(message)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.replace('/')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('로그아웃에 실패했습니다.')
    }
  }

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
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                    <AvatarImage
                      src={user?.profileImage}
                      alt={user?.nickname ?? '사용자'}
                    />

                    <AvatarFallback className="text-lg">
                      {user?.nickname?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-lg font-bold">
                      {user?.nickname}
                    </span>

                    <span className="text-sm text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-primary">
                    <Coins className="size-5" />

                    <div className="flex flex-col">
                      <span className="text-xs">
                        보유 포인트
                      </span>

                      <span className="font-bold tabular-nums">
                        {formatNumber(user?.point ?? 0)}P
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleLogout}
                    aria-label="로그아웃"
                  >
                    <LogOut />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold">
                    프로필 관리
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    마이페이지에 표시되는 닉네임을 변경할 수
                    있습니다.
                  </p>
                </div>

                {isEditingNickname ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(event) =>
                        setNickname(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          !isUpdatingNickname
                        ) {
                          void handleUpdateNickname()
                        }

                        if (event.key === 'Escape') {
                          handleCancelNicknameEdit()
                        }
                      }}
                      maxLength={20}
                      disabled={isUpdatingNickname}
                      placeholder="새 닉네임을 입력하세요"
                      className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleUpdateNickname}
                        disabled={isUpdatingNickname}
                      >
                        {isUpdatingNickname
                          ? '변경 중...'
                          : '저장'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelNicknameEdit}
                        disabled={isUpdatingNickname}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        현재 닉네임
                      </span>

                      <span className="font-medium">
                        {user?.nickname}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleStartNicknameEdit}
                    >
                      <Pencil className="size-4" />
                      닉네임 변경
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold text-destructive">
                    계정 관리
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    회원 탈퇴 시 계정을 다시 복구할 수 없습니다.
                  </p>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      회원 탈퇴
                    </span>

                    <span className="text-sm text-muted-foreground">
                      TEM-ON 계정 이용을 종료합니다.
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                  >
                    <UserRoundX className="size-4" />

                    {isWithdrawing
                      ? '탈퇴 처리 중...'
                      : '회원 탈퇴'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Package className="size-5" />
              <h2 className="text-xl font-bold">
                주문 내역
              </h2>
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

                  <EmptyTitle>
                    아직 주문 내역이 없습니다
                  </EmptyTitle>

                  <EmptyDescription>
                    진행 중인 이벤트에서 첫 구매를 시작해보세요.
                  </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                  <Button
                    nativeButton={false}
                    render={<Link href="/events" />}
                  >
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

                    <OrderStatusBadge
                      status={order.status}
                    />
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
                            src={
                              item.image ||
                              '/placeholder.svg'
                            }
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
                            {formatKRW(item.eventPrice)} ·{' '}
                            {item.quantity}개
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