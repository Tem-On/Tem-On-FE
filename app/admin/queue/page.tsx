'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Users, DoorOpen, DoorClosed, RotateCcw } from 'lucide-react'
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
  setQueueGate,
  resetQueue,
} from '@/services/admin.service'
import type { QueueAdminRow } from '@/types'

export default function AdminQueuePage() {
  const [rows, setRows] = useState<QueueAdminRow[] | null>(null)

  const load = () => getQueueAdminRows().then(setRows)
  useEffect(() => {
    load()
  }, [])

  // 대기 인원 실시간 시뮬레이션
  useEffect(() => {
    if (!rows) return
    const timer = setInterval(() => {
      setRows((prev) =>
        prev
          ? prev.map((r) =>
              r.gateStatus === 'OPEN'
                ? {
                    ...r,
                    waitingCount: Math.max(
                      0,
                      r.waitingCount + Math.floor(Math.random() * 40 - 15),
                    ),
                    enteredCount:
                      r.enteredCount + Math.floor(Math.random() * 12),
                  }
                : r,
            )
          : prev,
      )
    }, 2000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows === null])

  const toggleGate = async (row: QueueAdminRow) => {
    const next = row.gateStatus === 'OPEN' ? 'CLOSED' : 'OPEN'
    setRows((prev) =>
      prev
        ? prev.map((r) =>
            r.eventId === row.eventId ? { ...r, gateStatus: next } : r,
          )
        : prev,
    )
    await setQueueGate(row.eventId, next)
    toast.success(
      next === 'OPEN' ? '대기열 입장이 열렸습니다.' : '대기열 입장이 닫혔습니다.',
    )
  }

  const handleReset = async (row: QueueAdminRow) => {
    await resetQueue(row.eventId)
    setRows((prev) =>
      prev
        ? prev.map((r) =>
            r.eventId === row.eventId
              ? { ...r, waitingCount: 0, enteredCount: 0 }
              : r,
          )
        : prev,
    )
    toast.success('대기열이 초기화되었습니다.')
  }

  return (
    <>
      <AdminHeader
        title="대기열 관리"
        description="이벤트별 대기열 입장 게이트를 제어합니다."
        actions={<LiveIndicator label="실시간" />}
      />
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6">
        {!rows
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))
          : rows.map((r) => {
              const open = r.gateStatus === 'OPEN'
              return (
                <Card key={r.eventId}>
                  <CardHeader className="flex-row items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-base">
                        {r.eventTitle}
                      </CardTitle>
                      <CardDescription>
                        <Badge
                          variant={open ? 'default' : 'secondary'}
                          className={
                            open ? 'bg-success text-success-foreground' : ''
                          }
                        >
                          {open ? '입장 열림' : '입장 닫힘'}
                        </Badge>
                      </CardDescription>
                    </div>
                    {open && <LiveIndicator />}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-4">
                        <Users className="size-4 text-muted-foreground" />
                        <span className="font-mono text-2xl font-bold tabular-nums">
                          {formatNumber(r.waitingCount)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          대기 인원
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-4">
                        <DoorOpen className="size-4 text-muted-foreground" />
                        <span className="font-mono text-2xl font-bold tabular-nums">
                          {formatNumber(r.enteredCount)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          입장 완료
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={open ? 'outline' : 'default'}
                        className="flex-1"
                        onClick={() => toggleGate(r)}
                      >
                        {open ? (
                          <DoorClosed data-icon="inline-start" />
                        ) : (
                          <DoorOpen data-icon="inline-start" />
                        )}
                        {open ? '입장 닫기' : '입장 열기'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button variant="outline" size="icon" aria-label="초기화">
                              <RotateCcw />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              대기열을 초기화할까요?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {r.eventTitle}의 모든 대기 순번이 초기화됩니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReset(r)}>
                              초기화
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>
    </>
  )
}
