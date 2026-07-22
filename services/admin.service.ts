import type {
  AdminProductApiResponse,
  DashboardStats,
  EventProduct,
  EventSummary,
  LogEntry,
  Order,
  PageResponse,
  Product,
  ProductCategory,
  ProductStatus,
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

// ============================================================
// 상품 응답 변환
// ============================================================

function convertProduct(
  product: AdminProductApiResponse,
): Product {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description ?? '',
    image: product.imageUrl ?? '/placeholder.svg',
    price: product.price,
    category: product.category,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt ?? undefined,
  }
}

export interface ProductPageResult {
  products: Product[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
}

// ============================================================
// 대시보드
// ============================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    return mockDelay<DashboardStats>({
      totalOrders: 1358,
      totalRevenue: 218400000,
      paidCount: 1204,
      cancelledCount: 154,
      activeEvents: mockEvents.filter(
        (event) => event.status === 'OPEN',
      ).length,
      soldQuantity: 4820,
    })
  }

  return apiFetch<DashboardStats>(
    '/api/admin/dashboard',
  )
}

export async function getRevenueSeries(): Promise<
  RevenuePoint[]
> {
  if (USE_MOCK) {
    return mockDelay(mockRevenue)
  }

  return apiFetch<RevenuePoint[]>(
    '/api/admin/dashboard/sales',
  )
}

// ============================================================
// 상품 관리
// ============================================================

export async function getProducts(
  page = 0,
  size = 10,
): Promise<ProductPageResult> {
  if (USE_MOCK) {
    const convertedProducts: Product[] = mockProducts.map(
      (product) => ({
        ...product,
        category:
          product.category as ProductCategory,
        status:
          'status' in product
            ? (product.status as ProductStatus)
            : 'ACTIVE',
      }),
    )

    const start = page * size
    const end = start + size
    const content = convertedProducts.slice(start, end)
    const totalElements = convertedProducts.length
    const totalPages = Math.ceil(totalElements / size)

    return mockDelay({
      products: content,
      page,
      size,
      totalPages,
      totalElements,
      first: page === 0,
      last:
        totalPages === 0 ||
        page >= totalPages - 1,
    })
  }

  const response = await apiFetch<
    PageResponse<AdminProductApiResponse>
  >(
    `/api/admin/products?page=${page}&size=${size}`,
  )

  return {
    products: response.content.map(convertProduct),
    page: response.number,
    size: response.size,
    totalPages: response.totalPages,
    totalElements: response.totalElements,
    first: response.first,
    last: response.last,
  }
}

export async function getAdminProduct(
  id: string,
): Promise<Product> {
  const response =
    await apiFetch<AdminProductApiResponse>(
      `/api/admin/products/${id}`,
    )

  return convertProduct(response)
}

