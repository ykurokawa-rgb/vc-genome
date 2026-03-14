'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface EvidenceCard {
  id:         string
  confidence: 'A' | 'B' | 'C' | 'D'
  category:   string
  title:      string
  excerpt:    string
  source:     string
  url:        null
}

// ─── 信頼度設定 ───────────────────────────────────────────────────────────────

const CONF_CFG: Record<string, { color: string; bg: string; border: string; stars: string; label: string; score: number }> = {
  A: { color: '#00D48A', bg: 'rgba(0,212,138,0.10)',  border: 'rgba(0,212,138,0.35)',  stars: '★★★★★', label: '公式情報確認済み', score: 100 },
  B: { color: '#6C63FF', bg: 'rgba(108,99,255,0.10)', border: 'rgba(108,99,255,0.35)', stars: '★★★★☆', label: '複数ソース確認',    score: 80  },
  C: { color: '#F0C040', bg: 'rgba(240,192,64,0.10)', border: 'rgba(240,192,64,0.35)', stars: '★★★☆☆', label: '単一ソース',      score: 55  },
  D: { color: '#6B6B80', bg: 'rgba(107,107,128,0.08)', border: 'rgba(107,107,128,0.3)', stars: '★★☆☆☆', label: '推測・限定情報',  score: 30  },
}

const CATEGORIES = ['すべて', '投資哲学', '伴走実績', '投資領域', 'Exit実績'] as const
type Category = typeof CATEGORIES[number]

// ─── データ構築 ───────────────────────────────────────────────────────────────

function buildCards(genome: Record<string, unknown>): EvidenceCard[] {
  const philosophies: { tag: string; evidence_quote: string; source_description?: string }[] =
    (genome.genome_stats as Record<string, unknown>)?.core_philosophies as [] ?? []
  const supports: { type: string; score: number; description: string; evidence_count?: number }[] =
    (genome.hands_on_dna as Record<string, unknown>)?.specific_supports as [] ?? []
  const sectors: { sector: string; percentage: number }[] =
    (genome.investment_footprint as Record<string, unknown>)?.top_sectors as [] ?? []
  const exits: string[] =
    (genome.investment_footprint as Record<string, unknown>)?.notable_exits as [] ?? []

  return [
    ...philosophies.map((p, i) => ({
      id:         `phil-${i}`,
      confidence: 'B' as const,
      category:   '投資哲学',
      title:      p.tag,
      excerpt:    p.evidence_quote,
      source:     p.source_description ?? 'インタビュー・記事',
      url:        null,
    })),
    ...supports.map((s, i) => ({
      id:         `sup-${i}`,
      confidence: (s.evidence_count && s.evidence_count > 3 ? 'A' : s.evidence_count && s.evidence_count > 0 ? 'B' : 'C') as 'A' | 'B' | 'C',
      category:   '伴走実績',
      title:      s.type,
      excerpt:    s.description,
      source:     `エビデンス ${s.evidence_count ?? 0}件`,
      url:        null,
    })),
    ...sectors.map((s, i) => ({
      id:         `sec-${i}`,
      confidence: 'B' as const,
      category:   '投資領域',
      title:      s.sector,
      excerpt:    `全投資の ${s.percentage}% を占める領域`,
      source:     'ポートフォリオ分析',
      url:        null,
    })),
    ...exits.map((e, i) => ({
      id:         `exit-${i}`,
      confidence: 'A' as const,
      category:   'Exit実績',
      title:      e,
      excerpt:    'プレスリリースまたは公開情報で確認済み',
      source:     'プレスリリース・公開情報',
      url:        null,
    })),
  ]
}

