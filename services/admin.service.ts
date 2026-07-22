import type {
  AdminEventApiResponse,
  AdminEventProductApiResponse,
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

function convertEvent(
  event: AdminEventApiResponse,
): EventSummary {
  return {
    id: String(event.id),
    title: event.title,
    description: event.description ?? '',
    image: event.image ?? '/placeholder.svg',
    status: event.status,
    startAt: event.startAt,
    endAt: event.endAt,
    productCount: event.productCount ?? 0,
  }
}

interface EventInfoRequest {
  title: string
  description: string
  startAt: string
  endAt: string
}

interface EventStatusRequest {
  status: EventSummary['status']
}

export async function getAdminEvents(): Promise<
  EventSummary[]
> {
  if (USE_MOCK) {
    return mockDelay(mockEvents)
  }

  const response =
    await apiFetch<AdminEventApiResponse[]>(
      '/api/admin/events',
    )

  return response.map(convertEvent)
}

export async function getAdminEvent(
  id: string,
): Promise<EventSummary> {
  if (USE_MOCK) {
    const found = mockEvents.find(
      (event) => event.id === id,
    )

    if (!found) {
      throw new Error(
        '이벤트를 찾을 수 없습니다.',
      )
    }

    return mockDelay(found)
  }

  const response =
    await apiFetch<AdminEventApiResponse>(
      `/api/admin/events/${id}`,
    )

  return convertEvent(response)
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
        event.image ?? '/placeholder.svg',
      status: event.status ?? 'UPCOMING',
      startAt:
        event.startAt ??
        new Date().toISOString(),
      endAt:
        event.endAt ??
        new Date().toISOString(),
      productCount:
        event.productCount ?? 0,
    })
  }

  if (!event.title?.trim()) {
    throw new Error(
      '이벤트명을 입력해주세요.',
    )
  }

  if (!event.startAt) {
    throw new Error(
      '이벤트 시작일을 입력해주세요.',
    )
  }

  if (!event.endAt) {
    throw new Error(
      '이벤트 종료일을 입력해주세요.',
    )
  }

  const requestBody: EventInfoRequest = {
    title: event.title.trim(),
    description:
      event.description?.trim() ?? '',
    startAt: event.startAt,
    endAt: event.endAt,
  }

  const isUpdate = Boolean(event.id)

  const path = isUpdate
    ? `/api/admin/events/${event.id}`
    : '/api/admin/events'

  const response =
    await apiFetch<AdminEventApiResponse>(
      path,
      {
        method: isUpdate
          ? 'PATCH'
          : 'POST',
        body: requestBody,
      },
    )

  let savedEvent = convertEvent(response)

  const selectedStatus =
    event.status ?? 'UPCOMING'

  /*
   * 생성 API에서는 기본값이 UPCOMING입니다.
   * 수정 API에서는 기본정보만 수정합니다.
   *
   * 따라서 화면에서 선택한 상태와 서버 상태가 다르면
   * 상태 변경 API를 추가 호출합니다.
   */
  if (
    selectedStatus !== savedEvent.status
  ) {
    const statusRequest: EventStatusRequest = {
      status: selectedStatus,
    }

    const statusResponse =
      await apiFetch<AdminEventApiResponse>(
        `/api/admin/events/${savedEvent.id}/status`,
        {
          method: 'PATCH',
          body: statusRequest,
        },
      )

    savedEvent =
      convertEvent(statusResponse)
  }

  return savedEvent
}

