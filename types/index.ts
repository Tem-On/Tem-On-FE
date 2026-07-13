// ============================================================
// Tem-On 공통 도메인 타입
// ============================================================

export type EventStatus = 'OPEN' | 'UPCOMING' | 'CLOSED'

export type EventProductStatus =
  | 'ON_SALE'
  | 'SOLD_OUT'
  | 'READY'
  | 'STOPPED'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

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

export interface User {
  id: string
  nickname: string
  email: string
  phone?: string
  profileImage?: string
  point?: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  image: string
  price: number
  category: string
  createdAt: string
}

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
  status: string
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

export interface QueueState {
  eventId: string
  eventProductId?: string
  position: number
  totalWaiting: number
  estimatedSeconds: number
  canEnter: boolean
  status: QueueStatus
}

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
}

// ---------- 관리자 ----------

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

export interface SystemMetric {
  label: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  source: string
  message: string
}

// ---------- 실시간 이벤트 페이로드 ----------

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