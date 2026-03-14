'use client'

import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn } from '@/lib/motion'

// ─── Base Skeleton ────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
  variant?: 'text' | 'rect' | 'circle'
}

/**
 * Base skeleton element with shimmer animation.
 * Uses the `.shimmer` utility defined in globals.css.
 */
export function Skeleton({ className, style, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={clsx(
        'shimmer',
        variant === 'circle' && 'rounded-full',
        variant === 'text'   && 'rounded h-4',
        variant === 'rect'   && 'rounded-xl',
        className
      )}
    />
  )
}

// ─── Shimmer → Reveal Wrapper ─────────────────────────────────────────────────

interface ShimmerProps {
  children: React.ReactNode
  isLoading: boolean
  skeleton: React.ReactNode
  className?: string
}

/**
 * Cross-fades from skeleton to content once `isLoading` becomes false.
 *
 * @example
 * <Shimmer isLoading={!data} skeleton={<Skeleton className="h-32" />}>
 *   <DataComponent data={data} />
 * </Shimmer>
 */
export function Shimmer({ children, isLoading, skeleton, className }: ShimmerProps) {
  return (
    <div className={clsx('relative', className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Genome Profile Skeleton ──────────────────────────────────────────────────

export function GenomeProfileSkeleton() {
  return (
    <div className="space-y-6" aria-label="プロフィールを読み込み中">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Skeleton variant="circle" className="w-16 h-16 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton variant="text" className="w-48 h-6" />
            <Skeleton variant="text" className="w-64 h-4" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="w-32 h-6 rounded-full" />
              <Skeleton className="w-40 h-6 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-3">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
        <div className="glass rounded-2xl p-6 space-y-3">
          <Skeleton variant="text" className="w-28 h-5" />
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="text" className="w-16 h-3" />
                <Skeleton className="flex-1 h-2 rounded-full" />
                <Skeleton variant="text" className="w-8 h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Philosophy */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <Skeleton variant="text" className="w-36 h-5" />
        <div className="grid md:grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="bg-genome-dark rounded-xl p-4 space-y-2">
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton variant="text" className="w-full h-4" />
              <Skeleton variant="text" className="w-3/4 h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <Skeleton variant="text" className="w-28 h-5" />
        <div className="flex flex-wrap gap-2">
          {[120, 100, 140, 90, 110].map((w, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── VC Card Skeleton ─────────────────────────────────────────────────────────

export function VCCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-11 h-11 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton variant="text" className="w-36 h-4" />
          <Skeleton variant="text" className="w-52 h-3" />
        </div>
        <Skeleton className="w-12 h-6 rounded-full shrink-0" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full h-3" />
        <Skeleton variant="text" className="w-5/6 h-3" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
        <Skeleton className="w-14 h-6 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export function VCListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VCCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Timeline Skeleton ────────────────────────────────────────────────────────

export function TimelineSkeleton() {
  return (
    <div className="relative space-y-6" aria-hidden="true">
      <div className="absolute left-8 top-0 bottom-0 w-px bg-genome-border" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex gap-6 pl-4">
          <Skeleton variant="circle" className="w-9 h-9 shrink-0 relative z-10" />
          <div className="flex-1 glass rounded-xl p-4 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="w-16 h-5 rounded-full" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <Skeleton variant="text" className="w-48 h-4" />
            <Skeleton variant="text" className="w-full h-3" />
            <Skeleton variant="text" className="w-3/4 h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass rounded-2xl overflow-hidden" aria-hidden="true">
      <div className="flex gap-4 p-4 border-b border-genome-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-genome-border/50 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              variant="text"
              className="h-4 flex-1"
              style={{ opacity: 1 - r * 0.06 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
