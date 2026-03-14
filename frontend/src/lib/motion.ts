/**
 * Motion variants library
 * Centralized Framer Motion animation definitions for consistent UI motion.
 *
 * Usage:
 *   import { fadeInUp, staggerContainer } from '@/lib/motion'
 *   <motion.div variants={fadeInUp} initial="hidden" animate="visible" />
 */

import type { Variants, Transition } from 'framer-motion'

// ─── Shared Transitions ───────────────────────────────────────────────────────

export const transitions = {
  /** Standard UI element entrance */
  default: {
    duration: 0.35,
    ease: [0, 0, 0.2, 1],
  } satisfies Transition,

  /** Fast micro-interactions */
  fast: {
    duration: 0.15,
    ease: [0, 0, 0.2, 1],
  } satisfies Transition,

  /** Slow, emphasis transitions */
  slow: {
    duration: 0.6,
    ease: [0, 0, 0.2, 1],
  } satisfies Transition,

  /** Spring-based interactive feel */
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 24,
  } satisfies Transition,

  /** Bouncy spring for playful elements */
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  } satisfies Transition,

  /** Smooth page-level transitions */
  page: {
    duration: 0.4,
    ease: [0, 0, 0.2, 1],
  } satisfies Transition,
} as const

// ─── Fade Variants ────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.default },
  exit:    { opacity: 0, transition: transitions.fast },
}

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
  exit:    { opacity: 0, y: 8, transition: transitions.fast },
}

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
  exit:    { opacity: 0, y: -8, transition: transitions.fast },
}

export const fadeInLeft: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: transitions.default },
  exit:    { opacity: 0, x: -8, transition: transitions.fast },
}

export const fadeInRight: Variants = {
  hidden:  { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: transitions.default },
  exit:    { opacity: 0, x: 8, transition: transitions.fast },
}

// ─── Scale Variants ───────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1,    transition: transitions.default },
  exit:    { opacity: 0, scale: 0.96, transition: transitions.fast },
}

export const scaleInBounce: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1,   transition: transitions.bounce },
  exit:    { opacity: 0, scale: 0.9, transition: transitions.fast },
}

// ─── Slide Variants ───────────────────────────────────────────────────────────

export const slideInBottom: Variants = {
  hidden:  { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0, transition: transitions.spring },
  exit:    { opacity: 0, y: '100%', transition: transitions.default },
}

export const slideInTop: Variants = {
  hidden:  { opacity: 0, y: '-100%' },
  visible: { opacity: 1, y: 0, transition: transitions.spring },
  exit:    { opacity: 0, y: '-100%', transition: transitions.default },
}

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: '-100%' },
  visible: { opacity: 1, x: 0, transition: transitions.spring },
  exit:    { opacity: 0, x: '-100%', transition: transitions.default },
}

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0, transition: transitions.spring },
  exit:    { opacity: 0, x: '100%', transition: transitions.default },
}

// ─── Page Transition Variants ─────────────────────────────────────────────────

export const pageTransition: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...transitions.page,
      staggerChildren: 0.06,
    },
  },
  exit: { opacity: 0, y: -8, transition: transitions.fast },
}

/** For modal/dialog overlays */
export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.default },
  exit:    { opacity: 0, transition: transitions.fast },
}

/** For modal/dialog panels */
export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: transitions.spring },
  exit:    { opacity: 0, scale: 0.96, y: 8,  transition: transitions.fast },
}

// ─── List / Stagger Variants ──────────────────────────────────────────────────

/**
 * Container that staggers children animations.
 * Apply to the parent, use fadeInUp (or any variant) on children.
 */
export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren:   0.05,
    },
  },
  exit: { opacity: 0 },
}

export const staggerContainerFast: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren:   0,
    },
  },
  exit: { opacity: 0 },
}

/** Individual list item */
export const listItem: Variants = {
  hidden:  { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: transitions.default },
  exit:    { opacity: 0, y: -4, scale: 0.98, transition: transitions.fast },
}

// ─── Card Hover Variants ──────────────────────────────────────────────────────

export const cardHover = {
  rest: {
    y: 0,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    transition: transitions.default,
  },
  hover: {
    y: -3,
    boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(108,99,255,0.12)',
    transition: transitions.default,
  },
  tap: {
    y: 0,
    scale: 0.99,
    transition: transitions.fast,
  },
}

// ─── Button Variants ──────────────────────────────────────────────────────────

export const buttonHover = {
  rest:  { scale: 1 },
  hover: { scale: 1.02, transition: transitions.fast },
  tap:   { scale: 0.97, transition: transitions.fast },
}

// ─── Tab Indicator ────────────────────────────────────────────────────────────

/** Shared layoutId key for tab active indicator */
export const TAB_INDICATOR_ID = 'genome-tab-indicator'

// ─── Number Counter ───────────────────────────────────────────────────────────

export const numberReveal: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...transitions.spring, delay: 0.1 },
  },
}

// ─── Typewriter (for alias text) ──────────────────────────────────────────────

/** Use with word-by-word splitting in the component */
export const typewriterContainer: Variants = {
  hidden:  { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
}

export const typewriterChar: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } },
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────

export const radarReveal: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...transitions.spring, delay: 0.2 },
  },
}

// ─── Notification / Toast ─────────────────────────────────────────────────────

export const toastVariants: Variants = {
  hidden:  { opacity: 0, x: 40,  scale: 0.9 },
  visible: { opacity: 1, x: 0,   scale: 1,   transition: transitions.spring },
  exit:    { opacity: 0, x: 40,  scale: 0.9, transition: transitions.fast },
}

// ─── Scanning / Progress ──────────────────────────────────────────────────────

export const scanPulse: Variants = {
  inactive: { opacity: 0.4, scale: 1 },
  active: {
    opacity: [0.4, 1, 0.4],
    scale:   [1, 1.04, 1],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const progressBar: Variants = {
  initial:  { scaleX: 0, originX: 0 },
  animate: (pct: number) => ({
    scaleX: pct / 100,
    originX: 0,
    transition: { ...transitions.default, duration: 0.6 },
  }),
}
