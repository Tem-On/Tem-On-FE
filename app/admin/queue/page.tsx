'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Users,
  DoorOpen,
  DoorClosed,
  RotateCcw,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { LiveIndicator } from '@/components/live-indicator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatNumber } from '@/lib/format'
import {
  getQueueAdminRows,
  resetQueue,
  setQueueGate,
} from '@/services/admin.service'
import type { QueueAdminRow } from '@/types'

export default function AdminQueuePage() {
  const [rows, setRows] =
    useState<QueueAdminRow[] | null>(null)

  const [loadingId, setLoadingId] =
    useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getQueueAdminRows()
      setRows(data)
    } catch (error) {
      console.error(
        '관리자 대기열 조회 실패:',
        error,
      )

      toast.error(
        '대기열 정보를 불러오지 못했습니다.',
      )

      setRows([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /*
   * 현재는 2초마다 백엔드 API를 다시 호출해서
   * 대기 인원과 입장 완료 수를 갱신한다.
   *
   * 추후 WebSocket 관리자 구독을 추가하면
   * 이 polling 코드는 제거할 수 있다.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      load()
    }, 2000)

    return () => {
      window.clearInterval(timer)
    }
  }, [load])

  const toggleGate = async (
    row: QueueAdminRow,
  ) => {
    const next =
      row.gateStatus === 'OPEN'
        ? 'CLOSED'
        : 'OPEN'

    try {
      setLoadingId(row.eventProductId)

      await setQueueGate(
        row.eventProductId,
        next,
      )

      setRows((prev) =>
        prev
          ? prev.map((item) =>
              item.eventProductId ===
              row.eventProductId
                ? {
                    ...item,
                    gateStatus: next,
                  }
                : item,
            )
          : prev,
      )

      toast.success(
        next === 'OPEN'
          ? '대기열 입장이 열렸습니다.'
          : '대기열 입장이 닫혔습니다.',
      )
    } catch (error) {
      console.error(
        '대기열 상태 변경 실패:',
        error,
      )

      toast.error(
        '대기열 상태 변경에 실패했습니다.',
      )

      await load()
    } finally {
      setLoadingId(null)
    }
  }

  const handleReset = async (
    row: QueueAdminRow,
  ) => {
    try {
      setLoadingId(row.eventProductId)

      await resetQueue(row.eventProductId)

      setRows((prev) =>
        prev
          ? prev.map((item) =>
              item.eventProductId ===
              row.eventProductId
                ? {
                    ...item,
                    waitingCount: 0,
                    enteredCount: 0,
                    gateStatus: 'OPEN',
                  }
                : item,
            )
          : prev,
      )

      toast.success(
        '대기열이 초기화되었습니다.',
      )
    } catch (error) {
      console.error(
        '대기열 초기화 실패:',
        error,
      )

      toast.error(
        '대기열 초기화에 실패했습니다.',
      )

      await load()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      <AdminHeader
        title="대기열 관리"
        description="이벤트 상품별 대기열 입장 게이트를 제어합니다."
        actions={
          <LiveIndicator label="실시간" />
        }
      />

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6">
        {rows === null ? (
          Array.from({ length: 4 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-56 rounded-xl"
              />
            ),
          )
        ) : rows.length === 0 ? (
          <div className="col-span-full flex min-h-52 items-center justify-center rounded-xl border border-dashed">
            <p className="text-sm text-muted-foreground">
              표시할 이벤트 상품이 없습니다.
            </p>
          </div>
        ) : (
          rows.map((row) => {
            const open =
              row.gateStatus === 'OPEN'

            const loading =
              loadingId ===
              row.eventProductId

            return (
              <Card
                key={row.eventProductId}
              >
                <CardHeader className="flex-row items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">
                      {row.eventTitle}
                    </CardTitle>

                    <CardDescription>
                      {row.productName}
                    </CardDescription>

                    <div className="pt-1">
                      <Badge
                        variant={
                          open
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          open
                            ? 'bg-success text-success-foreground'
                            : ''
                        }
                      >
                        {open
                          ? '입장 열림'
                          : '입장 닫힘'}
                      </Badge>
                    </div>
                  </div>

                  {open && <LiveIndicator />}
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-4">
                      <Users className="size-4 text-muted-foreground" />

                      <span className="font-mono text-2xl font-bold tabular-nums">
                        {formatNumber(
                          row.waitingCount,
                        )}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        대기 인원
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-4">
                      <DoorOpen className="size-4 text-muted-foreground" />

                      <span className="font-mono text-2xl font-bold tabular-nums">
                        {formatNumber(
                          row.enteredCount,
                        )}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        입장 완료
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={
                        open
                          ? 'outline'
                          : 'default'
                      }
                      className="flex-1"
                      disabled={loading}
                      onClick={() =>
                        toggleGate(row)
                      }
                    >
                      {open ? (
                        <DoorClosed data-icon="inline-start" />
                      ) : (
                        <DoorOpen data-icon="inline-start" />
                      )}

                      {open
                        ? '입장 닫기'
                        : '입장 열기'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={loading}
                            aria-label="초기화"
                          >
                            <RotateCcw />
                          </Button>
                        }
                      />

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            대기열을
                            초기화할까요?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            {row.eventTitle}의{' '}
                            {row.productName} 대기
                            순번과 입장 완료 수가
                            초기화됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            취소
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={() =>
                              handleReset(row)
                            }
                          >
                            초기화
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </>
  )
}