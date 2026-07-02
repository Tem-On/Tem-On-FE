"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Activity, Cpu, Database, Server, Wifi } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminHeader } from "@/components/admin/admin-header"
import { LiveIndicator } from "@/components/live-indicator"
import { getSystemMetrics, getLogs } from "@/services/admin.service"
import { subscribeLogs } from "@/services/realtime.service"
import type { LogEntry, SystemMetric } from "@/types"
import { cn } from "@/lib/utils"

const METRIC_ICONS = [Cpu, Database, Wifi, Server, Activity]

const METRIC_TONE: Record<SystemMetric["status"], string> = {
  healthy: "text-success",
  warning: "text-warning",
  critical: "text-danger",
}

const LOG_TONE: Record<LogEntry["level"], string> = {
  INFO: "text-muted-foreground",
  WARN: "text-warning",
  ERROR: "text-danger",
}

const LOG_BADGE: Record<LogEntry["level"], "secondary" | "outline" | "destructive"> = {
  INFO: "secondary",
  WARN: "outline",
  ERROR: "destructive",
}

export default function MonitoringPage() {
  const { data: metrics, isLoading: metricsLoading } = useSWR<SystemMetric[]>(
    "admin-metrics",
    getSystemMetrics,
    { refreshInterval: 5000 },
  )
  const { data: initialLogs } = useSWR<LogEntry[]>("admin-logs", getLogs)
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    if (initialLogs) setLogs(initialLogs)
  }, [initialLogs])

  useEffect(() => {
    const unsubscribe = subscribeLogs((entry) => {
      setLogs((prev) => [entry, ...prev].slice(0, 100))
    })
    return unsubscribe
  }, [])

  return (
    <div className="flex flex-col">
      <AdminHeader
        title="실시간 모니터링"
        description="시스템 상태와 실시간 로그를 확인합니다."
        actions={<LiveIndicator label="실시간 수집 중" />}
      />

      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metricsLoading || !metrics
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            : metrics.map((metric, i) => {
                const Icon = METRIC_ICONS[i % METRIC_ICONS.length]
                return (
                  <Card key={metric.label}>
                    <CardContent className="flex flex-col gap-3 pt-6">
                      <div className="flex items-center justify-between">
                        <Icon className={cn("size-5", METRIC_TONE[metric.status])} />
                        <span
                          className={cn(
                            "size-2.5 rounded-full",
                            metric.status === "healthy" && "bg-success",
                            metric.status === "warning" && "bg-warning",
                            metric.status === "critical" && "bg-danger",
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
            <LiveIndicator />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">시간</TableHead>
                    <TableHead className="w-24">레벨</TableHead>
                    <TableHead className="w-40">소스</TableHead>
                    <TableHead>메시지</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString("ko-KR", {
                          hour12: false,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={LOG_BADGE[log.level]}>{log.level}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.source}</TableCell>
                      <TableCell className={cn("text-sm", LOG_TONE[log.level])}>
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
