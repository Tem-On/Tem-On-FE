import type {
  DashboardStats,
  EventProduct,
  EventSummary,
  LogEntry,
  Order,
  Product,
  QueueAdminRow,
  RevenuePoint,
  StockRow,
  SystemMetric,
} from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import {
  buildQueueRows,
  buildStockRows,
  mockEventProducts,
  mockEvents,
  mockLogs,
  mockOrders,
  mockProducts,
  mockRevenue,
  mockSystemMetrics,
} from './mock-data'

// -------- 대시보드 --------

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    return mockDelay<DashboardStats>({
      totalOrders: 1358,
      totalRevenue: 218400000,
      paidCount: 1204,
      cancelledCount: 154,
      activeEvents: mockEvents.filter((e) => e.status === 'OPEN').length,
      soldQuantity: 4820,
    })
  }
  return apiFetch<DashboardStats>('/api/admin/dashboard/stats')
}

export async function getRevenueSeries(): Promise<RevenuePoint[]> {
  if (USE_MOCK) return mockDelay(mockRevenue)
  return apiFetch<RevenuePoint[]>('/api/admin/dashboard/revenue')
}

// -------- 상품 관리 --------

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK) return mockDelay(mockProducts)
  return apiFetch<Product[]>('/api/admin/products')
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  if (USE_MOCK) {
    return mockDelay<Product>({
      id: product.id ?? `p_${Date.now()}`,
      name: product.name ?? '',
      description: product.description ?? '',
      image: product.image ?? '/images/products/mug.png',
      price: product.price ?? 0,
      category: product.category ?? '기타',
      createdAt: product.createdAt ?? new Date().toISOString(),
    })
  }
  const method = product.id ? 'PATCH' : 'POST'
  const path = product.id
    ? `/api/admin/products/${product.id}`
    : '/api/admin/products'
  return apiFetch<Product>(path, { method, body: product })
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined, 300)
  return apiFetch<void>(`/api/admin/products/${id}`, { method: 'DELETE' })
}

// -------- 이벤트 관리 --------

export async function getAdminEvents(): Promise<EventSummary[]> {
  if (USE_MOCK) return mockDelay(mockEvents)
  return apiFetch<EventSummary[]>('/api/admin/events')
}

export async function saveEvent(
  event: Partial<EventSummary>,
): Promise<EventSummary> {
  if (USE_MOCK) {
    return mockDelay<EventSummary>({
      id: event.id ?? `e_${Date.now()}`,
      title: event.title ?? '',
      description: event.description ?? '',
      image: event.image ?? '/images/events/tech-friday.png',
      status: event.status ?? 'UPCOMING',
      startAt: event.startAt ?? new Date().toISOString(),
      endAt: event.endAt ?? new Date().toISOString(),
      productCount: event.productCount ?? 0,
    })
  }
  const method = event.id ? 'PATCH' : 'POST'
  const path = event.id
    ? `/api/admin/events/${event.id}`
    : '/api/admin/events'
  return apiFetch<EventSummary>(path, { method, body: event })
}

export async function deleteEvent(id: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined, 300)
  return apiFetch<void>(`/api/admin/events/${id}`, { method: 'DELETE' })
}

// -------- 이벤트 상품 관리 --------

export async function getAdminEventProducts(): Promise<EventProduct[]> {
  if (USE_MOCK) return mockDelay(mockEventProducts)
  return apiFetch<EventProduct[]>('/api/admin/event-products')
}

