'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useGenomeStore, type RecentVC } from '@/store/useGenomeStore'
import type { GenomeSummary, ConfidenceLevel } from '@/types/genome'

// ─── デモデータ（バックエンド未接続時のフォールバック）────────────────────────────

const DEMO_GENOMES: GenomeSummary[] = [
  { id: 'demo-001', name: '田中 健一', affiliation: 'グローバル・ベンチャーズ株式会社', ai_generated_alias: 'The Catalyst', confidence: 'A', created_at: '2026-03-10T00:00:00Z' },
  { id: 'demo-002', name: '山本 浩二', affiliation: 'スカイライン・キャピタル', ai_generated_alias: 'The Architect', confidence: 'A-', created_at: '2026-03-08T00:00:00Z' },
  { id: 'demo-003', name: '佐藤 美咲', affiliation: 'フューチャーブリッジ・パートナーズ', ai_generated_alias: 'The Connector', confidence: 'B+', created_at: '2026-03-05T00:00:00Z' },
  { id: 'demo-004', name: '鈴木 大輔', affiliation: 'ネクストステージ・ファンド', ai_generated_alias: 'The Operator', confidence: 'B', created_at: '2026-02-28T00:00:00Z' },
  { id: 'demo-005', name: '伊藤 裕子', affiliation: 'イノベーション・ラボ・VC', ai_generated_alias: 'The Visionary', confidence: 'B+', created_at: '2026-02-20T00:00:00Z' },
  { id: 'demo-006', name: '渡辺 剛', affiliation: 'パシフィック・グロース・ファンド', ai_generated_alias: 'The Strategist', confidence: 'C', created_at: '2026-02-15T00:00:00Z' },
]

// ─── 定数 ─────────────────────────────────────────────────────────────────────

const CONFIDENCE_RANK: Record<string, number> = {
  A: 0, 'A-': 1, 'B+': 2, B: 3, C: 4, D: 5,
}

const CONFIDENCE_COLORS: Record<string, string> = {
  A:   'text-genome-green border-genome-green/40 bg-genome-green/10',
  'A-':'text-genome-green border-genome-green/40 bg-genome-green/10',
  'B+':'text-genome-gold  border-genome-gold/40  bg-genome-gold/10',
  B:   'text-genome-gold  border-genome-gold/40  bg-genome-gold/10',
  C:   'text-genome-muted border-genome-border',
  D:   'text-genome-red   border-genome-red/40   bg-genome-red/10',
}

type SortKey = 'date' | 'confidence' | 'name'

// ─── 幾何学アバター ────────────────────────────────────────────────────────────

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i)
  }
  return Math.abs(h)
}

function MiniAvatar({ id, name, size = 40 }: { id: string; name: string; size?: number }) {
  const seed = hashId(id)
  const hue  = seed % 360
  const hue2 = (hue + 40) % 360
  const initial = name.slice(0, 1).toUpperCase() || '?'

  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 border border-white/10"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue},65%,45%), hsl(${hue2},70%,35%))`,
        fontSize: size * 0.35,
      }}
    >
      {initial}
    </div>
  )
}

// ─── 最近閲覧カード ────────────────────────────────────────────────────────────