// ─── 信頼度ゲージ ─────────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: string }) {
  const cfg = CONF_CFG[level] ?? CONF_CFG['C']
  return (
    <div
      className="shrink-0 rounded-xl px-2.5 py-2 text-center border min-w-[52px]"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <div className="text-sm font-bold font-mono" style={{ color: cfg.color }}>{level}</div>
      <div className="text-xs mt-0.5" style={{ color: cfg.color, opacity: 0.8 }}>
        {cfg.stars.slice(0, 3)}
      </div>
    </div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function EvidencePage() {
  const params  = useParams()
  const vcId    = params.vcId as string

  const [genome,         setGenome]        = useState<Record<string, unknown> | null>(null)
  const [loading,        setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category>('すべて')
  const [sortByConf,     setSortByConf]    = useState(false)
  const [expandedId,     setExpandedId]    = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/genome/${vcId}`)
      .then(r => r.json())
      .then((data) => { setGenome(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [vcId])

  const allCards = useMemo(() => (genome ? buildCards(genome) : []), [genome])

  const filteredCards = useMemo(() => {
    let cards = activeCategory === 'すべて' ? allCards : allCards.filter(c => c.category === activeCategory)
    if (sortByConf) {
      const order = { A: 0, B: 1, C: 2, D: 3 }
      cards = [...cards].sort((a, b) => order[a.confidence] - order[b.confidence])
    }
    return cards
  }, [allCards, activeCategory, sortByConf])

  const level   = (genome?.metadata as Record<string, unknown>)?.data_freshness_level as string ?? 'C'
  const score   = ((genome?.metadata as Record<string, unknown>)?.overall_confidence_score as number) ?? 0.5
  const sources = ((genome?.metadata as Record<string, unknown>)?.source_count as number) ?? 0

  const confDist = useMemo(() => {
    const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
    allCards.forEach(c => { dist[c.confidence] = (dist[c.confidence] ?? 0) + 1 })
    return dist
  }, [allCards])

  return (
    <div className="space-y-6">
      {/* ─── 信頼性サマリー ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-bold text-lg mb-5">信頼性サマリー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: '総合信頼度',   value: level,                 unit: '',   color: CONF_CFG[level]?.color ?? '#6B6B80' },
            { label: '信頼スコア',   value: Math.round(score * 100), unit: '点', color: '#E8E8F0' },
            { label: '収集ソース数', value: sources,               unit: '件', color: '#6C63FF' },
            { label: '根拠データ',   value: allCards.length,       unit: '件', color: '#E8E8F0' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-3xl font-bold font-mono" style={{ color: stat.color }}>
                {stat.value}
                <span className="text-base font-normal text-genome-muted">{stat.unit}</span>
              </div>
              <div className="text-xs text-genome-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* 信頼度分布バー */}
        <div className="space-y-2">
          <p className="text-xs text-genome-muted mb-3">信頼度別分布</p>
          {(['A', 'B', 'C', 'D'] as const).map((grade) => {
            const cfg   = CONF_CFG[grade]
            const count = confDist[grade] ?? 0
            const max   = Math.max(...Object.values(confDist), 1)
            return (
              <div key={grade} className="flex items-center gap-3">
                <span className="w-4 text-xs font-mono font-bold" style={{ color: cfg.color }}>{grade}</span>
                <div className="flex-1 h-2 bg-genome-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cfg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
                <span className="text-xs text-genome-muted w-8 text-right font-mono">{count}件</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ─── フィルター + ソート ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative px-3.5 py-1.5 text-sm rounded-full border transition-colors"
              style={
                activeCategory === cat
                  ? { borderColor: '#6C63FF', color: '#6C63FF', backgroundColor: 'rgba(108,99,255,0.12)' }
                  : { borderColor: 'rgba(255,255,255,0.12)', color: '#6B6B80' }
              }
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="evidence-filter-bg"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'rgba(108,99,255,0.08)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
              )}
              <span className="relative">{cat}</span>
              <span className="relative ml-1.5 text-xs opacity-60">
                {cat === 'すべて' ? allCards.length : allCards.filter(c => c.category === cat).length}
              </span>
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={() => setSortByConf(!sortByConf)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            sortByConf
              ? 'border-genome-gold/50 text-genome-gold bg-genome-gold/10'
              : 'border-genome-border text-genome-muted hover:border-genome-gold/30'
          }`}
        >
          {sortByConf ? '★ 信頼度順' : '信頼度で並び替え'}
        </motion.button>
      </div>

      {/* ─── 根拠カード一覧 ─── */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer h-24 rounded-xl" />
            ))}
          </motion.div>
        ) : filteredCards.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl p-10 text-center"
          >
            <div className="text-4xl mb-3">📭</div>
            <p className="text-genome-muted">このカテゴリのデータはまだありません</p>
          </motion.div>
        ) : (
          <motion.div
            key={`cards-${activeCategory}-${sortByConf}`}
            className="space-y-3"
          >
            {filteredCards.map((card, i) => {
              const cfg      = CONF_CFG[card.confidence] ?? CONF_CFG['C']
              const expanded = expandedId === card.id

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="glass rounded-xl border overflow-hidden cursor-pointer"
                  style={{ borderColor: expanded ? cfg.border : 'rgba(255,255,255,0.08)' }}
                  onClick={() => setExpandedId(expanded ? null : card.id)}
                  whileHover={{ borderColor: cfg.border }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <ConfidenceBadge level={card.confidence} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs bg-genome-border px-2 py-0.5 rounded-full text-genome-muted">
                            {card.category}
                          </span>
                          <span className="text-xs" style={{ color: cfg.color, opacity: 0.8 }}>
                            {cfg.label}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm text-genome-text">{card.title}</h3>

                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-genome-muted italic mt-2 leading-relaxed">
                                ❝ {card.excerpt} ❞
                              </p>
                              <div className="mt-3 pt-3 border-t border-genome-border">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-genome-muted">→ 出典: {card.source}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-20 bg-genome-border rounded-full overflow-hidden">
                                      <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: cfg.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cfg.score}%` }}
                                        transition={{ duration: 0.6 }}
                                      />
                                    </div>
                                    <span className="text-xs font-mono" style={{ color: cfg.color }}>
                                      {cfg.score}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!expanded && card.excerpt && (
                          <p className="text-xs text-genome-muted mt-1 truncate">
                            {card.excerpt}
                          </p>
                        )}
                      </div>

                      <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-genome-muted text-xs shrink-0"
                      >
                        ▼
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 矛盾検知レポート ─── */}
      {genome && (() => {
        const conflicts = ((genome.audit_log as Record<string, unknown>)?.conflicting_data as { issue: string; resolution: string }[]) ?? []
        if (conflicts.length === 0) return null
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-genome-gold/20"
          >
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <span className="text-genome-gold">⚠</span>
              矛盾検知レポート（{conflicts.length}件）
            </h2>
            <div className="space-y-3">
              {conflicts.map((c, i) => (
                <div key={i} className="bg-genome-dark rounded-xl p-4">
                  <p className="text-sm text-genome-red mb-1">検知: {c.issue}</p>
                  <p className="text-sm text-genome-muted">
                    <span className="text-genome-green mr-1">→</span>
                    Agent4判定: {c.resolution}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )
      })()}
    </div>
  )
}
