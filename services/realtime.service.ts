import SockJS from 'sockjs-client'
import type {
  EventStatusMessage,
  LogEntry,
  QueueUpdateMessage,
  StockUpdateMessage,
} from '@/types'
import { USE_MOCK } from './api-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? ''

type Unsubscribe = () => void

type BackendQueueRealtimeMessage = {
  eventProductId: number | string
  currentUsers: number
  message: string
}

let stompClient: any = null
let stompReady: Promise<void> | null = null

async function getStompClient() {
  if (stompReady) {
    await stompReady
    return stompClient
  }

  stompReady = (async () => {
    const { Client } = await import('@stomp/stompjs')

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('temon_token')
        : null

    stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      debug: (msg) => {
        console.log('[STOMP]', msg)
      },
    })

    await new Promise<void>((resolve, reject) => {
      stompClient.onConnect = () => resolve()

      stompClient.onStompError = (frame: any) => {
        console.error('[STOMP ERROR]', frame.headers?.message, frame.body)
        reject(frame)
      }

      stompClient.onWebSocketError = (error: unknown) => {
        console.error('[WebSocket ERROR]', error)
      }

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

export function subscribeStock(
  eventProductId: string,
  onUpdate: (msg: StockUpdateMessage) => void,
  seed?: { remainingStock: number; reservedStock: number; soldCount: number },
): Unsubscribe {
  if (!USE_MOCK) {
    return subscribeStomp<StockUpdateMessage>(
      `/topic/stocks/${eventProductId}`,
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

export function subscribeQueue(
  eventProductId: string,
  onUpdate: (msg: QueueUpdateMessage) => void,
  seed?: { position: number; totalWaiting: number },
): Unsubscribe {
  if (!USE_MOCK) {
    return subscribeStomp<BackendQueueRealtimeMessage>(
      `/topic/queue/${eventProductId}`,
      (msg) => {
        onUpdate({
          eventId: String(msg.eventProductId),
          position: seed?.position ?? Number(msg.currentUsers),
          totalWaiting: Number(msg.currentUsers),
          estimatedSeconds: (seed?.position ?? Number(msg.currentUsers)) * 3,
          canEnter: false,
          status: 'WAITING',
        })
      },
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
      eventId: eventProductId,
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

export function subscribeEventStatus(
  eventId: string,
  onUpdate: (msg: EventStatusMessage) => void,
): Unsubscribe {
  if (!USE_MOCK) {
    return subscribeStomp<EventStatusMessage>('/topic/events', onUpdate)
  }

  return () => {}
}

const LOG_SOURCES = [
  'order-service',
  'queue-service',
  'stock-service',
  'gateway',
  'payment-service',
]

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