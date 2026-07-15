import type {
  Order,
  OrderItem,
  Payment,
  PaymentMethod,
} from '@/types'
import {
  apiFetch,
  mockDelay,
  USE_MOCK,
} from './api-client'
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
  paymentId?: number | null
  items: BackendOrderItemResponse[]
}

interface PaymentRequestPayload {
  orderId: number
  method: PaymentMethod
}

function mapOrderStatus(
  status: string,
): Order['status'] {
  switch (status) {
    case 'CREATED':
      return 'PENDING'

    case 'PAID':
      return 'PAID'

    case 'PREPARING':
      return 'PREPARING'

    case 'SHIPPED':
      return 'SHIPPED'

    case 'DELIVERED':
      return 'DELIVERED'

    case 'CANCELED':
    case 'CANCELLED':
      return 'CANCELLED'

    default:
      return 'PENDING'
  }
}

function mapBackendOrderItem(
  item: BackendOrderItemResponse,
): OrderItem {
  return {
    eventProductId: String(item.eventProductId),
    name: item.productName,
    image: '',
    eventPrice: item.orderPrice,
    quantity: item.quantity,
  }
}

function mapBackendOrder(
  order: BackendOrderResponse,
): Order {
  return {
    id: String(order.orderId),
    orderNumber: order.orderNumber,
    userId: String(order.userId),
    items:
      order.items?.map(mapBackendOrderItem) ?? [],
    totalAmount: order.totalAmount,
    status: mapOrderStatus(order.status),
    createdAt: order.orderedAt,
    canceledAt: order.canceledAt ?? null,
    paymentId: order.paymentId ?? null,
  }
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const totalAmount = payload.items.reduce(
    (sum, item) =>
      sum + item.eventPrice * item.quantity,
    0,
  )

  if (USE_MOCK) {
    const order: Order = {
      id: `o_${Date.now()}`,
      orderNumber: `TEMON-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${Math.floor(
        Math.random() * 9000 + 1000,
      )}`,
      userId: 'u_1',
      items: payload.items,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      paymentId: null,
      canceledAt: null,
    }

    return mockDelay(order, 500)
  }

  const res =
    await apiFetch<BackendOrderResponse>(
      '/api/orders',
      {
        method: 'POST',
        body: {
          items: payload.items.map((item) => ({
            eventProductId: Number(
              item.eventProductId,
            ),
            quantity: item.quantity,
          })),
        },
      },
    )

  return mapBackendOrder(res)
}

export async function requestPayment(
  orderId: string,
  method: PaymentMethod,
): Promise<Payment> {
  if (USE_MOCK) {
    const payment: Payment = {
      paymentId: Date.now(),
      paymentNumber: crypto.randomUUID(),
      orderId: Number(orderId),
      amount: mockOrders[0]?.totalAmount ?? 0,
      method,
      status: 'READY',
    }

    return mockDelay(payment, 500)
  }

  const payload: PaymentRequestPayload = {
    orderId: Number(orderId),
    method,
  }

  return apiFetch<Payment>('/api/payments', {
    method: 'POST',
    body: payload,
  })
}

export async function successPayment(
  paymentId: number,
): Promise<Payment> {
  if (USE_MOCK) {
    const payment: Payment = {
      paymentId,
      paymentNumber: crypto.randomUUID(),
      orderId: 1,
      amount: mockOrders[0]?.totalAmount ?? 0,
      method: 'KAKAO_PAY',
      status: 'PAID',
    }

    return mockDelay(payment, 500)
  }

  return apiFetch<Payment>(
    `/api/payments/${paymentId}/success`,
    {
      method: 'POST',
    },
  )
}

export async function failPayment(
  paymentId: number,
): Promise<Payment> {
  if (USE_MOCK) {
    const payment: Payment = {
      paymentId,
      paymentNumber: crypto.randomUUID(),
      orderId: 1,
      amount: mockOrders[0]?.totalAmount ?? 0,
      method: 'KAKAO_PAY',
      status: 'FAILED',
    }

    return mockDelay(payment, 500)
  }

  return apiFetch<Payment>(
    `/api/payments/${paymentId}/fail`,
    {
      method: 'POST',
    },
  )
}

export async function cancelPayment(
  paymentId: number,
): Promise<Payment> {
  if (USE_MOCK) {
    const payment: Payment = {
      paymentId,
      paymentNumber: crypto.randomUUID(),
      orderId: 1,
      amount: mockOrders[0]?.totalAmount ?? 0,
      method: 'KAKAO_PAY',
      status: 'CANCELED',
    }

    return mockDelay(payment, 500)
  }

  return apiFetch<Payment>(
    `/api/payments/${paymentId}/cancel`,
    {
      method: 'POST',
    },
  )
}

export async function payOrder(
  orderId: string,
  method: PaymentMethod,
): Promise<Payment> {
  const payment = await requestPayment(
    orderId,
    method,
  )

  return successPayment(payment.paymentId)
}

export async function getMyOrders(): Promise<
  Order[]
> {
  if (USE_MOCK) {
    return mockDelay(mockOrders)
  }

  const res =
    await apiFetch<BackendOrderResponse[]>(
      '/api/orders/me',
    )

  return res.map(mapBackendOrder)
}

export async function getOrder(
  orderId: string,
): Promise<Order> {
  if (USE_MOCK) {
    const order =
      mockOrders.find(
        (item) => item.id === orderId,
      ) ?? mockOrders[0]

    return mockDelay(order)
  }

  const res =
    await apiFetch<BackendOrderResponse>(
      `/api/orders/${orderId}`,
    )

  return mapBackendOrder(res)
}