import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  eventProductStatusMeta,
  eventStatusMeta,
  orderStatusMeta,
} from '@/lib/status'
import type {
  EventProductStatus,
  EventStatus,
  OrderStatus,
} from '@/types'

export function EventStatusBadge({ status }: { status: EventStatus }) {
  // 💡 방어 코드 추가
  const meta = eventStatusMeta[status] || { label: status, variant: 'outline' }
  return (
    <Badge variant={(meta as any).className ? 'default' : (meta as any).variant} className={cn((meta as any).className)}>
      {meta.label}
    </Badge>
  )
}

export function EventProductStatusBadge({
  status,
}: {
  status: EventProductStatus
}) {
  // 💡 ⭐️ 핵심 해결 지점: 백엔드가 보낸 status 키값이 없어도 터지지 않게 기본값 매핑
  const meta = eventProductStatusMeta[status] || { label: status, variant: 'outline' }
  return (
    <Badge variant={(meta as any).className ? 'default' : (meta as any).variant} className={cn((meta as any).className)}>
      {meta.label}
    </Badge>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  // 💡 방어 코드 추가
  const meta = orderStatusMeta[status] || { label: status, variant: 'outline' }
  return (
    <Badge variant={(meta as any).className ? 'default' : (meta as any).variant} className={cn((meta as any).className)}>
      {meta.label}
    </Badge>
  )
}