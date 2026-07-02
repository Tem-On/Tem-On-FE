'use client'

import { useEffect, useState } from 'react'
import {
  Receipt,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Boxes,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatCard } from '@/components/admin/stat-card'
import { RevenueChart } from '@/components/admin/revenue-chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/status-badge'
import { LiveIndicator } from '@/components/live-indicator'
import { formatKRW, formatNumber, formatDateTime } from '@/lib/format'
import {
  getDashboardStats,
  getRevenueSeries,
  getAdminOrders,
} from '@/services/admin.service'
import type { DashboardStats, Order, RevenuePoint } from '@/types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    getDashboardStats().then(setStats)
    getRevenueSeries().then(setRevenue)
    getAdminOrders().then((o) => setOrders(o.slice(0, 5)))
  }, [])

  return (
    <>
      <AdminHeader
        title="대시보드"
        description="실시간 커머스 운영 현황을 한눈에 확인하세요."
        actions={<LiveIndicator label="실시간" />}
      />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {!stats ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                label="총 주문 수"
                value={formatNumber(stats.totalOrders)}
                icon={Receipt}
                tone="primary"
              />
              <StatCard
                label="총 매출"
                value={formatKRW(stats.totalRevenue)}
                icon={CircleDollarSign}
                tone="success"
              />
              <StatCard
                label="결제 완료"
                value={formatNumber(stats.paidCount)}
                icon={CheckCircle2}
                tone="success"
              />
              <StatCard
                label="주문 취소"
                value={formatNumber(stats.cancelledCount)}
                icon={XCircle}
                tone="danger"
              />
              <StatCard
                label="진행 중 이벤트"
                value={`${stats.activeEvents}개`}
                icon={CalendarClock}
                tone="primary"
              />
              <StatCard
                label="총 판매 수량"
                value={formatNumber(stats.soldQuantity)}
                icon={Boxes}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>주간 매출 추이</CardTitle>
              <CardDescription>최근 7일간 매출 및 주문 현황</CardDescription>
            </CardHeader>
            <CardContent>
              {revenue.length > 0 ? (
                <RevenueChart data={revenue} />
              ) : (
                <Skeleton className="h-64 w-full" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 주문</CardTitle>
              <CardDescription>실시간 유입 주문 내역</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {orders.length === 0
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))
                : orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold">
                          {formatKRW(order.totalAmount)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
