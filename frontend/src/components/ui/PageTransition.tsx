'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageTransition } from '@/lib/motion'
import { clsx } from 'clsx'

// ─── Page Transition ──────────────────────────────────────────────────────────

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps page content with a smooth fade-up entrance animation.
 * Place this inside each page component (not in layout).
 *
 * @example
 * export default function MyPage() {
 *   return (
 *     <PageTransition>
 *       <div>Content here</div>
 *     </PageTransition>
 *   )
 * }
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={clsx('w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Section Reveal ───────────────────────────────────────────────────────────

/**
 * Reveals a section with a fade-up when it enters the viewport.
 *
 * @example
 * <SectionReveal delay={0.1}>
 *   <MySection />
 * </SectionReveal>
 */
interface SectionRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.45,
        ease: [0, 0, 0.2, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger Children Wrapper ─────────────────────────────────────────────────

/**
 * Wraps a list and staggers the entrance of each child.
 * Children must have `variants` set to a fade/slide variant.
 *
 * @example
 * <StaggerList>
 *   {items.map(item => (
 *     <motion.div key={item.id} variants={listItem}>...</motion.div>
 *   ))}
 * </StaggerList>
 */
interface StaggerListProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
}

export function StaggerList({
  children,
  className,
  staggerDelay = 0.07,
  initialDelay = 0,
}: StaggerListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden:  { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren:   initialDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Presence Wrapper ─────────────────────────────────────────────────────────

/**
 * AnimatePresence wrapper for conditional rendering with exit animation.
 *
 * @example
 * <Presence show={isOpen}>
 *   <Modal />
 * </Presence>
 */
interface PresenceProps {
  show: boolean
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
}

export function Presence({ show, children, mode = 'wait' }: PresenceProps) {
  return (
    <AnimatePresence mode={mode}>
      {show && children}
    </AnimatePresence>
  )
}

// ─── Overlay / Modal Backdrop ──────────────────────────────────────────────────

interface OverlayProps {
  show: boolean
  onClick?: () => void
  children: React.ReactNode
}

export function ModalOverlay({ show, onClick, children }: OverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-overlay"
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed inset-0 flex items-center justify-center z-modal pointer-events-none p-4"
          >
            <div className="pointer-events-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
