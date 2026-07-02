import type { Order, OrderItem } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import { mockOrders } from './mock-data'

export interface CreateOrderPayload {
  items: OrderItem[]
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const totalAmount = payload.items.reduce(
    (sum, i) => sum + i.eventPrice * i.quantity,
    0,
  )
  if (USE_MOCK) {
    const order: Order = {
      id: `o_${Date.now()}`,
      orderNumber: `TEMON-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        Math.random() * 9000 + 1000,
      )}`,
      userId: 'u_1',
      items: payload.items,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    return mockDelay(order, 500)
  }
  return apiFetch<Order>('/api/orders', { method: 'POST', body: payload })
}

export async function payOrder(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    const base = mockOrders[0]
    return mockDelay(
      { ...base, id: orderId, status: 'PAID', paidAt: new Date().toISOString() },
      800,
    )
  }
  return apiFetch<Order>(`/api/orders/${orderId}/pay`, { method: 'POST' })
}

export async function getMyOrders(): Promise<Order[]> {
  if (USE_MOCK) return mockDelay(mockOrders)
  return apiFetch<Order[]>('/api/orders/me')
}

export async function getOrder(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    const order = mockOrders.find((o) => o.id === orderId) ?? mockOrders[0]
    return mockDelay(order)
  }
  return apiFetch<Order>(`/api/orders/${orderId}`)
}
