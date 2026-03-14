import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rect' | 'circle'
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-genome-border/60',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rect' && 'rounded-xl',
        className
      )}
    />
  )
}

export function GenomeProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Skeleton variant="circle" className="w-16 h-16 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-48 h-6" />
            <Skeleton variant="text" className="w-64 h-4" />
            <Skeleton variant="text" className="w-40 h-4" />
          </div>
        </div>
      </div>
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-48" />
    </div>
  )
}

export function VCCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex-1 space-y-1">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="text" className="w-48 h-3" />
        </div>
      </div>
      <Skeleton className="h-20" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  )
}
