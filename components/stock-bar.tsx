import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

interface StockBarProps {
  remaining: number
  total: number
  className?: string
  showLabel?: boolean
}

/** 남은 재고를 시각적으로 표시하는 프로그레스 바 */
export function StockBar({
  remaining,
  total,
  className,
  showLabel = true,
}: StockBarProps) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0
  const low = pct <= 20
  const soldOut = remaining <= 0

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">남은 수량</span>
          <span
            className={cn(
              'font-semibold tabular-nums',
              soldOut
                ? 'text-muted-foreground'
                : low
                  ? 'text-danger'
                  : 'text-foreground',
            )}
          >
            {soldOut ? '품절' : `${formatNumber(remaining)} / ${formatNumber(total)}`}
          </span>
        </div>
      )}
      <Progress
        value={pct}
        className={cn(
          low && !soldOut && '[&_[data-slot=progress-indicator]]:bg-danger',
          !low && '[&_[data-slot=progress-indicator]]:bg-success',
        )}
      />
    </div>
  )
}
