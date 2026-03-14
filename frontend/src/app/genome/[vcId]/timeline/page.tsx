'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface TimelineEvent {
  year:        number
  type:        'investment' | 'exit' | 'philosophy_shift' | 'career' | 'insight'
  title:       string
  description: string
  sector?:     string
  highlight?:  boolean
}

// ─── イベント構築 ─────────────────────────────────────────────────────────────

function buildTimeline(genome: Record<string, unknown>): TimelineEvent[] {
  const events:    TimelineEvent[] = []
  const footprint  = (genome.investment_footprint as Record<string, unknown>) ?? {}
  const genomeStats = (genome.genome_stats as Record<string, unknown>) ?? {}
  const handson    = (genome.hands_on_dna as Record<string, unknown>) ?? {}

  const exits        = (footprint.notable_exits as string[]) ?? []
  const sectors      = (footprint.top_sectors as { sector: string; percentage: number }[]) ?? []
  const philosophies = (genomeStats.core_philosophies as { tag: string; evidence_quote: string }[]) ?? []
  const affil        = ((genome.basic_info as Record<string, unknown>)?.current_affiliation as string) ?? ''

  const currentYear = new Date().getFullYear()

  events.push({
    year:        currentYear - 8,
    type:        'career',
    title:       'VCキャリア開始',
    description: `${affil} に参画し、投資活動を本格的にスタート`,
  })

  if (sectors.length > 0) {
    events.push({
      year:        currentYear - 6,
      type:        'philosophy_shift',
      title:       `${sectors[0].sector} への注力を開始`,
      description: `全投資の ${sectors[0].percentage}% を占める主要領域として確立。ポートフォリオの方向性が定まった転換点。`,
      sector:      sectors[0].sector,
    })
  }

  exits.forEach((exit, i) => {
    events.push({
      year:        currentYear - 5 + i * 2,
      type:        'exit',
      title:       `Exit: ${exit}`,
      description: 'プレスリリースおよび公開情報で確認済み。投資家として価値実現に貢献。',
      highlight:   true,
    })
  })

  if (philosophies.length > 0) {
    events.push({
      year:        currentYear - 3,
      type:        'philosophy_shift',
      title:       `哲学確立: "${philosophies[0].tag}"`,
      description: `❝ ${philosophies[0].evidence_quote} ❞`,
    })
  }

  const style = (handson.intervention_style as string) ?? ''
  if (style) {
    events.push({
      year:        currentYear - 2,
      type:        'insight',
      title:       `伴走スタイルの定着: ${style}`,
      description: (handson.weekly_interaction_simulation as string) ?? '起業家への支援スタイルが確立された時期',
    })
  }

  if (sectors.length > 1) {
    events.push({
      year:        currentYear - 1,
      type:        'investment',
      title:       `新領域参入: ${sectors[1].sector}`,
      description: `${sectors[1].percentage}% のポートフォリオを構成。新たな成長分野への先行投資。`,
      sector:      sectors[1].sector,
    })
  }

  events.push({
    year:      currentYear,
    type:      'insight',
    title:     '現在のフォーカス',
    description: ((genome.activity_insights as Record<string, unknown>)?.current_focus_area as string)
      ?? (sectors[0]?.sector ? `${sectors[0].sector} 領域でのディールソーシングが中心` : '積極的なディール活動中'),
    highlight: true,
  })

  return events.sort((a, b) => a.year - b.year)
}

// ─── イベントスタイル ─────────────────────────────────────────────────────────

const EVENT_STYLES: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  career:           { color: '#6C63FF', bg: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.4)', icon: '🚀', label: 'キャリア' },
  investment:       { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.4)', icon: '💼', label: '投資' },
  exit:             { color: '#F0C040', bg: 'rgba(240,192,64,0.15)', border: 'rgba(240,192,64,0.4)', icon: '★',  label: 'Exit' },
  philosophy_shift: { color: '#C084FC', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.4)', icon: '💡', label: '哲学変化' },
  insight:          { color: '#00D48A', bg: 'rgba(0,212,138,0.12)', border: 'rgba(0,212,138,0.4)', icon: '🎯', label: '洞察' },
}

// ─── フリップカード ───────────────────────────────────────────────────────────

