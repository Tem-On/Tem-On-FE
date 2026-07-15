'use client'

import useSWR from 'swr'
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  Server,
  Wifi,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminHeader } from '@/components/admin/admin-header'
import { LiveIndicator } from '@/components/live-indicator'
import {
  getLogs,
  getSystemMetrics,
} from '@/services/admin.service'
import type {
  LogEntry,
  SystemMetric,
} from '@/types'
import { cn } from '@/lib/utils'

const METRIC_ICONS = [
  Cpu,
  Database,
  HardDrive,
  Server,
  Wifi,
  Activity,
]

const METRIC_TONE: Record<SystemMetric['status'], string> = {
  healthy: 'text-success',
  warning: 'text-warning',
  critical: 'text-danger',
}

const LOG_TONE: Record<LogEntry['level'], string> = {
  INFO: 'text-muted-foreground',
  WARN: 'text-warning',
  ERROR: 'text-danger',
}

const LOG_BADGE: Record<
  LogEntry['level'],
  'secondary' | 'outline' | 'destructive'
> = {
  INFO: 'secondary',
  WARN: 'outline',
  ERROR: 'destructive',
}

export default function MonitoringPage() {
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useSWR<SystemMetric[]>(
    'admin-monitoring-metrics',
    getSystemMetrics,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    },
  )

  const {
    data: logs,
    isLoading: logsLoading,
    error: logsError,
  } = useSWR<LogEntry[]>(
    'admin-monitoring-logs',
    getLogs,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    },
  )

  return (
    <div className="flex flex-col">
      <AdminHeader
        title="실시간 모니터링"
        description="시스템 상태와 최근 서비스 로그를 확인합니다."
        actions={<LiveIndicator label="3초마다 갱신 중" />}
      />

      <div className="flex flex-col gap-6 p-6">
        {metricsError && (
          <Card className="border-danger">
            <CardContent className="pt-6 text-sm text-danger">
              시스템 지표를 불러오지 못했습니다.
              관리자 토큰과 Gateway 라우팅을 확인해주세요.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metricsLoading || !metrics
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-28 rounded-xl"
                />
              ))
            : metrics.map((metric, index) => {
                const Icon =
                  METRIC_ICONS[index % METRIC_ICONS.length]

                return (
                  <Card key={`${metric.label}-${index}`}>
                    <CardContent className="flex flex-col gap-3 pt-6">
                      <div className="flex items-center justify-between">
                        <Icon
                          className={cn(
                            'size-5',
                            METRIC_TONE[metric.status],
                          )}
                        />

                        <span
                          className={cn(
                            'size-2.5 rounded-full',
                            metric.status === 'healthy' &&
                              'bg-success',
                            metric.status === 'warning' &&
                              'bg-warning',
                            metric.status === 'critical' &&
                              'bg-danger',
                          )}
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-muted-foreground">
                          {metric.label}
                        </span>

                        <span className="text-2xl font-bold tabular-nums">
                          {metric.value}

                          <span className="ml-1 text-sm font-medium text-muted-foreground">
                            {metric.unit}
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>실시간 로그 스트림</CardTitle>
            <LiveIndicator label="최근 100개" />
          </CardHeader>

          <CardContent>
            {logsError ? (
              <div className="py-10 text-center text-sm text-danger">
                로그를 불러오지 못했습니다.
                로그 파일 경로와 관리자 권한을 확인해주세요.
              </div>
            ) : logsLoading || !logs ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                표시할 로그가 없습니다.
              </div>
            ) : (
              <ScrollArea className="h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">
                        시간
                      </TableHead>

                      <TableHead className="w-24">
                        레벨
                      </TableHead>

                      <TableHead className="w-64">
                        소스
                      </TableHead>

                      <TableHead>
                        메시지
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {formatLogTime(log.timestamp)}
                        </TableCell>

                        <TableCell>
                          <Badge variant={LOG_BADGE[log.level]}>
                            {log.level}
                          </Badge>
                        </TableCell>

                        <TableCell
                          className="max-w-64 truncate font-mono text-xs"
                          title={log.source}
                        >
                          {log.source}
                        </TableCell>

                        <TableCell
                          className={cn(
                            'text-sm',
                            LOG_TONE[log.level],
                          )}
                        >
                          {log.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatLogTime(timestamp: string): string {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return date.toLocaleTimeString('ko-KR', {
    hour12: false,
  })
}