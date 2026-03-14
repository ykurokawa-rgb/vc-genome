import { cn } from '@/lib/utils'

interface ConfidenceBadgeProps {
  level: string
  showLabel?: boolean
  className?: string
}

const COLORS: Record<string, string> = {
  A: 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'A-': 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'B+': 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  B: 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  C: 'text-genome-muted border-genome-border bg-genome-card',
  D: 'text-genome-red border-genome-red/40 bg-genome-red/10',
}

const LABELS: Record<string, string> = {
  A: '高精度',
  'A-': '高精度',
  'B+': '中精度',
  B: '中精度',
  C: '低精度',
  D: '要確認',
}

export default function ConfidenceBadge({ level, showLabel = false, className }: ConfidenceBadgeProps) {
  const colorClass = COLORS[level] || 'text-genome-muted border-genome-border'
  const label = LABELS[level] || level

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs border px-2 py-0.5 rounded-full font-mono font-bold',
        colorClass,
        className
      )}
    >
      {level}
      {showLabel && <span className="font-normal opacity-75">{label}</span>}
    </span>
  )
}
