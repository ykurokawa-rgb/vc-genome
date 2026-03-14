'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motion'

// ─── Geometric Avatar ─────────────────────────────────────────────────────────

/**
 * Generates a unique, deterministic geometric avatar SVG for a VC.
 * The pattern is derived from a simple hash of the vcId.
 */
function hashVcId(vcId: string): number {
  let h = 0
  for (let i = 0; i < vcId.length; i++) {
    h = (Math.imul(31, h) + vcId.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function GeometricAvatar({ vcId, name }: { vcId: string; name: string }) {
  const seed   = hashVcId(vcId)
  const hue    = seed % 360
  const hue2   = (hue + 137) % 360
  const hue3   = (hue + 251) % 360

  // 3 shapes derived from seed
  const shapes = [
    { type: 'circle',  cx: 20 + (seed % 24),  cy: 20 + ((seed >> 4) % 24), r: 10 + (seed % 8)  },
    { type: 'rect',    x: 30 + (seed % 16),   y: 30 + ((seed >> 8) % 16), w: 14 + (seed % 10), h: 14 + ((seed >> 2) % 10) },
    { type: 'polygon', points: `${50 + (seed % 16)},${10 + (seed % 12)} ${70 + (seed % 10)},${40 + (seed % 16)} ${30 + (seed % 12)},${45 + (seed % 10)}` },
  ]

  const color1 = `hsl(${hue},  70%, 60%)`
  const color2 = `hsl(${hue2}, 65%, 58%)`
  const color3 = `hsl(${hue3}, 60%, 55%)`

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      className="relative w-16 h-16 shrink-0"
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-2xl blur-md opacity-40"
        style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
      />

      {/* Card */}
      <div
        className="relative w-16 h-16 rounded-2xl border overflow-hidden flex items-center justify-center"
        style={{ borderColor: `hsla(${hue}, 60%, 50%, 0.4)`, background: `hsla(${hue}, 25%, 8%, 0.9)` }}
      >
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background gradient */}
          <defs>
            <radialGradient id={`bg-${vcId}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={color1} stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="80" height="80" fill={`url(#bg-${vcId})`} />

          {/* Shape 1: circle */}
          <circle cx={shapes[0].cx} cy={shapes[0].cy} r={shapes[0].r} fill={color1} opacity="0.6" />

          {/* Shape 2: rect */}
          <rect
            x={shapes[1].x} y={shapes[1].y}
            width={shapes[1].w} height={shapes[1].h}
            rx="3"
            fill={color2}
            opacity="0.5"
            transform={`rotate(${(seed % 45) - 22}, ${shapes[1].x + shapes[1].w / 2}, ${shapes[1].y + shapes[1].h / 2})`}
          />

          {/* Shape 3: triangle */}
          <polygon points={shapes[2].points} fill={color3} opacity="0.55" />

          {/* Initials overlay */}
          <text
            x="40" y="52"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
            fill="rgba(255,255,255,0.9)"
          >
            {name.charAt(0)}
          </text>
        </svg>
      </div>
    </motion.div>
  )
}

// ─── Typewriter Alias ─────────────────────────────────────────────────────────

function TypewriterAlias({ alias }: { alias: string }) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!alias) return
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayed(alias.slice(0, i))
      if (i >= alias.length) {
        clearInterval(t)
        // Blink cursor then hide
        setTimeout(() => setShowCursor(false), 1400)
      }
    }, 45)
    return () => clearInterval(t)
  }, [alias])

  if (!alias) return null

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-genome-gold text-sm font-mono flex items-center gap-1"
    >
      ✦ {displayed}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-4 bg-genome-gold"
        />
      )}
    </motion.span>
  )
}

// ─── Animated Trust Badge ─────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  A:  { color: '#00D48A', bg: 'rgba(0,212,138,0.12)',  border: 'rgba(0,212,138,0.4)',  label: '高信頼' },
  'A-':{ color: '#00D48A', bg: 'rgba(0,212,138,0.10)', border: 'rgba(0,212,138,0.35)', label: '高信頼' },
  'B+':{ color: '#F0C040', bg: 'rgba(240,192,64,0.12)', border: 'rgba(240,192,64,0.4)', label: '良好' },
  B:  { color: '#F0C040', bg: 'rgba(240,192,64,0.10)', border: 'rgba(240,192,64,0.35)', label: '良好' },
  C:  { color: '#6B6B80', bg: 'rgba(107,107,128,0.10)', border: 'rgba(107,107,128,0.3)', label: '中程度' },
  D:  { color: '#FF4D6A', bg: 'rgba(255,77,106,0.10)',  border: 'rgba(255,77,106,0.4)',  label: '要確認' },
}

function AnimatedTrustBadge({ level, sources }: { level: string; sources: number }) {
  const [filled, setFilled] = useState(0)
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG['C']

  useEffect(() => {
    const target = level === 'A' ? 100 : level === 'A-' ? 90 : level === 'B+' ? 80 : level === 'B' ? 70 : level === 'C' ? 50 : 30
    const t = setTimeout(() => {
      let v = 0
      const step = setInterval(() => {
        v = Math.min(v + 2, target)
        setFilled(v)
        if (v >= target) clearInterval(step)
      }, 16)
    }, 600)
    return () => clearTimeout(t)
  }, [level])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center gap-2 rounded-full px-3 py-1 border text-xs font-mono"
      style={{ backgroundColor: config.bg, borderColor: config.border }}
    >
      {/* Gauge arc */}
      <div className="relative w-5 h-5">
        <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
          <circle cx="10" cy="10" r="7" fill="none" stroke={config.border} strokeWidth="2.5" />
          <motion.circle
            cx="10" cy="10" r="7"
            fill="none"
            stroke={config.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 7}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 7 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 7 * (1 - filled / 100) }}
            transition={{ duration: 1.2, ease: [0, 0, 0.2, 1], delay: 0.6 }}
          />
        </svg>
      </div>
      <span style={{ color: config.color }}>
        信頼スコア: <strong>{level}</strong>
      </span>
      <span className="text-genome-muted">（{sources}ソース）</span>
    </motion.div>
  )
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback: do nothing */
    }
  }

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors relative overflow-hidden"
    >
      <motion.span
        key={copied ? 'copied' : 'share'}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-1.5"
      >
        {copied ? <>✓ コピー済み</> : <>シェア</>}
      </motion.span>
    </motion.button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface GenomeHeaderProps {
  vcId:    string
  name:    string
  affil:   string
  alias:   string
  level:   string
  sources: number
}

export function GenomeHeader({ vcId, name, affil, alias, level, sources }: GenomeHeaderProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-6 py-6"
    >
      <div className="flex items-start gap-4">
        {/* Geometric avatar */}
        <GeometricAvatar vcId={vcId} name={name} />

        <div className="flex-1 min-w-0">
          <motion.h1 variants={fadeInUp} className="text-2xl font-bold mb-0.5">{name}</motion.h1>
          <motion.p variants={fadeInUp} className="text-genome-muted text-sm mb-2">{affil}</motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
            {alias && <TypewriterAlias alias={alias} />}
            <AnimatedTrustBadge level={level} sources={sources} />
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3 shrink-0">
          <ShareButton />
        </motion.div>
      </div>
    </motion.div>
  )
}
