import type { EventDetail, EventProduct, EventSummary } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import { mockEventProducts, mockEvents, mockProducts } from './mock-data'

function mapToEventProduct(raw: any): EventProduct {
  return {
    id: String(raw.id ?? ''),
    eventId: String(raw.eventId ?? raw.event_id ?? raw.event?.id ?? ''),
    productId: String(raw.productId ?? raw.product_id ?? ''),

    name: raw.name ?? raw.productName ?? '',
    image:
      raw.image ??
      raw.productImageUrl ??
      raw.imageUrl ??
      '/placeholder.svg',

    originalPrice: raw.originalPrice ?? raw.original_price ?? 0,
    eventPrice: raw.eventPrice ?? raw.event_price ?? 0,
    purchaseLimit: raw.purchaseLimit ?? raw.purchase_limit ?? 1,

    totalStock: raw.totalStock ?? raw.total_stock ?? 0,
    remainingStock: raw.remainingStock ?? raw.remaining_stock ?? 0,
    reservedStock: raw.reservedStock ?? raw.reserved_stock ?? 0,
    soldCount: raw.soldCount ?? raw.sold_count ?? 0,

    status:
      raw.status ??
      raw.eventProductStatus ??
      raw.event_product_status ??
      'ON_SALE',

    description: raw.description ?? '',
    category: raw.category ?? raw.categoryName ?? '기타',
  }
}

function withCategory(ep: EventProduct): EventProduct {
  const product = mockProducts.find((p) => p.id === ep.productId)
  return { ...ep, category: ep.category ?? product?.category ?? '기타' }
}

export async function getEvents(status?: string): Promise<EventSummary[]> {
  if (USE_MOCK) {
    const list = status
      ? mockEvents.filter((e) => e.status === status)
      : mockEvents

    return mockDelay(list)
  }

  const query = status ? `?status=${status}` : ''
  return apiFetch<EventSummary[]>(`/api/events${query}`)
}

export async function getEventDetail(eventId: string): Promise<EventDetail> {
  if (USE_MOCK) {
    const event = mockEvents.find((e) => e.id === eventId)

    if (!event) {
      throw new Error('이벤트를 찾을 수 없습니다.')
    }

    const products = mockEventProducts.filter((p) => p.eventId === eventId)
    return mockDelay({ ...event, products })
  }

  const event = await apiFetch<EventDetail>(`/api/events/${eventId}`)
  const products = await getEventProductsByEventId(eventId)

  return {
    ...event,
    products,
    productCount: products.length,
  }
}

export async function getEventProductsByEventId(
  eventId: string,
): Promise<EventProduct[]> {
  if (USE_MOCK) {
    const products = mockEventProducts.filter((p) => p.eventId === eventId)
    return mockDelay(products)
  }

  const data = await apiFetch<any[]>(`/api/events/${eventId}/products`)
  return (data ?? []).map(mapToEventProduct)
}

export async function getEventProduct(
  eventProductId: string,
): Promise<EventProduct> {
  if (USE_MOCK) {
    const ep = mockEventProducts.find((p) => p.id === eventProductId)

    if (!ep) {
      throw new Error('상품을 찾을 수 없습니다.')
    }

    return mockDelay(ep)
  }

  const data = await apiFetch<any>(`/api/event-products/${eventProductId}`)
  return mapToEventProduct(data)
}

export async function getPopularEventProducts(): Promise<EventProduct[]> {
  if (USE_MOCK) {
    const list = [...mockEventProducts]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 4)
      .map(withCategory)

    return mockDelay(list)
  }

  const data = await apiFetch<any[]>('/api/event-products/popular')
  return (data ?? []).map(mapToEventProduct)
}

export async function getShowcaseProducts(): Promise<EventProduct[]> {
  if (USE_MOCK) {
    const list = mockEventProducts
      .filter((ep) => ep.status !== 'STOPPED')
      .map(withCategory)

    return mockDelay(list)
  }

  const data = await apiFetch<any[]>('/api/event-products/showcase')
  return (data ?? []).map(mapToEventProduct)
}