import type { QueueState } from '@/types'
import { apiFetch, mockDelay, USE_MOCK } from './api-client'

/**
 * 대기열 입장. 초기 순번을 반환합니다.
 * 실시간 순번 갱신은 WebSocket(STOMP) 구독으로 처리합니다.
 */
export async function enterQueue(
  eventId: string,
  eventProductId?: string,
): Promise<QueueState> {
  if (USE_MOCK) {
    const position = Math.floor(Math.random() * 400) + 120
    return mockDelay<QueueState>({
      eventId,
      eventProductId,
      position,
      totalWaiting: position + Math.floor(Math.random() * 500),
      estimatedSeconds: position * 3,
      canEnter: false,
      status: 'WAITING',
    })
  }
  return apiFetch<QueueState>(`/api/events/${eventId}/queue`, {
    method: 'POST',
    body: { eventProductId },
  })
}

export async function leaveQueue(eventId: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined)
  return apiFetch<void>(`/api/events/${eventId}/queue`, { method: 'DELETE' })
}

export async function getQueueState(eventId: string): Promise<QueueState> {
  if (USE_MOCK) {
    return mockDelay<QueueState>({
      eventId,
      position: 240,
      totalWaiting: 720,
      estimatedSeconds: 720,
      canEnter: false,
      status: 'WAITING',
    })
  }
  return apiFetch<QueueState>(`/api/events/${eventId}/queue`)
}
