import type { EventDetail, EventProduct, EventSummary } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import { mockEventProducts, mockEvents, mockProducts } from './mock-data'

/**
 * 💡 백엔드에서 온 날것의(Raw) JSON 데이터를 프론트엔드 규격(Camel Case)에 맞게 가공하는 세탁 함수
 */
function mapToEventProduct(raw: any): EventProduct {
  if (!raw) return {} as EventProduct;
  
  // 백엔드가 DTO를 뱉을 때 포함시켰을 법한 다양한 필드명(스네이크, 조인 객체 등)을 교차 검증합니다.
  return {
    id: String(raw.id ?? ''),
    eventId: String(raw.eventId ?? raw.event_id ?? raw.event?.id ?? ''),
    productId: String(raw.productId ?? raw.product_id ?? ''),
    name: raw.name ?? raw.productName ?? '',
    image: raw.image ?? raw.imageUrl ?? '/images/products/sneaker.png',
    originalPrice: raw.originalPrice ?? raw.original_price ?? 0,
    eventPrice: raw.eventPrice ?? raw.event_price ?? 0,
    totalStock: raw.totalStock ?? raw.total_stock ?? 0,
    remainingStock: raw.remainingStock ?? raw.remaining_stock ?? 0,
    reservedStock: raw.reservedStock ?? raw.reserved_stock ?? 0,
    soldCount: raw.soldCount ?? raw.sold_count ?? 0,
    status: raw.status ?? 'ON_SALE',
    description: raw.description ?? '',
    category: raw.category ?? '기타'
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
    if (!event) throw new Error('이벤트를 찾을 수 없습니다.')
    const products = mockEventProducts.filter((p) => p.eventId === eventId)
    return mockDelay({ ...event, products })
  }
  // 💡 상세 페이지에서도 안전하게 상품 리스트 세탁기 처리
  const res = await apiFetch<any>(`/api/events/${eventId}`)
  if (res && Array.isArray(res.products)) {
    res.products = res.products.map(mapToEventProduct)
  }
  return res as EventDetail
}

export async function getEventProduct(
  eventProductId: string,
): Promise<EventProduct> {
  if (USE_MOCK) {
    const ep = mockEventProducts.find((p) => p.id === eventProductId)
    if (!ep) throw new Error('상품을 찾을 수 없습니다.')
    return mockDelay(ep)
  }
  // 💡 단일 상품 상세 조회 시 세탁기 작동
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
  // 💡 인기 상품 조회 시 세탁기 작동
  const data = await apiFetch<any[]>('/api/event-products/popular')
  return (data ?? []).map(mapToEventProduct)
}

// 카테고리별 쇼케이스: 판매중/판매 예정 상품에 카테고리를 채워 반환
export async function getShowcaseProducts(): Promise<EventProduct[]> {
  if (USE_MOCK) {
    const list = mockEventProducts
      .filter((ep) => ep.status !== 'STOPPED')
      .map(withCategory)
    return mockDelay(list)
  }
  // 💡 쇼케이스 상품 조회 시 세탁기 작동
  const data = await apiFetch<any[]>('/api/event-products/showcase')
  return (data ?? []).map(mapToEventProduct)
}