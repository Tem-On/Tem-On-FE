export function formatKRW(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

// export function formatNumber(value: number): string {
//   return value.toLocaleString('ko-KR')
// }
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0'
  return value.toLocaleString('ko-KR')
}

// 서버(UTC/ICU 축약)와 클라이언트(로컬) 간 hydration mismatch를 방지하기 위해
// 시간대를 Asia/Seoul로 고정하고 24시간제(오전/오후 미표기)로 결정적 출력을 만든다.
const TZ = 'Asia/Seoul'

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TZ,
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  })
}

/** 초 단위를 "3분 20초" 형태로 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '입장 가능'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}

export function discountRate(original: number, sale: number): number {
  if (original <= 0) return 0
  return Math.round(((original - sale) / original) * 100)
}
