'use client'

/**
 * Animation hooks
 * Reusable hooks for page transitions, scroll-triggered animations,
 * and micro-interactions throughout the VC Genome UI.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

// ─── Reduced Motion ───────────────────────────────────────────────────────────

/**
 * Returns safe animation props that respect prefers-reduced-motion.
 * When motion is reduced, transitions are instant (duration: 0).
 */
export function useSafeMotion() {
  const shouldReduce = useReducedMotion()
  return {
    shouldReduce: !!shouldReduce,
    duration: shouldReduce ? 0 : undefined,
    transition: shouldReduce ? { duration: 0 } : undefined,
  }
}

// ─── Scroll-triggered Reveal ──────────────────────────────────────────────────

interface UseScrollRevealOptions {
  /** Fraction of element that must be visible before triggering */
  threshold?: number
  /** Trigger once and stay visible */
  once?: boolean
  /** Delay before animation starts (ms) */
  delay?: number
}

/**
 * Returns a ref and visibility state for scroll-triggered animations.
 *
 * @example
 * const { ref, isVisible } = useScrollReveal()
 * <motion.div ref={ref} animate={isVisible ? 'visible' : 'hidden'} variants={fadeInUp} />
 */
export function useScrollReveal({
  threshold = 0.15,
  once = true,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: threshold })

  return { ref, isVisible: isInView }
}

/**
 * Staggered scroll reveal for a list of items.
 * Returns a ref for the container; individual item delays are computed
 * from the index using the provided baseDelay.
 */
export function useStaggerReveal(itemCount: number, baseDelay = 0.06) {
  const { ref, isVisible } = useScrollReveal()
  const delays = Array.from({ length: itemCount }, (_, i) => i * baseDelay)
  return { ref, isVisible, delays }
}

// ─── Hover State ──────────────────────────────────────────────────────────────

/**
 * Simple hover state hook for imperative hover tracking.
 * Useful when you need hover state outside of CSS :hover.
 */
export function useHover() {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const enter = () => setIsHovered(true)
    const leave = () => setIsHovered(false)

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  return { ref, isHovered }
}

// ─── Focus State ──────────────────────────────────────────────────────────────

export function useFocus() {
  const [isFocused, setIsFocused] = useState(false)
  const onFocus  = useCallback(() => setIsFocused(true), [])
  const onBlur   = useCallback(() => setIsFocused(false), [])
  return { isFocused, onFocus, onBlur }
}

// ─── Press / Tap ──────────────────────────────────────────────────────────────

export function usePress() {
  const [isPressed, setIsPressed] = useState(false)
  const onMouseDown = useCallback(() => setIsPressed(true), [])
  const onMouseUp   = useCallback(() => setIsPressed(false), [])
  const onMouseLeave = useCallback(() => setIsPressed(false), [])
  return { isPressed, onMouseDown, onMouseUp, onMouseLeave }
}

// ─── Typewriter Effect ────────────────────────────────────────────────────────

interface UseTypewriterOptions {
  text: string
  speed?: number   // ms per character
  delay?: number   // initial delay in ms
  loop?: boolean
}

/**
 * Returns the progressively-revealed text string and a reset function.
 *
 * @example
 * const { displayed } = useTypewriter({ text: '二つ名: ディープテック番人' })
 */
export function useTypewriter({
  text,
  speed = 40,
  delay = 0,
  loop = false,
}: UseTypewriterOptions) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const idxRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    idxRef.current = 0
    setDisplayed('')
    setDone(false)

    const tick = () => {
      if (idxRef.current < text.length) {
        idxRef.current++
        setDisplayed(text.slice(0, idxRef.current))
        timerRef.current = setTimeout(tick, speed)
      } else {
        setDone(true)
        if (loop) {
          timerRef.current = setTimeout(start, 1500)
        }
      }
    }

    timerRef.current = setTimeout(tick, delay)
  }, [text, speed, delay, loop])

  useEffect(() => {
    start()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [start])

  return { displayed, done, reset: start }
}

// ─── Count Up Animation ───────────────────────────────────────────────────────

interface UseCountUpOptions {
  to: number
  duration?: number  // seconds
  delay?: number     // seconds
  decimals?: number
}

/**
 * Animates a number from 0 to `to` over `duration` seconds.
 *
 * @example
 * const count = useCountUp({ to: 247, duration: 1.5 })
 * <span>{count}</span>
 */
export function useCountUp({
  to,
  duration = 1.2,
  delay = 0,
  decimals = 0,
}: UseCountUpOptions) {
  const [value, setValue] = useState(0)
  const { ref, isVisible } = useScrollReveal({ threshold: 0.5 })
  const started = useRef(false)

  useEffect(() => {
    if (!isVisible || started.current) return
    started.current = true

    let start: number | null = null
    const delayMs = delay * 1000
    const durationMs = duration * 1000

    const step = (timestamp: number) => {
      if (!start) start = timestamp + delayMs
      const elapsed = timestamp - start
      if (elapsed < 0) {
        requestAnimationFrame(step)
        return
      }
      const progress = Math.min(elapsed / durationMs, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * to).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(step)
      else setValue(to)
    }

    requestAnimationFrame(step)
  }, [isVisible, to, duration, delay, decimals])

  return { value, ref }
}

// ─── Parallax ─────────────────────────────────────────────────────────────────

/**
 * Simple scroll-based parallax offset.
 * Returns a y offset value in px that changes as the user scrolls.
 *
 * @example
 * const { ref, offsetY } = useParallax(0.3)
 * <motion.div ref={ref} style={{ y: offsetY }} />
 */
export function useParallax(factor = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - window.innerHeight / 2
      setOffsetY(center * factor)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [factor])

  return { ref, offsetY }
}

// ─── Mount / Unmount Animation ────────────────────────────────────────────────

/**
 * Controls mount/unmount with a delayed unmount for exit animations.
 *
 * @example
 * const { mounted, visible, show, hide } = useMountAnimation(300)
 * {mounted && <motion.div animate={visible ? 'in' : 'out'} onAnimationComplete={!visible ? hide : undefined} />}
 */
export function useMountAnimation(exitDuration = 300) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => {
    setMounted(true)
    // Small tick to allow CSS transition to start
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
  }, [])

  const hide = useCallback(() => {
    setVisible(false)
    setTimeout(() => setMounted(false), exitDuration)
  }, [exitDuration])

  return { mounted, visible, show, hide }
}

// ─── Clipboard Copy ───────────────────────────────────────────────────────────

/**
 * Returns a copy function and "copied" state with auto-reset.
 */
export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), resetAfter)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), resetAfter)
    }
  }, [resetAfter])

  return { copy, copied }
}
