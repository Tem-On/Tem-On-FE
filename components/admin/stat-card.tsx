import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'default',
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: 'default' | 'success' | 'danger' | 'primary'
}) {
  const toneClass = {
    default: 'bg-muted text-foreground',
    success: 'bg-success/15 text-success',
    danger: 'bg-danger/15 text-danger',
    primary: 'bg-primary/15 text-primary',
  }[tone]

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            toneClass,
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
