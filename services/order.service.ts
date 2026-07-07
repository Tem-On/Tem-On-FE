import type { Order, OrderItem } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import { mockOrders } from './mock-data'

export interface CreateOrderPayload {
  items: OrderItem[]
}

interface BackendOrderItemResponse {
  orderItemId: number
  eventProductId: number
  quantity: number
  orderPrice: number
  totalPrice: number
  productName: string
}

interface BackendOrderResponse {
  orderId: number
  userId: number
  orderNumber: string
  totalAmount: number
  status: string
  orderedAt: string
  canceledAt?: string | null
  items: BackendOrderItemResponse[]
}

function mapOrderStatus(status: string): Order['status'] {
  switch (status) {
    case 'CREATED':
      return 'PENDING'
    case 'PAID':
      return 'PAID'
    case 'CANCELED':
    case 'CANCELLED':
      return 'CANCELLED'
    default:
      return 'PENDING'
  }
}

function mapBackendOrderItem(item: BackendOrderItemResponse): OrderItem {
  return {
    eventProductId: String(item.eventProductId),
    name: item.productName,
    image: '',
    eventPrice: item.orderPrice,
    quantity: item.quantity,
  }
}

function mapBackendOrder(order: BackendOrderResponse): Order {
  return {
    id: String(order.orderId),
    orderNumber: order.orderNumber,
    userId: String(order.userId),
    items: order.items?.map(mapBackendOrderItem) ?? [],
    totalAmount: order.totalAmount,
    status: mapOrderStatus(order.status),
    createdAt: order.orderedAt,
  }
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
      orderNumber: `TEMON-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`,
      userId: 'u_1',
      items: payload.items,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    return mockDelay(order, 500)
  }

  const res = await apiFetch<BackendOrderResponse>('/api/orders', {
    method: 'POST',
    body: {
      items: payload.items.map((item) => ({
        eventProductId: Number(item.eventProductId),
        quantity: item.quantity,
      })),
    },
  })

  return mapBackendOrder(res)
}

export async function payOrder(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    const base = mockOrders[0]

    return mockDelay(
      {
        ...base,
        id: orderId,
        status: 'PAID',
        paidAt: new Date().toISOString(),
      },
      800,
    )
  }

  const res = await apiFetch<BackendOrderResponse>(
    `/api/payments/success?orderId=${orderId}`,
    {
      method: 'POST',
    },
  )

  return mapBackendOrder(res)
}

export async function getMyOrders(): Promise<Order[]> {
  if (USE_MOCK) return mockDelay(mockOrders)

  const res = await apiFetch<BackendOrderResponse[]>('/api/orders/me')

  return res.map(mapBackendOrder)
}

export async function getOrder(orderId: string): Promise<Order> {
  if (USE_MOCK) {
    const order = mockOrders.find((o) => o.id === orderId) ?? mockOrders[0]
    return mockDelay(order)
  }

  const res = await apiFetch<BackendOrderResponse>(`/api/orders/${orderId}`)

  return mapBackendOrder(res)
}