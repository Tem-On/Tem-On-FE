'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Check, Ban } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LiveIndicator } from '@/components/live-indicator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StockBar } from '@/components/stock-bar'
import { formatNumber } from '@/lib/format'
import { getStockRows, updateStock, forceSoldOut } from '@/services/admin.service'
import { subscribeStock } from '@/services/realtime.service'
import type { StockRow } from '@/types'

export default function AdminStockPage() {
  const [rows, setRows] = useState<StockRow[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, number>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    getStockRows().then((data) => {
      setRows(data)
      setDrafts(
        Object.fromEntries(data.map((r) => [r.eventProductId, r.totalStock])),
      )
    })
  }, [])

  useEffect(() => {
    if (!rows) return
    const subs = rows
      .filter((r) => r.remainingStock > 0)
      .slice(0, 3)
      .map((r) =>
        subscribeStock(
          r.eventProductId,
          (msg) =>
            setRows((prev) =>
              prev
                ? prev.map((row) =>
                    row.eventProductId === msg.eventProductId
                      ? {
                          ...row,
                          remainingStock: msg.remainingStock,
                          reservedStock: msg.reservedStock,
                          soldCount: msg.soldCount,
                        }
                      : row,
                  )
                : prev,
            ),
          {
            remainingStock: r.remainingStock,
            reservedStock: r.reservedStock,
            soldCount: r.soldCount,
          },
        ),
      )
    return () => subs.forEach((u) => u())
  }, [rows === null])

  const handleUpdate = async (row: StockRow) => {
    const nextTotal = drafts[row.eventProductId]
    const minRequired = row.reservedStock + row.soldCount

    if (nextTotal < minRequired) {
      toast.error(
        `총 재고는 (선점 + 판매) 수량인 ${minRequired}개 이상이어야 합니다.`,
      )
      return
    }

    setUpdatingId(row.eventProductId)
    try {
      await updateStock(row.eventProductId, nextTotal)
      setRows((prev) =>
        prev
          ? prev.map((r) =>
              r.eventProductId === row.eventProductId
                ? {
                    ...r,
                    totalStock: nextTotal,
                    remainingStock: Math.max(
                      0,
                      nextTotal - r.reservedStock - r.soldCount,
                    ),
                  }
                : r,
            )
          : prev,
      )
      toast.success('재고가 성공적으로 업데이트되었습니다.')
    } catch (err: any) {
      const errorMsg =
        err?.response?.data || '재고 수량 수정 중 오류가 발생했습니다.'
      toast.error(errorMsg)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleForceSoldOut = async (row: StockRow) => {
    if (
      !confirm(
        `[${row.productName}] 상품을 강제 품절 처리하시겠습니까?\n남은 재고가 0으로 설정됩니다.`,
      )
    ) {
      return
    }

    setUpdatingId(row.eventProductId)
    try {
      await forceSoldOut(row.eventProductId)
      setRows((prev) =>
        prev
          ? prev.map((r) =>
              r.eventProductId === row.eventProductId
                ? {
                    ...r,
                    totalStock: r.reservedStock + r.soldCount,
                    remainingStock: 0,
                  }
                : r,
            )
          : prev,
      )
      toast.success('상품이 강제 품절 처리되었습니다.')
    } catch (err) {
      toast.error('강제 품절 처리에 실패했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  const lowStockCount =
    rows?.filter((r) => r.remainingStock > 0 && r.remainingStock <= 20).length ??
    0

  return (
    <>
      <AdminHeader
        title="재고 관리"
        description="실시간 재고 현황을 확인하고 총 재고를 조정합니다."
        actions={<LiveIndicator label="실시간 동기화" />}
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
            <AlertTriangle className="size-4 text-warning" />
            <span className="text-foreground">
              재고 임계치(20개 이하) 상품이{' '}
              <strong>{lowStockCount}개</strong> 있습니다.
            </span>
          </div>
        )}

        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품</TableHead>
                <TableHead>이벤트</TableHead>
                <TableHead className="w-52">실시간 재고</TableHead>
                <TableHead className="text-right">예약</TableHead>
                <TableHead className="text-right">판매</TableHead>
                <TableHead className="w-56">총 재고 조정 및 액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!rows
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : rows.map((r) => {
                    const minAllowed = r.reservedStock + r.soldCount
                    const isBusy = updatingId === r.eventProductId

                    return (
                      <TableRow key={r.eventProductId}>
                        <TableCell className="font-medium">
                          {r.productName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.eventTitle}
                        </TableCell>
                        <TableCell>
                          <StockBar
                            remaining={r.remainingStock}
                            total={r.totalStock}
                          />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <Badge variant="outline">
                            {formatNumber(r.reservedStock)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(r.soldCount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              className="h-9 w-24"
                              min={minAllowed}
                              disabled={isBusy}
                              value={
                                drafts[r.eventProductId] ?? r.totalStock
                              }
                              onChange={(e) =>
                                setDrafts({
                                  ...drafts,
                                  [r.eventProductId]: Number(e.target.value),
                                })
                              }
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="적용"
                              disabled={isBusy}
                              onClick={() => handleUpdate(r)}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="강제 품절"
                              title="강제 품절 처리"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={isBusy || r.remainingStock <= 0}
                              onClick={() => handleForceSoldOut(r)}
                            >
                              <Ban className="size-4" />
                            </Button>
                          </div>
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