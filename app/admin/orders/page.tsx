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
import type { Order, OrderStatus } from '@/types'

const statusOptions = Object.keys(orderStatusMeta) as OrderStatus[]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    getAdminOrders().then(setOrders)
  }, [])

  const handleChange = async (order: Order, status: OrderStatus) => {
    setOrders((prev) =>
      prev
        ? prev.map((o) => (o.id === order.id ? { ...o, status } : o))
        : prev,
    )
    await updateOrderStatus(order.id, status)
    toast.success('주문 상태가 변경되었습니다.')
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
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-sm">
                        {o.orderNumber}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {o.items[0]?.name}
                          {o.items.length > 1 &&
                            ` 외 ${o.items.length - 1}건`}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(o.createdAt)}
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
                              <OrderStatusBadge status={o.status} />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {orderStatusMeta[s].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}
