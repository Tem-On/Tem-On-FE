import type {
  EventStatusMessage,
  LogEntry,
  QueueUpdateMessage,
  StockUpdateMessage,
} from '@/types'
import { USE_MOCK } from './api-client'

// ============================================================
// 실시간(WebSocket / STOMP) 서비스
//
// 실제 백엔드 연동:
//   NEXT_PUBLIC_WS_URL 로 STOMP over WebSocket 브로커에 연결하고
//   아래 destination 을 구독합니다.
//     - /topic/stock/{eventProductId}
//     - /topic/queue/{eventId}/{userId}
//     - /topic/event/{eventId}/status
//
// 데모(mock) 모드에서는 setInterval 로 실시간 변경을 시뮬레이션합니다.
// ============================================================

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? ''

type Unsubscribe = () => void

// ---------- STOMP 클라이언트 (실제 연동) ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stompClient: any = null
let stompReady: Promise<void> | null = null

async function getStompClient() {
  if (stompReady) {
    await stompReady
    return stompClient
  }
  stompReady = (async () => {
    const { Client } = await import('@stomp/stompjs')
    stompClient = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })
    await new Promise<void>((resolve) => {
      stompClient.onConnect = () => resolve()
      stompClient.activate()
    })
  })()
  await stompReady
  return stompClient
}

function subscribeStomp<T>(
  destination: string,
  onMessage: (data: T) => void,
): Unsubscribe {
  let sub: { unsubscribe: () => void } | null = null
  let active = true
  getStompClient().then((client) => {
    if (!active) return
    sub = client.subscribe(destination, (frame: { body: string }) => {
      onMessage(JSON.parse(frame.body) as T)
    })
  })
  return () => {
    active = false
    sub?.unsubscribe()
  }
}

// ---------- 재고 실시간 구독 ----------

export function subscribeStock(
  eventProductId: string,
  onUpdate: (msg: StockUpdateMessage) => void,
  seed?: { remainingStock: number; reservedStock: number; soldCount: number },
): Unsubscribe {
  if (!USE_MOCK) {
    return subscribeStomp<StockUpdateMessage>(
      `/topic/stock/${eventProductId}`,
      onUpdate,
    )
  }
  let remaining = seed?.remainingStock ?? 60
  let reserved = seed?.reservedStock ?? 5
  let sold = seed?.soldCount ?? 40
  const timer = setInterval(() => {
    if (remaining <= 0) return
    const bought = Math.min(remaining, Math.floor(Math.random() * 3))
    remaining -= bought
    sold += bought
    reserved = Math.max(0, reserved + (Math.random() > 0.5 ? 1 : -1))
    onUpdate({
      eventProductId,
      remainingStock: remaining,
      reservedStock: reserved,
      soldCount: sold,
      status: remaining <= 0 ? 'SOLD_OUT' : 'ON_SALE',
    })
  }, 2500)
  return () => clearInterval(timer)
}

// ---------- 대기열 순번 실시간 구독 ----------

export function subscribeQueue(
  eventId: string,
  onUpdate: (msg: QueueUpdateMessage) => void,
  seed?: { position: number; totalWaiting: number },
): Unsubscribe {
  if (!USE_MOCK) {
    return subscribeStomp<QueueUpdateMessage>(
      `/topic/queue/${eventId}`,
      onUpdate,
    )
  }
  let position = seed?.position ?? 240
  let totalWaiting = seed?.totalWaiting ?? 720
  const timer = setInterval(() => {
    const moved = Math.floor(Math.random() * 8) + 2
    position = Math.max(0, position - moved)
    totalWaiting = Math.max(position, totalWaiting - moved - 3)
    const canEnter = position <= 0
    onUpdate({
      eventId,
      position,
      totalWaiting,
      estimatedSeconds: position * 3,
      canEnter,
      status: canEnter ? 'READY' : 'WAITING',
    })
    if (canEnter) clearInterval(timer)
  }, 1800)
  return () => clearInterval(timer)
}

// ---------- 이벤트 상태 실시간 구독 ----------

export function subscribeEventStatus(
  eventId: string,
  onUpdate: (msg: EventStatusMessage) => void,
): Unsubscribe {
  if (!USE_MOCK) {
    return subscribeStomp<EventStatusMessage>(
      `/topic/event/${eventId}/status`,
      onUpdate,
    )
  }
  // 데모: 상태 변경 이벤트는 자주 발생하지 않으므로 no-op
  return () => {}
}

// ---------- 실시간 로그 스트림 구독 ----------

const LOG_SOURCES = ['order-service', 'queue-service', 'stock-service', 'gateway', 'payment-service']
const LOG_LEVELS: LogEntry['level'][] = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR']
const LOG_MESSAGES = [
  '주문이 정상적으로 접수되었습니다.',
  '대기열 입장 토큰이 발급되었습니다.',
  '재고 차감 트랜잭션이 커밋되었습니다.',
  '결제 승인 요청을 전송했습니다.',
  '재고 잔량이 임계치 이하로 감소했습니다.',
  '동시 접속자 급증으로 응답이 지연되고 있습니다.',
  '결제 게이트웨이 응답 지연이 감지되었습니다.',
]

export function subscribeLogs(onLog: (entry: LogEntry) => void): Unsubscribe {
  if (!USE_MOCK) {
    return subscribeStomp<LogEntry>('/topic/logs', onLog)
  }
  const timer = setInterval(() => {
    const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)]
    onLog({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      source: LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)],
      message: LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)],
    })
  }, 1500)
  return () => clearInterval(timer)
}
