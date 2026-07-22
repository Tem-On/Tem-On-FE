// ============================================================
// Tem-On 공통 도메인 타입
// ============================================================

export type EventStatus =
  | 'OPEN'
  | 'UPCOMING'
  | 'CLOSED'

export type EventProductStatus =
  | 'READY'
  | 'ON_SALE'
  | 'SOLD_OUT'
  | 'HIDDEN'
  | 'DELETED'

export type ProductStatus =
  | 'ACTIVE'
  | 'SOLD_OUT'
  | 'HIDDEN'
  | 'DELETED'

export type ProductCategory =
  | 'FASHION'
  | 'SHOES'
  | 'BAG'
  | 'ACCESSORY'
  | 'ELECTRONIC'
  | 'DIGITAL_DEVICE'
  | 'HOME_APPLIANCE'
  | 'BEAUTY'
  | 'FOOD'
  | 'LIVING'
  | 'SPORTS'
  | 'TOY'
  | 'BOOK'
  | 'PET'
  | 'BABY'
  | 'HEALTH'
  | 'INTERIOR'
  | 'LIFESTYLE'
  | 'ETC'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentMethod =
  | 'CARD'
  | 'KAKAO_PAY'
  | 'NAVER_PAY'

export type PaymentStatus =
  | 'READY'
  | 'PAID'
  | 'FAILED'
  | 'CANCELED'

export type QueueStatus =
  | 'WAITING'
  | 'READY'
  | 'ENTERED'
  | 'EXPIRED'

export type QueueGateStatus =
  | 'OPEN'
  | 'CLOSED'

export type QueueRealtimeType =
  | 'ENTER'
  | 'EXPIRE'
  | 'COMPLETE'
  | 'RESET'

// ============================================================
// 사용자
// ============================================================

export interface User {
  id: string
  nickname: string
  email: string
  phone?: string
  profileImage?: string
  point?: number
  createdAt: string
}

// ============================================================
// 상품
// ============================================================

export interface Product {
  id: string
  name: string
  description: string
  image: string
  price: number
  category: ProductCategory
  status: ProductStatus
  createdAt: string
  updatedAt?: string
}

export interface AdminProductApiResponse {
  id: number
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: ProductCategory
  status: ProductStatus
  createdAt: string
  updatedAt: string | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// ============================================================
// 이벤트
// ============================================================

export interface EventSummary {
  id: string
  title: string
  description: string
  image: string
  status: EventStatus
  startAt: string
  endAt: string
  productCount: number
}

export interface AdminEventProductApiResponse {
  id: number
  eventId: number
  eventTitle: string

  productId: number
  productName: string
  productImageUrl: string | null
  originalPrice: number
  categoryName: string
  productStatus: string

  eventPrice: number
  purchaseLimit: number | null
  eventProductStatus: EventProductStatus
  createdAt: string
}

export interface AdminEventApiResponse {
  id: number
  title: string
  description: string | null
  image: string | null
  startAt: string
  endAt: string
  status: EventStatus
  productCount: number
  products: AdminEventProductApiResponse[]
}

export interface EventProduct {
  id: string
  eventId: string
  productId: string
  name: string
  image: string
  originalPrice: number
  eventPrice: number
  purchaseLimit?: number
  totalStock: number
  remainingStock: number
  reservedStock: number
  soldCount: number
  status: EventProductStatus
  description: string
  category: string
}

export interface EventDetail {
  id: string
  title: string
  description: string
  image?: string
  status: EventStatus
  startAt: string
  endAt: string
  productCount: number
  products: EventProduct[]
}

// ============================================================
// 대기열
// ============================================================

export interface QueueState {
  eventId: string
  eventProductId?: string
  position: number
  totalWaiting: number
  estimatedSeconds: number
  canEnter: boolean
  status: QueueStatus
}

// ============================================================
// 주문 및 결제
// ============================================================

export interface OrderItem {
  eventProductId: string
  name: string
  image: string
  eventPrice: number
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
  paidAt?: string
  canceledAt?: string | null
  paymentId?: number | null
}

export interface Payment {
  paymentId: number
  paymentNumber: string
  orderId: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
}

// ============================================================
// 관리자
// ============================================================

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  paidCount: number
  cancelledCount: number
  activeEvents: number
  soldQuantity: number
}

export interface RevenuePoint {
  label: string
  revenue: number
  orders: number
}

export interface StockRow {
  eventProductId: string
  productName: string
  eventTitle: string
  totalStock: number
  remainingStock: number
  reservedStock: number
  soldCount: number
}

export interface QueueAdminRow {
  eventId: string
  eventTitle: string
  waitingCount: number
  enteredCount: number
  gateStatus: QueueGateStatus
}

// ============================================================
// 모니터링
// ============================================================

export type SystemMetricStatus =
  | 'healthy'
  | 'warning'
  | 'critical'

export interface SystemMetric {
  label: string
  value: string
  unit: string
  status: SystemMetricStatus
}

export type LogLevel =
  | 'INFO'
  | 'WARN'
  | 'ERROR'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
}

// ============================================================
// 실시간 이벤트 페이로드
// ============================================================

export interface StockUpdateMessage {
  eventProductId: string
  remainingStock: number
  reservedStock: number
  soldCount: number
  status: EventProductStatus
}

export interface QueueUpdateMessage {
  eventId: string
  position: number
  totalWaiting: number
  estimatedSeconds: number
  canEnter: boolean
  status: QueueStatus
  type?: QueueRealtimeType
  message?: string
}

export interface EventStatusMessage {
  eventId: string
  status: EventStatus
}