export async function saveEventProduct(
  ep: Partial<EventProduct>,
): Promise<EventProduct> {
  if (USE_MOCK) {
    const existingIndex = ep.id
      ? mockEventProducts.findIndex((x) => x.id === ep.id)
      : -1
    if (existingIndex >= 0) {
      // 수정: 특가/재고/상태 등 변경 반영
      const prev = mockEventProducts[existingIndex]
      const total = ep.totalStock ?? prev.totalStock
      const soldAndReserved = prev.soldCount + prev.reservedStock
      const updated: EventProduct = {
        ...prev,
        ...ep,
        totalStock: total,
        remainingStock: Math.max(0, total - soldAndReserved),
      }
      mockEventProducts[existingIndex] = updated
      return mockDelay(updated)
    }
    // 신규 편성: 상품 정보를 채워 이벤트 상품 생성
    const product = mockProducts.find((p) => p.id === ep.productId)
    const total = ep.totalStock ?? 0
    const created: EventProduct = {
      id: ep.id ?? `ep_${Date.now()}`,
      eventId: ep.eventId ?? '',
      productId: ep.productId ?? '',
      name: product?.name ?? ep.name ?? '',
      image: product?.image ?? ep.image ?? '/placeholder.svg',
      originalPrice: product?.price ?? ep.originalPrice ?? 0,
      eventPrice: ep.eventPrice ?? 0,
      totalStock: total,
      remainingStock: total,
      reservedStock: 0,
      soldCount: 0,
      status: ep.status ?? 'READY',
      description: product?.description ?? ep.description,
    }
    mockEventProducts.push(created)
    // 이벤트의 상품 수 갱신
    const event = mockEvents.find((e) => e.id === created.eventId)
    if (event) {
      event.productCount = mockEventProducts.filter(
        (x) => x.eventId === event.id,
      ).length
    }
    return mockDelay(created)
  }
  const method = ep.id ? 'PATCH' : 'POST'
  const path = ep.id
    ? `/api/admin/event-products/${ep.id}`
    : '/api/admin/event-products'
  return apiFetch<EventProduct>(path, { method, body: ep })
}

export async function deleteEventProduct(id: string): Promise<void> {
  if (USE_MOCK) {
    const index = mockEventProducts.findIndex((x) => x.id === id)
    if (index >= 0) {
      const [removed] = mockEventProducts.splice(index, 1)
      const event = mockEvents.find((e) => e.id === removed.eventId)
      if (event) {
        event.productCount = mockEventProducts.filter(
          (x) => x.eventId === event.id,
        ).length
      }
    }
    return mockDelay(undefined, 300)
  }
  return apiFetch<void>(`/api/admin/event-products/${id}`, { method: 'DELETE' })
}

// -------- 재고 관리 --------

export async function getStockRows(): Promise<StockRow[]> {
  if (USE_MOCK) return mockDelay(buildStockRows())
  return apiFetch<StockRow[]>('/api/admin/stocks')
}

export async function updateStock(
  eventProductId: string,
  totalStock: number,
): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined, 300)
  return apiFetch<void>(`/api/admin/stocks/${eventProductId}`, {
    method: 'PATCH',
    body: { totalStock },
  })
}

// -------- 주문 관리 --------

export async function getAdminOrders(): Promise<Order[]> {
  if (USE_MOCK) return mockDelay(mockOrders)
  return apiFetch<Order[]>('/api/admin/orders')
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Promise<Order> {
  if (USE_MOCK) {
    const order = mockOrders.find((o) => o.id === orderId) ?? mockOrders[0]
    return mockDelay({ ...order, status })
  }
  return apiFetch<Order>(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

// -------- 대기열 관리 --------

export async function getQueueAdminRows(): Promise<QueueAdminRow[]> {
  if (USE_MOCK) return mockDelay(buildQueueRows())
  return apiFetch<QueueAdminRow[]>('/api/admin/queues')
}

export async function setQueueGate(
  eventId: string,
  gateStatus: 'OPEN' | 'CLOSED',
): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined, 300)
  return apiFetch<void>(`/api/admin/queues/${eventId}/gate`, {
    method: 'PATCH',
    body: { gateStatus },
  })
}

export async function resetQueue(eventId: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined, 300)
  return apiFetch<void>(`/api/admin/queues/${eventId}/reset`, {
    method: 'POST',
  })
}

// -------- 모니터링 --------

export async function getSystemMetrics(): Promise<SystemMetric[]> {
  if (USE_MOCK) return mockDelay(mockSystemMetrics)
  return apiFetch<SystemMetric[]>('/api/admin/monitoring/metrics')
}

export async function getLogs(): Promise<LogEntry[]> {
  if (USE_MOCK) return mockDelay(mockLogs)
  return apiFetch<LogEntry[]>('/api/admin/monitoring/logs')
}
