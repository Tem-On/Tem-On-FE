'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Check } from 'lucide-react'
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
import { getStockRows, updateStock } from '@/services/admin.service'
import { subscribeStock } from '@/services/realtime.service'
import type { StockRow } from '@/types'

export default function AdminStockPage() {
  const [rows, setRows] = useState<StockRow[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, number>>({})

  useEffect(() => {
    getStockRows().then((data) => {
      setRows(data)
      setDrafts(
        Object.fromEntries(data.map((r) => [r.eventProductId, r.totalStock])),
      )
    })
  }, [])

  // 실시간 재고 감소 시뮬레이션 (판매중 상품)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows === null])

  const handleUpdate = async (row: StockRow) => {
    const next = drafts[row.eventProductId]
    await updateStock(row.eventProductId, next)
    setRows((prev) =>
      prev
        ? prev.map((r) =>
            r.eventProductId === row.eventProductId
              ? { ...r, totalStock: next }
              : r,
          )
        : prev,
    )
    toast.success('재고가 업데이트되었습니다.')
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
                <TableHead className="w-44">총 재고 조정</TableHead>
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
                : rows.map((r) => (
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
                            value={drafts[r.eventProductId] ?? r.totalStock}
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
                            onClick={() => handleUpdate(r)}
                          >
                            <Check />
                          </Button>
                        </div>
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
