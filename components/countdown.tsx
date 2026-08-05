'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CountdownProps {
  /** 목표 시각 (ISO) */
  target: string
  prefix?: string
  className?: string
  onComplete?: () => void
}

function diff(target: string) {
  if (!target) return 0
  
  // Safari 등에서 YYYY-MM-DD HH:mm:ss 형태를 못 읽는 문제 방지 (공백을 T로 교체)
  const formattedTarget = target.includes(' ') ? target.replace(' ', 'T') : target
  const targetTime = new Date(formattedTarget).getTime()
  
  if (isNaN(targetTime)) return 0
  
  return Math.max(0, Math.floor((targetTime - Date.now()) / 1000))
}

/** 남은 시간을 초 단위로 실시간 카운트다운 */
export function Countdown({ target, prefix, className, onComplete }: CountdownProps) {
  const [seconds, setSeconds] = useState<number | null>(null)
  
  // onComplete 함수 참조값 변화로 인한 useEffect 무한 재실행 방지
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const initialDiff = diff(target)
    setSeconds(initialDiff)

    if (initialDiff <= 0) {
      onCompleteRef.current?.()
      return
    }

    const timer = setInterval(() => {
      const next = diff(target)
      setSeconds(next)
      if (next <= 0) {
        clearInterval(timer)
        onCompleteRef.current?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [target]) // 👈 target만 의존성에 포함

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