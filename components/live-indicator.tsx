import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  label?: string
  className?: string
}

/** 실시간 데이터를 강조하는 펄스 인디케이터 */
export function LiveIndicator({ label = 'LIVE', className }: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger',
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-danger" />
      </span>
      {label}
    </span>
  )
}
