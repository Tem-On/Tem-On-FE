import type { EventDetail, EventProduct, EventSummary } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'
import { mockEventProducts, mockEvents, mockProducts } from './mock-data'

/**
 * 💡 백엔드에서 직접 내려주는 한글 카테고리명(categoryName)을
 * 프론트엔드 메인 화면의 4대 핵심 탭 컴포넌트 구조에 맞게 그룹핑합니다.
 */
const BE_CATEGORY_MAP: Record<string, string> = {
  // 1. 패션 그룹
  '패션': '패션',
  '신발': '패션',
  '가방': '패션',
  '액세서리': '패션',

  // 2. 전자기기 그룹
  '전자기기': '전자기기',
  '디지털기기': '전자기기',
  '생활가전': '전자기기',

  // 3. 리빙 그룹
  '라이프스타일': '리빙',
  '생활용품': '리빙',
  '인테리어': '리빙',
  '식품': '리빙',       // 식품, 반려동물 등도 리빙/라이프스타일 탭으로 편입
  '반려동물': '리빙',
  '완구': '리빙',
  '도서': '리빙',

  // 4. 뷰티 그룹
  '뷰티': '뷰티',
  '헬스/건강': '뷰티'
}

function mapToEventProduct(raw: any): EventProduct {
  if (!raw) return {} as EventProduct;
  
  // 💡 범인 검거: 백엔드가 내려주는 진짜 카테고리 필드는 'categoryName'이었습니다!
  // 혹시 모를 기존 필드명(category) 스펙도 방어용으로 함께 둡니다.
  const rawCategory = raw.categoryName ?? raw.category ?? raw.productCategory ?? '';
  
  // 텍스트 매핑 (공백 제거 후 매칭, 일치하는 그룹이 없으면 기본값 '패션'으로 안착)
  const cleanKey = String(rawCategory).trim();
  const resolvedCategory = BE_CATEGORY_MAP[cleanKey] ?? '패션';

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
    status: raw.status ?? raw.eventProductStatus ?? 'ON_SALE',
    description: raw.description ?? '',
    category: resolvedCategory // 🎯 정제 완료된 4대 메인 탭 이름 주입
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
  return apiFetch<EventSummary[]>(
    `/api/events${query}`,
    {
      token: null,
      cache: 'force-cache',
    },
  )
}

export async function getEventDetail(eventId: string): Promise<EventDetail> {
  if (USE_MOCK) {
    const event = mockEvents.find((e) => e.id === eventId)

    if (!event) {
      throw new Error('이벤트를 찾을 수 없습니다.')
    }

    const products = mockEventProducts.filter(
      (p) => p.eventId === eventId,
    )

    return mockDelay({
      ...event,
      products,
    })
  }

  const event = await apiFetch<EventDetail>(
    `/api/events/${eventId}`,
    {
      token: null,
      cache: 'force-cache',
    },
  )

  const products = (event.products ?? []).map(mapToEventProduct)

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
      .filter((ep) => ep.status !== 'HIDDEN' && ep.status !== 'DELETED')
      .map(withCategory)

    return mockDelay(list)
  }
  const data = await apiFetch<any[]>('/api/event-products/showcase')
  return (data ?? []).map(mapToEventProduct)
}