function RecentCard({ vc, index }: { vc: RecentVC; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Link
        href={`/genome/${vc.vcId}`}
        className="flex flex-col items-center gap-2 p-3 glass rounded-xl hover:border-genome-accent/40 transition-all w-24 shrink-0"
      >
        <MiniAvatar id={vc.vcId} name={vc.name} size={36} />
        <div className="text-center">
          <p className="text-xs font-medium text-genome-text truncate w-full leading-tight">{vc.name}</p>
          <span className={`text-[9px] border px-1.5 py-0.5 rounded-full font-mono font-bold mt-1 inline-block ${CONFIDENCE_COLORS[vc.confidence] ?? 'text-genome-muted border-genome-border'}`}>
            {vc.confidence}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── ゲノムリストアイテム ──────────────────────────────────────────────────────

function GenomeListItem({ genome, index }: { genome: GenomeSummary; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Link
        href={`/genome/${genome.id}`}
        className="glass rounded-xl p-4 flex items-center justify-between group hover:border-genome-accent/50 transition-all block"
      >
        <div className="flex items-center gap-4">
          <MiniAvatar id={genome.id} name={genome.name} size={44} />
          <div>
            <div className="font-medium text-genome-text group-hover:text-genome-accent transition-colors">
              {genome.name}
            </div>
            <div className="text-xs text-genome-muted">{genome.affiliation}</div>
            {genome.ai_generated_alias && (
              <div className="text-xs text-genome-gold font-mono mt-0.5">✦ {genome.ai_generated_alias}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {genome.created_at && (
            <span className="text-xs text-genome-muted hidden sm:block">
              {new Date(genome.created_at).toLocaleDateString('ja-JP')}
            </span>
          )}
          <span className={`text-xs border px-2 py-0.5 rounded-full font-mono font-bold ${CONFIDENCE_COLORS[genome.confidence] ?? 'text-genome-muted border-genome-border'}`}>
            {genome.confidence}
          </span>
          <span className="text-genome-muted group-hover:text-genome-accent transition-colors text-sm">→</span>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── メインページ ──────────────────────────────────────────────────────────────

export default function GenomeListPage() {
  const recentlyViewed = useGenomeStore(s => s.recentlyViewed)

  const [genomes, setGenomes] = useState<GenomeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [sort,    setSort]    = useState<SortKey>('date')

  // ─ データ取得
  useEffect(() => {
    fetch('/api/genome/list')
      .then(r => r.json())
      .then((data: GenomeSummary[]) => { setGenomes(data.length > 0 ? data : DEMO_GENOMES); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // ─ 検索 + ソート
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const matched = q
      ? genomes.filter(g =>
          g.name.toLowerCase().includes(q) ||
          g.affiliation.toLowerCase().includes(q) ||
          (g.ai_generated_alias ?? '').toLowerCase().includes(q)
        )
      : genomes

    return [...matched].sort((a, b) => {
      if (sort === 'confidence') {
        return (CONFIDENCE_RANK[a.confidence] ?? 9) - (CONFIDENCE_RANK[b.confidence] ?? 9)
      }
      if (sort === 'name') {
        return a.name.localeCompare(b.name, 'ja')
      }
      // date
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return db - da
    })
  }, [genomes, search, sort])

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'date',       label: '日付順' },
    { key: 'confidence', label: '信頼度順' },
    { key: 'name',       label: '名前順' },
  ]

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* ── Nav ── */}
      <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">VG</div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <Link href="/genome/entry" className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
            + 新規解析
          </Link>
        </div>
      </nav>

      <div className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          {/* ── ヘッダー ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold mb-1">解析済みゲノム一覧</h1>
            <p className="text-genome-muted text-sm">
              {loading ? '読み込み中...' : `${genomes.length}件のゲノムプロフィール`}
            </p>
          </motion.div>

          {/* ── 最近閲覧 ── */}
          <AnimatePresence>
            {recentlyViewed.length > 0 && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <p className="text-xs text-genome-muted mb-3 uppercase tracking-widest font-mono">最近閲覧</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {recentlyViewed.map((vc, i) => (
                    <RecentCard key={vc.vcId} vc={vc} index={i} />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── 検索 + ソート ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-genome-muted text-sm">🔍</span>
              <input
                type="search"
                placeholder="名前・ファンド・エイリアスで検索..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-genome-card border border-genome-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-genome-accent/50 transition-colors"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-genome-muted hover:text-genome-text text-sm"
                  >
                    ✕
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ソートタブ */}
            <div className="flex bg-genome-card border border-genome-border rounded-xl p-1 gap-1">
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`relative text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    sort === key ? 'text-genome-text font-medium' : 'text-genome-muted hover:text-genome-text'
                  }`}
                >
                  {sort === key && (
                    <motion.div
                      layoutId="sort-indicator"
                      className="absolute inset-0 bg-genome-accent/20 rounded-lg border border-genome-accent/30"
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── リスト本体 ── */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="shimmer h-20 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              {search ? (
                <>
                  <div className="text-3xl mb-4">🔎</div>
                  <h2 className="text-lg font-bold mb-2">「{search}」に一致するゲノムが見つかりません</h2>
                  <button
                    onClick={() => setSearch('')}
                    className="mt-4 text-sm text-genome-accent hover:underline"
                  >
                    検索をクリア
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">🧬</div>
                  <h2 className="text-lg font-bold mb-2">まだゲノムがありません</h2>
                  <p className="text-genome-muted text-sm mb-6">最初のVCゲノムを解析してみましょう</p>
                  <Link
                    href="/genome/entry"
                    className="bg-genome-accent hover:bg-genome-accent-hover text-white px-6 py-3 rounded-xl transition-colors inline-block"
                  >
                    解析を開始する
                  </Link>
                </>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              {/* 検索ヒット数 */}
              <AnimatePresence>
                {search && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-genome-muted pb-1"
                  >
                    {filtered.length}件ヒット
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {filtered.map((g, i) => (
                  <GenomeListItem key={g.id} genome={g} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
