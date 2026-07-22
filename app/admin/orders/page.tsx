'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminHeader } from '@/components/admin/admin-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderStatusBadge } from '@/components/status-badge'
import { orderStatusMeta } from '@/lib/status'
import { formatKRW, formatDateTime } from '@/lib/format'
import { getAdminOrders, updateOrderStatus } from '@/services/admin.service'
import type { OrderStatus } from '@/types'

// 💡 백엔드 응답 DTO 타입 정의
export interface BackendOrderItemResponse {
  id?: number
  name?: string
  productName?: string
  price?: number
  quantity?: number
}

export interface BackendOrderResponse {
  orderId: number
  userId: number
  orderNumber: string
  totalAmount: number
  status: string
  orderedAt: string
  canceledAt?: string | null
  paymentId?: number | null
  items: BackendOrderItemResponse[]
}

// Spring Data Page 응답 타입
export interface PageResponse<T> {
  content: T[]
  totalPages?: number
  totalElements?: number
}

const statusOptions = Object.keys(orderStatusMeta) as OrderStatus[]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<BackendOrderResponse[] | null>(null)

  useEffect(() => {
    getAdminOrders().then((data: BackendOrderResponse[] | PageResponse<BackendOrderResponse> | any) => {
      // 배열로 올 경우와 Page 객체({ content: [...] })로 올 경우 모두 대응
      if (Array.isArray(data)) {
        setOrders(data)
      } else if (data && Array.isArray(data.content)) {
        setOrders(data.content)
      } else {
        setOrders([])
      }
    })
  }, [])

  const handleChange = async (order: BackendOrderResponse, status: OrderStatus) => {
    const targetId = order.orderId

    if (!targetId) {
      toast.error('주문 식별자(ID)를 찾을 수 없습니다.')
      return
    }

    const previousStatus = order.status

    // 1. 낙관적 UI 업데이트
    setOrders((prev) =>
      prev
        ? prev.map((o) => (o.orderId === targetId ? { ...o, status } : o))
        : prev,
    )

    try {
      // 2. 백엔드 API 요청
      await updateOrderStatus(targetId, status)
      toast.success('주문 상태가 변경되었습니다.')
    } catch (error: any) {
      // 3. 실패 시 이전 상태로 원복
      setOrders((prev) =>
        prev
          ? prev.map((o) =>
              o.orderId === targetId ? { ...o, status: previousStatus } : o,
            )
          : prev,
      )
      toast.error(error?.message || '주문 상태 변경에 실패했습니다.')
      console.error('Update order status failed:', error)
    }
  }

  return (
    <>
      <AdminHeader
        title="주문 관리"
        description="주문 내역을 확인하고 배송 상태를 관리합니다."
      />
      <div className="p-4 md:p-6">
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>주문일시</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="w-40">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!orders
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : orders.map((o) => {
                    const items = o.items ?? []
                    const firstItemName =
                      items[0]?.name ?? items[0]?.productName ?? '상품 정보 없음'
                    const extraCount = items.length - 1

                    return (
                      <TableRow key={o.orderId ?? o.orderNumber}>
                        <TableCell className="font-mono text-sm">
                          {o.orderNumber}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {firstItemName}
                            {extraCount > 0 && ` 외 ${extraCount}건`}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(o.orderedAt)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatKRW(o.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={o.status}
                            onValueChange={(v) =>
                              handleChange(o, v as OrderStatus)
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue>
                                <OrderStatusBadge status={o.status as OrderStatus} />
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {orderStatusMeta[s]?.label ?? s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}