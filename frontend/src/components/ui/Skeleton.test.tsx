import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton, VCCardSkeleton, TimelineSkeleton } from './Skeleton'

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion:           { div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div> },
  AnimatePresence:  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView:        () => true,
  useReducedMotion: () => false,
}))

describe('Skeleton', () => {
  it('renders with shimmer class', () => {
    const { container } = render(<Skeleton className="h-16" />)
    expect(container.firstChild).toHaveClass('shimmer')
  })

  it('applies circle variant', () => {
    const { container } = render(<Skeleton variant="circle" className="w-10 h-10" />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('applies text variant', () => {
    const { container } = render(<Skeleton variant="text" />)
    expect(container.firstChild).toHaveClass('h-4')
  })

  it('is hidden from accessibility tree', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-32 w-full" />)
    expect(container.firstChild).toHaveClass('h-32', 'w-full')
  })
})

describe('VCCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<VCCardSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  it('is hidden from accessibility tree', () => {
    const { container } = render(<VCCardSkeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('TimelineSkeleton', () => {
  it('renders 4 timeline items', () => {
    const { container } = render(<TimelineSkeleton />)
    // 4 circle skeletons + their card siblings
    const circles = container.querySelectorAll('.rounded-full.shimmer')
    expect(circles.length).toBe(4)
  })
})