export async function saveProduct(
  product: Partial<Product>,
): Promise<Product> {
  if (USE_MOCK) {
    return mockDelay<Product>({
      id: product.id ?? `p_${Date.now()}`,
      name: product.name ?? '',
      description: product.description ?? '',
      image: product.image ?? '/placeholder.svg',
      price: product.price ?? 0,
      category: product.category ?? 'ETC',
      status: product.status ?? 'ACTIVE',
      createdAt:
        product.createdAt ??
        new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  const isUpdate = Boolean(product.id)

  const path = isUpdate
    ? `/api/admin/products/${product.id}`
    : '/api/admin/products'

  const response =
    await apiFetch<AdminProductApiResponse>(
      path,
      {
        method: isUpdate ? 'PATCH' : 'POST',
        body: {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.image,
          category: product.category,
          ...(isUpdate
            ? {
              status: product.status,
            }
            : {}),
        },
      },
    )

  return convertProduct(response)
}

export async function deleteProduct(
  id: string,
): Promise<void> {
  if (USE_MOCK) {
    return mockDelay(undefined, 300)
  }

  await apiFetch<void>(
    `/api/admin/products/${id}`,
    {
      method: 'DELETE',
    },
  )
}

// ============================================================
// 이벤트 관리
// ============================================================

export async function getAdminEvents(): Promise<
  EventSummary[]
> {
  if (USE_MOCK) {
    return mockDelay(mockEvents)
  }

  return apiFetch<EventSummary[]>(
    '/api/admin/events',
  )
}

export async function saveEvent(
  event: Partial<EventSummary>,
): Promise<EventSummary> {
  if (USE_MOCK) {
    return mockDelay<EventSummary>({
      id: event.id ?? `e_${Date.now()}`,
      title: event.title ?? '',
      description: event.description ?? '',
      image:
        event.image ??
        '/images/events/tech-friday.png',
      status: event.status ?? 'UPCOMING',
      startAt:
        event.startAt ??
        new Date().toISOString(),
      endAt:
        event.endAt ??
        new Date().toISOString(),
      productCount: event.productCount ?? 0,
    })
  }

  const path = event.id
    ? `/api/admin/events/${event.id}`
    : '/api/admin/events'

  return apiFetch<EventSummary>(path, {
    method: event.id ? 'PATCH' : 'POST',
    body: event,
  })
}

export async function deleteEvent(
  id: string,
): Promise<void> {
  if (USE_MOCK) {
    return mockDelay(undefined, 300)
  }

  await apiFetch<void>(
    `/api/admin/events/${id}`,
    {
      method: 'DELETE',
    },
  )
}

// ============================================================
// 이벤트 상품 관리
// ============================================================

export async function getAdminEventProducts(): Promise<
  EventProduct[]
> {
  if (USE_MOCK) {
    return mockDelay(mockEventProducts)
  }

  return apiFetch<EventProduct[]>(
    '/api/admin/event-products',
  )
}

export async function saveEventProduct(
  ep: Partial<EventProduct>,
): Promise<EventProduct> {
  if (USE_MOCK) {
    const existingIndex = ep.id
      ? mockEventProducts.findIndex(
        (item) => item.id === ep.id,
      )
      : -1

    if (existingIndex >= 0) {
      const previous =
        mockEventProducts[existingIndex]

      const totalStock =
        ep.totalStock ?? previous.totalStock

      const soldAndReserved =
        previous.soldCount +
        previous.reservedStock

      const updated: EventProduct = {
        ...previous,
        ...ep,
        totalStock,
        remainingStock: Math.max(
          0,
          totalStock - soldAndReserved,
        ),
        description:
          ep.description ??
          previous.description ??
          '',
        category:
          ep.category ??
          previous.category ??
          '기타',
      }

      mockEventProducts[existingIndex] =
        updated

      return mockDelay(updated)
    }

    const product = mockProducts.find(
      (item) => item.id === ep.productId,
    )

    const totalStock = ep.totalStock ?? 0

    const created: EventProduct = {
      id: ep.id ?? `ep_${Date.now()}`,
      eventId: ep.eventId ?? '',
      productId: ep.productId ?? '',
      name: product?.name ?? ep.name ?? '',
      image:
        product?.image ??
        ep.image ??
        '/placeholder.svg',
      originalPrice:
        product?.price ??
        ep.originalPrice ??
        0,
      eventPrice: ep.eventPrice ?? 0,
      purchaseLimit: ep.purchaseLimit,
      totalStock,
      remainingStock: totalStock,
      reservedStock: 0,
      soldCount: 0,
      status: ep.status ?? 'READY',
      description:
        product?.description ??
        ep.description ??
        '',
      category:
        product?.category ??
        ep.category ??
        '기타',
    }

    mockEventProducts.push(created)

    return mockDelay(created)
  }

  const path = ep.id
    ? `/api/admin/event-products/${ep.id}`
    : '/api/admin/event-products'

  return apiFetch<EventProduct>(path, {
    method: ep.id ? 'PATCH' : 'POST',
    body: ep,
  })
}

export async function deleteEventProduct(
  id: string,
): Promise<void> {
  if (USE_MOCK) {
    return mockDelay(undefined, 300)
  }

  await apiFetch<void>(
    `/api/admin/event-products/${id}`,
    {
      method: 'DELETE',
    },
  )
}

// ============================================================
// 재고 관리
// ============================================================

interface StockResponseDTO {
  id?: number
  eventProductId: number | string
  productName: string
  eventTitle: string
  totalQuantity: number
  remainingQuantity: number
  reservedQuantity: number
  soldQuantity: number
}

export const getStockRows = async (): Promise<StockRow[]> => {
  if (USE_MOCK) {
    return mockDelay(buildStockRows())
  }

  const data = await apiFetch<StockResponseDTO[]>('/api/admin/stocks')

  return data.map((item) => ({
    eventProductId: String(item.eventProductId),
    productName: item.productName || `이벤트 상품 #${item.eventProductId}`,
    eventTitle: item.eventTitle || '-',
    totalStock: item.totalQuantity,
    remainingStock: item.remainingQuantity,
    reservedStock: item.reservedQuantity,
    soldCount: item.soldQuantity,
  }))
}

export const updateStock = async (
  eventProductId: string | number,
  quantity: number,
): Promise<string> => {
  if (USE_MOCK) {
    return mockDelay('수정 완료')
  }

  return apiFetch<string>(`/api/admin/stocks/${eventProductId}`, {
    method: 'PATCH',
    body: { quantity }, 
  })
}

export const forceSoldOut = async (
  eventProductId: string | number,
): Promise<string> => {
  if (USE_MOCK) {
    return mockDelay('품절 처리 완료')
  }

  return apiFetch<string>(`/api/admin/stocks/${eventProductId}/sold-out`, {
    method: 'PATCH',
  })
}

// ============================================================
// 주문 관리
// ============================================================

export async function getAdminOrders(): Promise<
  Order[]
> {
  if (USE_MOCK) {
    return mockDelay(mockOrders)
  }

  return apiFetch<Order[]>(
    '/api/admin/orders',
  )
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Promise<Order> {
  if (USE_MOCK) {
    const order =
      mockOrders.find(
        (item) => item.id === orderId,
      ) ?? mockOrders[0]

    return mockDelay({
      ...order,
      status,
    })
  }

  return apiFetch<Order>(
    `/api/admin/orders/${orderId}/status`,
    {
      method: 'PATCH',
      body: {
        status,
      },
    },
  )
}

// ============================================================
// 대기열 관리
// ============================================================

export async function getQueueAdminRows(): Promise<
  QueueAdminRow[]
> {
  if (USE_MOCK) {
    return mockDelay(buildQueueRows())
  }

  return apiFetch<QueueAdminRow[]>(
    '/api/admin/queues',
  )
}

export async function setQueueGate(
  eventId: string,
  gateStatus: 'OPEN' | 'CLOSED',
): Promise<void> {
  if (USE_MOCK) {
    return mockDelay(undefined, 300)
  }

  await apiFetch<void>(
    `/api/admin/queues/${eventId}/gate`,
    {
      method: 'PATCH',
      body: {
        gateStatus,
      },
    },
  )
}

export async function resetQueue(
  eventId: string,
): Promise<void> {
  if (USE_MOCK) {
    return mockDelay(undefined, 300)
  }

  await apiFetch<void>(
    `/api/admin/queues/${eventId}/reset`,
    {
      method: 'POST',
    },
  )
}

// ============================================================
// 모니터링
// ============================================================

export async function getSystemMetrics(): Promise<
  SystemMetric[]
> {
  if (USE_MOCK) {
    return mockDelay(mockSystemMetrics)
  }

  return apiFetch<SystemMetric[]>(
    '/api/monitoring/metrics',
  )
}

export async function getLogs(): Promise<
  LogEntry[]
> {
  if (USE_MOCK) {
    return mockDelay(mockLogs)
  }

  return apiFetch<LogEntry[]>(
    '/api/monitoring/logs',
  )
}