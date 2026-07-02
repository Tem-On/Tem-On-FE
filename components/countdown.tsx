'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CountdownProps {
  /** 목표 시각 (ISO) */
  target: string
  prefix?: string
  className?: string
  onComplete?: () => void
}

function diff(target: string) {
  return Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000))
}

/** 남은 시간을 초 단위로 실시간 카운트다운 */
export function Countdown({ target, prefix, className, onComplete }: CountdownProps) {
  // 서버/클라이언트 시간 차이로 인한 hydration mismatch 방지를 위해
  // 마운트 이후에만 실제 카운트다운 값을 렌더링한다.
  const [seconds, setSeconds] = useState<number | null>(null)

  useEffect(() => {
    setSeconds(diff(target))
    const timer = setInterval(() => {
      const next = diff(target)
      setSeconds(next)
      if (next <= 0) {
        clearInterval(timer)
        onComplete?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [target, onComplete])

  const pad = (n: number) => String(n).padStart(2, '0')
  const label =
    seconds === null
      ? '--:--:--'
      : `${pad(Math.floor(seconds / 3600))}:${pad(
          Math.floor((seconds % 3600) / 60),
        )}:${pad(seconds % 60)}`

  return (
    <span className={cn('font-mono tabular-nums', className)} suppressHydrationWarning>
      {prefix && <span className="mr-1 font-sans">{prefix}</span>}
      {label}
    </span>
  )
}
