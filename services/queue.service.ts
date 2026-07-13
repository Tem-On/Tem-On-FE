import { apiFetch } from './api-client'
import type { QueueState, QueueStatus } from '@/types'

type QueueEnterResponse = {
  eventProductId: number
  userId: number
  rank: number
  status: QueueStatus
}

type QueueRankResponse = {
  rank: number
}

type QueueStatusResponse = {
  status: string
}

type QueueAvailableResponse = {
  available: boolean
}

type QueueEstimatedTimeResponse = {
  estimatedSeconds: number
}

type QueueCurrentUsersResponse = {
  currentUsers: number
}

export async function enterQueue(
  eventProductId: string,
): Promise<QueueState> {
  const params = new URLSearchParams({
    eventProductId,
  })

  const enter = await apiFetch<QueueEnterResponse>(
    `/api/queue/enter?${params.toString()}`,
    {
      method: 'POST',
    },
  )

  const [currentUsers, estimatedTime, available] = await Promise.all([
    getCurrentUsers(eventProductId),
    getEstimatedTime(eventProductId),
    getAvailable(eventProductId),
  ])

  return {
    eventId: String(enter.eventProductId),
    position: Number(enter.rank),
    totalWaiting: Number(currentUsers.currentUsers),
    estimatedSeconds: Number(estimatedTime.estimatedSeconds),
    canEnter: Boolean(available.available),
    status: available.available ? 'READY' : enter.status,
  }
}

export async function getQueueRank(
  eventProductId: string,
): Promise<QueueRankResponse> {
  const params = new URLSearchParams({
    eventProductId,
  })

  return apiFetch<QueueRankResponse>(
    `/api/queue/rank?${params.toString()}`,
  )
}

export async function getQueueStatus(
  eventProductId: string,
): Promise<QueueStatusResponse> {
  const params = new URLSearchParams({
    eventProductId,
  })

  return apiFetch<QueueStatusResponse>(
    `/api/queue/status?${params.toString()}`,
  )
}

export async function getAvailable(
  eventProductId: string,
): Promise<QueueAvailableResponse> {
  const params = new URLSearchParams({
    eventProductId,
  })

  return apiFetch<QueueAvailableResponse>(
    `/api/queue/available?${params.toString()}`,
  )
}

export async function getEstimatedTime(
  eventProductId: string,
): Promise<QueueEstimatedTimeResponse> {
  const params = new URLSearchParams({
    eventProductId,
  })

  return apiFetch<QueueEstimatedTimeResponse>(
    `/api/queue/estimated-time?${params.toString()}`,
  )
}

export async function getCurrentUsers(
  eventProductId: string,
): Promise<QueueCurrentUsersResponse> {
  const params = new URLSearchParams({
    eventProductId,
  })

  return apiFetch<QueueCurrentUsersResponse>(
    `/api/queue/current-users?${params.toString()}`,
  )
}

export async function expireQueue(eventProductId: string): Promise<void> {
  const params = new URLSearchParams({
    eventProductId,
  })

  await apiFetch<void>(`/api/queue/expire?${params.toString()}`, {
    method: 'POST',
  })
}

export async function leaveQueue(
  _eventProductId: string,
): Promise<void> {
  // 백엔드에 대기열 이탈 API가 아직 없음.
  // 그래서 프론트에서는 일단 no-op 처리.
  return Promise.resolve()
}