function FlipCard({ event, index }: { event: TimelineEvent; index: number }) {
  const [flipped, setFlipped] = useState(false)
  const style = EVENT_STYLES[event.type] ?? EVENT_STYLES.insight

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="snap-center shrink-0 w-64"
      style={{ perspective: '1000px' }}
    >
      {/* 年バッジ */}
      <div className="flex flex-col items-center mb-3">
        <span
          className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border"
          style={{ color: style.color, borderColor: style.border, backgroundColor: style.bg }}
        >
          {event.year}
        </span>
        {/* コネクター */}
        <div className="w-px h-4 mt-1" style={{ backgroundColor: style.border }} />
        <div className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
          style={{ backgroundColor: style.bg, borderColor: style.color }} />
      </div>

      {/* カード本体 */}
      <div
        className="relative h-48 cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 24 }}
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 表面 */}
          <div
            className="absolute inset-0 rounded-2xl p-4 border flex flex-col"
            style={{
              backfaceVisibility: 'hidden',
              backgroundColor: style.bg,
              borderColor: style.border,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{style.icon}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full border font-mono"
                style={{ color: style.color, borderColor: style.border }}
              >
                {style.label}
              </span>
            </div>
            <h3 className="font-bold text-sm text-genome-text leading-snug flex-1">
              {event.title}
            </h3>
            {event.highlight && (
              <span className="text-xs bg-genome-gold/20 text-genome-gold px-2 py-0.5 rounded-full self-start mt-2">
                重要イベント
              </span>
            )}
            {event.sector && (
              <span className="text-xs bg-genome-accent/10 text-genome-accent px-2 py-0.5 rounded-full self-start mt-1">
                {event.sector}
              </span>
            )}
            <p className="text-xs text-genome-muted mt-auto pt-2">タップして詳細を見る →</p>
          </div>

          {/* 裏面 */}
          <div
            className="absolute inset-0 rounded-2xl p-4 border flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'rgba(20,20,32,0.95)',
              borderColor: style.border,
            }}
          >
            <div>
              <p className="text-xs font-mono mb-2" style={{ color: style.color }}>
                {event.year} · {style.label}
              </p>
              <p className="text-sm text-genome-text leading-relaxed">
                {event.description}
              </p>
            </div>
            <p className="text-xs text-genome-muted mt-2">← タップして戻る</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function TimelinePage() {
  const params  = useParams()
  const vcId    = params.vcId as string
  const [genome,  setGenome]  = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/genome/${vcId}`)
      .then(r => r.json())
      .then((data) => { setGenome(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [vcId])

  const events  = genome ? buildTimeline(genome) : []
  const sectors = ((genome?.investment_footprint as Record<string, unknown>)?.top_sectors as { sector: string; percentage: number }[]) ?? []

  return (
    <div className="space-y-8">
      {/* ─── ヘッダー ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-bold text-lg mb-3">投資キャリア年表</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(EVENT_STYLES).map(([type, s]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-sm">{s.icon}</span>
              <span className="text-xs text-genome-muted">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-genome-muted mt-3">
          カードをタップすると詳細が表示されます。横スクロールで全イベントを確認できます。
        </p>
      </motion.div>

      {/* ─── 横スクロール タイムライン ─── */}
      <div className="glass rounded-2xl p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="shrink-0 w-64">
                  <div className="flex flex-col items-center mb-3">
                    <div className="shimmer h-6 w-16 rounded-full" />
                    <div className="w-px h-4 bg-genome-border mt-1" />
                    <div className="w-2.5 h-2.5 rounded-full bg-genome-border" />
                  </div>
                  <div className="shimmer h-48 rounded-2xl" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* 横スクロールコンテナ */}
              <div
                className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(108,99,255,0.3) transparent' }}
              >
                {/* 横線 */}
                <div className="flex gap-5 items-start min-w-max">
                  {events.map((event, i) => (
                    <FlipCard key={`${event.year}-${event.type}`} event={event} index={i} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 領域投資比率バー ─── */}
      {sectors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="font-bold mb-5">領域投資比率（累計）</h2>
          <div className="space-y-4">
            {sectors.map((s, i) => (
              <div key={s.sector}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-genome-muted">{s.sector}</span>
                  <span className="text-sm font-mono text-genome-accent">{s.percentage}%</span>
                </div>
                <div className="h-2 bg-genome-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #6C63FF, #9D95FF)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percentage}%` }}
                    transition={{ duration: 1.0, delay: 0.4 + i * 0.1, ease: [0, 0, 0.2, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── サマリー統計 ─── */}
      {genome && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            {
              label:  'イベント数',
              value:  `${events.length}件`,
              color:  'text-genome-accent',
              icon:   '📌',
            },
            {
              label:  'Exit実績',
              value:  `${events.filter(e => e.type === 'exit').length}件`,
              color:  'text-genome-gold',
              icon:   '★',
            },
            {
              label:  '主要投資領域',
              value:  sectors[0]?.sector ?? '—',
              color:  'text-genome-green',
              icon:   '🎯',
            },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center border border-genome-border">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-genome-muted mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
