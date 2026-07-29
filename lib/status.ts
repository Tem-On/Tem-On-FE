import type {
  EventProductStatus,
  EventStatus,
  OrderStatus,
} from '@/types'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface StatusMeta {
  label: string
  variant: BadgeVariant
  /** 커스텀 색상 클래스 (semantic token) */
  className?: string
}

export const eventStatusMeta: Record<EventStatus, StatusMeta> = {
  OPEN: {
    label: '진행중',
    variant: 'default',
    className: 'bg-success text-success-foreground',
  },
  UPCOMING: {
    label: '오픈예정',
    variant: 'default',
    className: 'bg-warning text-warning-foreground',
  },
  CLOSED: { label: '종료', variant: 'secondary' },
}

export const eventProductStatusMeta: Record<EventProductStatus, StatusMeta> = {
  ON_SALE: {
    label: '판매중',
    variant: 'default',
    className: 'bg-success text-success-foreground',
  },
  READY: {
    label: '판매대기',
    variant: 'default',
    className: 'bg-warning text-warning-foreground',
  },
  SOLD_OUT: { label: '품절', variant: 'secondary' },
  STOPPED: { label: '판매중지', variant: 'destructive' },
}

export const orderStatusMeta: Record<OrderStatus, StatusMeta> = {
  PENDING: {
    label: '결제대기',
    variant: 'default',
    className: 'bg-warning text-warning-foreground',
  },
  PAID: {
    label: '결제완료',
    variant: 'default',
    className: 'bg-success text-success-foreground',
  },
  PREPARING: { label: '상품준비중', variant: 'outline' },
  SHIPPED: { label: '배송중', variant: 'outline' },
  DELIVERED: { label: '배송완료', variant: 'secondary' },
  CANCELLED: { label: '취소', variant: 'destructive' },
}
