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
  const meta = eventStatusMeta[status]
  return (
    <Badge variant={meta.className ? 'default' : meta.variant} className={cn(meta.className)}>
      {meta.label}
    </Badge>
  )
}

export function EventProductStatusBadge({
  status,
}: {
  status: EventProductStatus
}) {
  const meta = eventProductStatusMeta[status]
  return (
    <Badge variant={meta.className ? 'default' : meta.variant} className={cn(meta.className)}>
      {meta.label}
    </Badge>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = orderStatusMeta[status]
  return (
    <Badge variant={meta.className ? 'default' : meta.variant} className={cn(meta.className)}>
      {meta.label}
    </Badge>
  )
}
