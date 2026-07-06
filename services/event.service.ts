import type { EventDetail, EventProduct, EventSummary } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import { mockEventProducts, mockEvents, mockProducts } from './mock-data'

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
  return apiFetch<EventDetail>(`/api/events/${eventId}`)
}

export async function getEventProduct(
  eventProductId: string,
): Promise<EventProduct> {
  if (USE_MOCK) {
    const ep = mockEventProducts.find((p) => p.id === eventProductId)
    if (!ep) throw new Error('상품을 찾을 수 없습니다.')
    return mockDelay(ep)
  }
  return apiFetch<EventProduct>(`/api/event-products/${eventProductId}`)
}

export async function getPopularEventProducts(): Promise<EventProduct[]> {
  // if (USE_MOCK) {
  if (true) {
    const list = [...mockEventProducts]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 4)
      .map(withCategory)
    return mockDelay(list)
  }
  // return apiFetch<EventProduct[]>('/api/event-products/popular')
}

// 카테고리별 쇼케이스: 판매중/판매 예정 상품에 카테고리를 채워 반환
export async function getShowcaseProducts(): Promise<EventProduct[]> {
  // if (USE_MOCK) {
  if (true) {
    const list = mockEventProducts
      .filter((ep) => ep.status !== 'STOPPED')
      .map(withCategory)
    return mockDelay(list)
  }
  // return apiFetch<EventProduct[]>('/api/event-products/showcase')
}