export async function updateEventStatus(
  eventId: string,
  status: EventSummary['status'],
): Promise<EventSummary> {
  if (USE_MOCK) {
    const found = mockEvents.find(
      (event) => event.id === eventId,
    )

    if (!found) {
      throw new Error(
        '이벤트를 찾을 수 없습니다.',
      )
    }

    return mockDelay({
      ...found,
      status,
    })
  }

  const response =
    await apiFetch<AdminEventApiResponse>(
      `/api/admin/events/${eventId}/status`,
      {
        method: 'PATCH',
        body: {
          status,
        },
      },
    )

  return convertEvent(response)
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

function convertEventProduct(
  item: AdminEventProductApiResponse,
): EventProduct {
  return {
    id: String(item.id),
    eventId: String(item.eventId),
    productId: String(item.productId),

    name: item.productName,
    image:
      item.productImageUrl ??
      '/placeholder.svg',

    originalPrice: item.originalPrice,
    eventPrice: item.eventPrice,
    purchaseLimit:
      item.purchaseLimit ?? undefined,

    totalStock: item.totalStock ?? 0,
    remainingStock:
      item.remainingStock ?? 0,
    reservedStock:
      item.reservedStock ?? 0,
    soldCount: item.soldCount ?? 0,

    status: item.eventProductStatus,
    description: '',
    category: item.categoryName ?? '기타',
  }
}

interface EventProductCreateBody {
  eventId: number
  productId: number
  eventPrice: number
  purchaseLimit: number | null
}

interface EventProductUpdateBody {
  productId: number
  eventPrice: number
  purchaseLimit: number | null
}

interface EventProductStatusBody {
  status: EventProduct['status']
}

interface StockCreateBody {
  eventProductId: number
  quantity: number
}

interface StockUpdateBody {
  quantity: number
}

export async function getAdminEventProducts(): Promise<
  EventProduct[]
> {
  if (USE_MOCK) {
    return mockDelay(mockEventProducts)
  }

  const response = await apiFetch<
    AdminEventProductApiResponse[]
  >('/api/admin/event-products')

  return response.map(convertEventProduct)
}

export async function getAdminEventProduct(
  id: string,
): Promise<EventProduct> {
  if (USE_MOCK) {
    const found = mockEventProducts.find(
      (item) => item.id === id,
    )

    if (!found) {
      throw new Error(
        '이벤트 상품을 찾을 수 없습니다.',
      )
    }

    return mockDelay(found)
  }

  const response =
    await apiFetch<AdminEventProductApiResponse>(
      `/api/admin/event-products/${id}`,
    )

  return convertEventProduct(response)
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

  if (!ep.eventId) {
    throw new Error(
      '이벤트 ID가 존재하지 않습니다.',
    )
  }

  if (!ep.productId) {
    throw new Error(
      '상품 ID가 존재하지 않습니다.',
    )
  }

  if (
    ep.eventPrice === undefined ||
    ep.eventPrice <= 0
  ) {
    throw new Error(
      '이벤트 가격이 올바르지 않습니다.',
    )
  }

  if (
    ep.totalStock === undefined ||
    ep.totalStock <= 0
  ) {
    throw new Error(
      '재고 수량이 올바르지 않습니다.',
    )
  }

  const selectedStatus =
    ep.status ?? 'READY'

  // ==========================================================
  // 수정
  // ==========================================================

  if (ep.id) {
    const updateBody: EventProductUpdateBody = {
      productId: Number(ep.productId),
      eventPrice: ep.eventPrice,
      purchaseLimit:
        ep.purchaseLimit ?? null,
    }

    await apiFetch<AdminEventProductApiResponse>(
      `/api/admin/event-products/${ep.id}`,
      {
        method: 'PATCH',
        body: updateBody,
      },
    )

    const stockBody: StockUpdateBody = {
      quantity: ep.totalStock,
    }

    await apiFetch<string>(
      `/api/admin/stocks/${ep.id}`,
      {
        method: 'PATCH',
        body: stockBody,
      },
    )

    const statusBody: EventProductStatusBody = {
      status: selectedStatus,
    }

    await apiFetch<AdminEventProductApiResponse>(
      `/api/admin/event-products/${ep.id}/status`,
      {
        method: 'PATCH',
        body: statusBody,
      },
    )

    return getAdminEventProduct(ep.id)
  }

  // ==========================================================
  // 신규 생성
  // ==========================================================

  const createBody: EventProductCreateBody = {
    eventId: Number(ep.eventId),
    productId: Number(ep.productId),
    eventPrice: ep.eventPrice,
    purchaseLimit:
      ep.purchaseLimit ?? null,
  }

  /**
   * 1. Commerce Service에 이벤트 상품 생성
   * 2. 생성된 이벤트 상품 ID를 응답받음
   */
  const created =
    await apiFetch<AdminEventProductApiResponse>(
      '/api/admin/event-products',
      {
        method: 'POST',
        body: createBody,
      },
    )

  /**
   * 3. QueueStock Service에 초기 재고 생성
   */
  const stockBody: StockCreateBody = {
    eventProductId: created.id,
    quantity: ep.totalStock,
  }

  try {
    await apiFetch<string>(
      '/api/admin/stocks',
      {
        method: 'POST',
        body: stockBody,
      },
    )
  } catch (error) {
    /**
     * 재고 생성에 실패하면 이벤트 상품도 삭제 처리해서
     * 이벤트 상품만 남는 불완전한 상태를 최소화한다.
     */
    try {
      await apiFetch<string>(
        `/api/admin/event-products/${created.id}`,
        {
          method: 'DELETE',
        },
      )
    } catch {
      // 원래 재고 생성 오류를 유지한다.
    }

    throw error
  }

  /**
   * 4. READY가 아닌 상태를 선택했다면 상태 변경
   */
  if (selectedStatus !== 'READY') {
    const statusBody: EventProductStatusBody = {
      status: selectedStatus,
    }

    await apiFetch<AdminEventProductApiResponse>(
      `/api/admin/event-products/${created.id}/status`,
      {
        method: 'PATCH',
        body: statusBody,
      },
    )
  }

  /**
   * 5. 재고까지 반영된 최종 데이터 재조회
   */
  return getAdminEventProduct(
    String(created.id),
  )
}

export async function deleteEventProduct(
  id: string,
): Promise<void> {
  if (USE_MOCK) {
    const index =
      mockEventProducts.findIndex(
        (item) => item.id === id,
      )

    if (index >= 0) {
      mockEventProducts.splice(index, 1)
    }

    return mockDelay(undefined, 300)
  }

  await apiFetch<string>(
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