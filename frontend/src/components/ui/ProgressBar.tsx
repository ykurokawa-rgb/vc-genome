import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'accent' | 'green' | 'gold' | 'red'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const COLOR_MAP: Record<string, string> = {
  accent: 'bg-genome-accent',
  green: 'bg-genome-green',
  gold: 'bg-genome-gold',
  red: 'bg-genome-red',
}

const HEIGHT_MAP: Record<string, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'accent',
  height = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-genome-muted font-mono">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-genome-border rounded-full overflow-hidden', HEIGHT_MAP[height])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', COLOR_MAP[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
