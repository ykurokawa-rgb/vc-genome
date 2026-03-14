'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface VCCard {
  id:         string
  name:       string
  affiliation: string
  alias:      string
  sectors:    string[]
  stage:      string
  handsOn:    string[]
  confidence: string
  radar:      Record<string, number>
}

// ─── モックデータ ─────────────────────────────────────────────────────────────

const MOCK_VCS: VCCard[] = [
  { id: 'vc-001', name: '木下慶彦', affiliation: 'ANRI',                 alias: 'SaaS成長の番人',                 sectors: ['SaaS', 'AI'],                  stage: 'Seed',  handsOn: ['採用支援', '営業導入'],        confidence: 'A',  radar: { strategy: 8, empathy: 7, network: 9, expertise: 8, speed: 8 } },
  { id: 'vc-002', name: '赤浦徹',   affiliation: 'インキュベイトファンド', alias: 'シードの父',                     sectors: ['B2B SaaS', 'HR Tech'],         stage: 'Seed',  handsOn: ['メンタルケア', '採用支援'],    confidence: 'A',  radar: { strategy: 7, empathy: 9, network: 8, expertise: 7, speed: 9 } },
  { id: 'vc-003', name: '渡辺洋行', affiliation: 'Coral Capital',        alias: 'グローバル視点のブリッジ',        sectors: ['SaaS', 'AI', 'グローバル'],    stage: 'Pre-A', handsOn: ['営業導入', '海外展開'],        confidence: 'A-', radar: { strategy: 9, empathy: 6, network: 9, expertise: 9, speed: 7 } },
  { id: 'vc-004', name: '宮田拓弥', affiliation: 'Scrum Ventures',       alias: 'シリコンバレー直結の橋渡し人',    sectors: ['Deep Tech', 'AI', 'グローバル'], stage: 'Seed', handsOn: ['海外展開', '営業導入'],       confidence: 'A',  radar: { strategy: 9, empathy: 7, network: 9, expertise: 9, speed: 8 } },
  { id: 'vc-005', name: '孫泰蔵',   affiliation: 'Mistletoe',            alias: '哲学を持つ宇宙人',               sectors: ['Deep Tech', '社会課題', 'Web3'], stage: 'Seed', handsOn: ['メンタルケア', 'PR'],        confidence: 'B+', radar: { strategy: 10, empathy: 8, network: 9, expertise: 8, speed: 6 } },
  { id: 'demo-1', name: '田中 健一', affiliation: 'Alpha Ventures',      alias: '静かなる情熱のデータサイエンティスト', sectors: ['SaaS', 'AI/ML', 'FinTech'], stage: 'Seed', handsOn: ['採用支援', '技術アドバイス'], confidence: 'A',  radar: { strategy: 8, empathy: 7, network: 8, expertise: 9, speed: 7 } },
  { id: 'demo-2', name: '佐藤 美咲', affiliation: 'Horizon Capital',     alias: '起業家の灯台守',                 sectors: ['Healthcare', 'BioTech', 'MedTech'], stage: 'Pre-A', handsOn: ['メンタルケア', '採用支援'], confidence: 'B+', radar: { strategy: 7, empathy: 9, network: 8, expertise: 8, speed: 7 } },
  { id: 'demo-3', name: '鈴木 大輔', affiliation: 'Frontier Fund',       alias: 'ディープテックの炭鉱夫',          sectors: ['Deep Tech', 'Hardware', 'Space'], stage: 'Seed', handsOn: ['技術アドバイス', '事業開発'], confidence: 'A-', radar: { strategy: 8, empathy: 6, network: 8, expertise: 10, speed: 7 } },
]

// ─── フィルター定数 ───────────────────────────────────────────────────────────

const ALL_DOMAINS    = ['全領域', 'SaaS', 'AI', 'Deep Tech', 'Healthcare', 'HR Tech', 'FinTech', 'グローバル', 'Web3']
const ALL_PHASES     = ['全フェーズ', 'Seed', 'Pre-A', 'Series A']
const ALL_HANDSON    = ['全サポート', '採用支援', '営業導入', '海外展開', 'メンタルケア', 'PR', '技術アドバイス']

const CONFIDENCE_ORDER: Record<string, number> = { A: 5, 'A-': 4, 'B+': 3, B: 2, C: 1 }

const CONFIDENCE_CFG: Record<string, { color: string; bg: string; border: string }> = {
  A:   { color: '#00D48A', bg: 'rgba(0,212,138,0.10)',  border: 'rgba(0,212,138,0.35)' },
  'A-':{ color: '#00D48A', bg: 'rgba(0,212,138,0.08)',  border: 'rgba(0,212,138,0.3)'  },
  'B+':{ color: '#F0C040', bg: 'rgba(240,192,64,0.10)', border: 'rgba(240,192,64,0.35)' },
  B:   { color: '#F0C040', bg: 'rgba(240,192,64,0.08)', border: 'rgba(240,192,64,0.3)'  },
  C:   { color: '#6B6B80', bg: 'rgba(107,107,128,0.08)', border: 'rgba(107,107,128,0.25)' },
}

// ─── 決定論的ミニアバター ─────────────────────────────────────────────────────

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

function MiniAvatar({ id, name, size = 48 }: { id: string; name: string; size?: number }) {
  const seed = hashId(id)
  const hue  = seed % 360

  return (
    <div
      className="rounded-2xl border flex items-center justify-center font-bold shrink-0 text-sm"
      style={{
        width:       size,
        height:      size,
        borderColor: `hsla(${hue}, 60%, 50%, 0.5)`,
        background:  `linear-gradient(135deg, hsl(${hue},70%,24%), hsl(${(hue+70)%360},65%,18%))`,
        color:       `hsl(${hue}, 90%, 82%)`,
        fontSize:    size > 36 ? 16 : 12,
      }}
    >
      {name.charAt(0)}
    </div>
  )
}

// ─── SVGレーダーチャート ──────────────────────────────────────────────────────

const RADAR_KEYS = ['strategy', 'empathy', 'network', 'expertise', 'speed']
const RADAR_LABELS: Record<string, string> = {
  strategy: '戦略', empathy: '共感', network: 'ネット', expertise: '専門', speed: '速度',
}

function RadarChart({ data, size = 80 }: { data: Record<string, number>; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.38
  const N  = RADAR_KEYS.length

  const pt = (i: number, val: number) => {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2
    return { x: cx + val * Math.cos(angle), y: cy + val * Math.sin(angle) }
  }

  const outerPts  = RADAR_KEYS.map((_, i) => pt(i, r))
  const midPts    = RADAR_KEYS.map((_, i) => pt(i, r * 0.5))
  const dataPts   = RADAR_KEYS.map((k, i) => pt(i, ((data[k] ?? 0) / 10) * r))

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + 'Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      {/* スポーク */}
      {outerPts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {/* グリッド */}
      <path d={toPath(outerPts)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <path d={toPath(midPts)}   fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      {/* データ */}
      <motion.path
        d={toPath(dataPts)}
        fill="rgba(108,99,255,0.22)"
        stroke="#6C63FF"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* ドット */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#6C63FF" />
      ))}
      {/* ラベル */}
      {outerPts.map((p, i) => {
        const lx = cx + (p.x - cx) * 1.32
        const ly = cy + (p.y - cy) * 1.32
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
            fontSize="7" fill="rgba(232,232,240,0.5)" fontFamily="system-ui">
            {RADAR_LABELS[RADAR_KEYS[i]]}
          </text>
        )
      })}
    </svg>
  )
}

// ─── 比較パネル ───────────────────────────────────────────────────────────────

function CompareBar({
  selected,
  vcs,
  onClear,
}: {
  selected: string[]
  vcs:      VCCard[]
  onClear:  () => void
}) {
  const a = vcs.find(v => v.id === selected[0])
  const b = vcs.find(v => v.id === selected[1])

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-sticky glass border-t border-genome-accent/30 px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-xs text-genome-muted font-mono">比較モード</span>
          {[a, b].map((vc, i) => (
            <div key={i} className="flex items-center gap-2">
              {vc ? (
                <>
                  <MiniAvatar id={vc.id} name={vc.name} size={32} />
                  <span className="text-sm font-medium">{vc.name}</span>
                </>
              ) : (
                <div className="w-8 h-8 rounded-xl border border-dashed border-genome-border flex items-center justify-center text-genome-muted text-xs">
                  ?
                </div>
              )}
              {i === 0 && <span className="text-genome-muted text-sm">vs</span>}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {selected.length === 2 && (
            <Link
              href={`/genome/${selected[0]}?compare=${selected[1]}`}
              className="bg-genome-accent hover:bg-genome-accent-hover text-white text-sm px-5 py-2 rounded-xl transition-colors font-medium"
            >
              比較する →
            </Link>
          )}
          <button
            onClick={onClear}
            className="text-sm text-genome-muted hover:text-genome-text border border-genome-border px-4 py-2 rounded-xl transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── VCカード ─────────────────────────────────────────────────────────────────

function VCCardGrid({
  vc,
  index,
  isCompared,
  compareCount,
  onToggleCompare,
}: {
  vc:             VCCard
  index:          number
  isCompared:     boolean
  compareCount:   number
  onToggleCompare: () => void
}) {
  const cfg = CONFIDENCE_CFG[vc.confidence] ?? CONFIDENCE_CFG['C']

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
      className={`glass rounded-2xl p-5 space-y-4 border transition-all group ${
        isCompared ? 'border-genome-accent/60 bg-genome-accent/5' : 'border-genome-border hover:border-genome-accent/30'
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <MiniAvatar id={vc.id} name={vc.name} />
          <div>
            <div className="font-bold text-genome-text">{vc.name}</div>
            <div className="text-xs text-genome-muted">{vc.affiliation}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 信頼バッジ */}
          <span
            className="text-xs border px-2 py-0.5 rounded-full font-mono font-bold shrink-0"
            style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
          >
            {vc.confidence}
          </span>
          {/* 比較チェック */}
          <button
            onClick={onToggleCompare}
            disabled={!isCompared && compareCount >= 2}
            title={isCompared ? '比較から外す' : '比較に追加'}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs transition-all ${
              isCompared
                ? 'border-genome-accent bg-genome-accent text-white'
                : compareCount >= 2
                ? 'border-genome-border text-genome-border opacity-40 cursor-not-allowed'
                : 'border-genome-border text-genome-muted hover:border-genome-accent hover:text-genome-accent'
            }`}
          >
            {isCompared ? '✓' : '+'}
          </button>
        </div>
      </div>

      {/* エイリアス */}
      <p className="text-genome-gold text-sm font-mono">✦ {vc.alias}</p>

      {/* レーダー + セクター */}
      <div className="flex items-center gap-4">
        <RadarChart data={vc.radar} size={80} />
        <div className="flex-1 min-w-0 space-y-2">
          {/* セクター */}
          <div className="flex flex-wrap gap-1.5">
            {vc.sectors.slice(0, 2).map(s => (
              <span key={s} className="text-xs bg-genome-accent/10 border border-genome-accent/25 text-genome-accent px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
            {vc.sectors.length > 2 && (
              <span className="text-xs text-genome-muted border border-genome-border px-2 py-0.5 rounded-full">
                +{vc.sectors.length - 2}
              </span>
            )}
          </div>
          {/* 伴走スタイル */}
          <div className="flex flex-wrap gap-1.5">
            {vc.handsOn.map(h => (
              <span key={h} className="text-xs border border-genome-border text-genome-muted px-2 py-0.5 rounded-full">
                {h}
              </span>
            ))}
            <span className="text-xs border border-genome-border text-genome-muted px-2 py-0.5 rounded-full">
              {vc.stage}
            </span>
          </div>
        </div>
      </div>

      {/* アクション */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/genome/${vc.id}`}
          className="flex-1 text-center py-2 text-sm border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40 rounded-xl transition-colors"
        >
          ゲノムを見る
        </Link>
        <Link
          href={`/genome/${vc.id}/shadow-chat`}
          className="flex-1 text-center py-2 text-sm bg-genome-accent hover:bg-genome-accent-hover text-white rounded-xl transition-colors"
        >
          AIチャット
        </Link>
      </div>
    </motion.div>
  )
}

// ─── リストビュー行 ───────────────────────────────────────────────────────────

function VCListRow({
  vc,
  index,
  isCompared,
  compareCount,
  onToggleCompare,
}: {
  vc:             VCCard
  index:          number
  isCompared:     boolean
  compareCount:   number
  onToggleCompare: () => void
}) {
  const cfg = CONFIDENCE_CFG[vc.confidence] ?? CONFIDENCE_CFG['C']

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`glass rounded-xl px-5 py-4 flex items-center gap-4 border transition-all ${
        isCompared ? 'border-genome-accent/60' : 'border-genome-border hover:border-genome-accent/30'
      }`}
    >
      <MiniAvatar id={vc.id} name={vc.name} size={40} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-genome-text">{vc.name}</span>
          <span className="text-xs text-genome-muted">{vc.affiliation}</span>
        </div>
        <p className="text-xs text-genome-gold font-mono truncate">✦ {vc.alias}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {vc.sectors.slice(0, 1).map(s => (
          <span key={s} className="text-xs bg-genome-accent/10 border border-genome-accent/25 text-genome-accent px-2 py-0.5 rounded-full hidden sm:block">
            {s}
          </span>
        ))}
        <span className="text-xs border border-genome-border text-genome-muted px-2 py-0.5 rounded-full hidden sm:block">
          {vc.stage}
        </span>
        <span
          className="text-xs border px-2 py-0.5 rounded-full font-mono font-bold"
          style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
        >
          {vc.confidence}
        </span>
        <button
          onClick={onToggleCompare}
          disabled={!isCompared && compareCount >= 2}
          className={`w-6 h-6 rounded border text-xs transition-all ${
            isCompared ? 'border-genome-accent bg-genome-accent text-white' : 'border-genome-border text-genome-muted'
          }`}
        >
          {isCompared ? '✓' : '+'}
        </button>
        <Link
          href={`/genome/${vc.id}`}
          className="text-genome-muted hover:text-genome-accent transition-colors text-sm"
        >
          →
        </Link>
      </div>
    </motion.div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [search,     setSearch]     = useState('')
  const [domain,     setDomain]     = useState('全領域')
  const [phase,      setPhase]      = useState('全フェーズ')
  const [handsOn,    setHandsOn]    = useState('全サポート')
  const [viewMode,   setViewMode]   = useState<'grid' | 'list'>('grid')
  const [compared,   setCompared]   = useState<string[]>([])
  const [sort,       setSort]       = useState('confidence')

  const filtered = useMemo(() => {
    let vcs = MOCK_VCS
    if (search) {
      const q = search.toLowerCase()
      vcs = vcs.filter(v =>
        v.name.includes(q) ||
        v.affiliation.toLowerCase().includes(q) ||
        v.alias.includes(q) ||
        v.sectors.some(s => s.toLowerCase().includes(q))
      )
    }
    if (domain  !== '全領域')  vcs = vcs.filter(v => v.sectors.some(s => s.includes(domain)))
    if (phase   !== '全フェーズ') vcs = vcs.filter(v => v.stage === phase)
    if (handsOn !== '全サポート') vcs = vcs.filter(v => v.handsOn.includes(handsOn))
    if (sort === 'confidence') {
      vcs = [...vcs].sort((a, b) => (CONFIDENCE_ORDER[b.confidence] ?? 0) - (CONFIDENCE_ORDER[a.confidence] ?? 0))
    }
    return vcs
  }, [search, domain, phase, handsOn, sort])

  const toggleCompare = useCallback((id: string) => {
    setCompared(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev
    )
  }, [])

  // アクティブフィルター
  const activeFilters = [
    domain  !== '全領域'   ? domain  : null,
    phase   !== '全フェーズ' ? phase   : null,
    handsOn !== '全サポート' ? handsOn : null,
  ].filter(Boolean) as string[]

  const clearAll = () => { setDomain('全領域'); setPhase('全フェーズ'); setHandsOn('全サポート'); setSearch('') }

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* ─── ナビ ─── */}
      <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-sticky">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-105">
              VG
            </div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <div className="flex items-center gap-3">
            <kbd
              className="text-xs text-genome-muted border border-genome-border px-2 py-1 rounded font-mono hidden sm:block cursor-default"
              title="Cmd+K でコマンドパレットを開く"
            >
              ⌘K
            </kbd>
            <Link
              href="/genome/entry"
              className="text-sm text-genome-muted hover:text-genome-text transition-colors"
            >
              自分のゲノムを作成
            </Link>
            <Link
              href="/match/simulator"
              className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors"
            >
              相性シミュレーター
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* ─── ヘッダー ─── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">投資家を探す</h1>
            <p className="text-genome-muted">
              AIが解析した投資家のゲノムプロフィールをフィルタリング・閲覧できます
            </p>
          </motion.div>

          {/* ─── 検索バー ─── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass rounded-2xl p-4 mb-4 relative"
          >
            <div className="flex items-center gap-3">
              <span className="text-genome-muted">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="名前・所属・領域で検索..."
                className="flex-1 bg-transparent text-genome-text placeholder-genome-muted focus:outline-none text-sm"
              />
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearch('')}
                  className="text-genome-muted hover:text-genome-text text-xs transition-colors"
                >
                  ✕
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* ─── フィルター ─── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-2xl p-4 mb-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'ドメイン',  value: domain,  options: ALL_DOMAINS,  set: setDomain  },
                { label: 'フェーズ', value: phase,   options: ALL_PHASES,   set: setPhase   },
                { label: '伴走スタイル', value: handsOn, options: ALL_HANDSON, set: setHandsOn },
              ].map(({ label, value, options, set }) => (
                <div key={label}>
                  <label className="block text-xs text-genome-muted mb-1">{label}</label>
                  <select
                    value={value}
                    onChange={e => set(e.target.value)}
                    className="w-full bg-genome-dark border border-genome-border rounded-lg px-3 py-2 text-sm text-genome-text focus:outline-none focus:border-genome-accent transition-colors"
                  >
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* アクティブフィルターピル */}
            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-genome-border"
                >
                  {activeFilters.map(f => (
                    <motion.span
                      key={f}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-xs bg-genome-accent/15 border border-genome-accent/35 text-genome-accent px-3 py-1 rounded-full"
                    >
                      {f}
                    </motion.span>
                  ))}
                  <button onClick={clearAll} className="text-xs text-genome-muted hover:text-genome-text transition-colors underline">
                    すべてクリア
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ─── 結果メタ ─── */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm text-genome-muted">
              <motion.span
                key={filtered.length}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-genome-text font-medium"
              >
                {filtered.length}名
              </motion.span>
              {' '}のゲノムが見つかりました
            </p>

            <div className="flex items-center gap-3">
              {/* ビューモード */}
              <div className="flex border border-genome-border rounded-lg overflow-hidden">
                {(['grid', 'list'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      viewMode === mode
                        ? 'bg-genome-accent text-white'
                        : 'text-genome-muted hover:text-genome-text'
                    }`}
                  >
                    {mode === 'grid' ? '⊞' : '≡'}
                  </button>
                ))}
              </div>

              {/* ソート */}
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-genome-dark border border-genome-border rounded-lg px-3 py-1.5 text-sm text-genome-muted focus:outline-none focus:border-genome-accent transition-colors"
              >
                <option value="confidence">信頼スコア順</option>
                <option value="default">デフォルト順</option>
              </select>
            </div>
          </div>

          {/* ─── カード一覧 ─── */}
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl py-16 text-center"
              >
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-genome-muted">条件に一致するVCが見つかりませんでした</p>
                <button onClick={clearAll} className="text-sm text-genome-accent hover:underline mt-3 block mx-auto">
                  フィルターをリセット
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                className="grid md:grid-cols-2 gap-5"
              >
                {filtered.map((vc, i) => (
                  <VCCardGrid
                    key={vc.id}
                    vc={vc}
                    index={i}
                    isCompared={compared.includes(vc.id)}
                    compareCount={compared.length}
                    onToggleCompare={() => toggleCompare(vc.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="space-y-2"
              >
                {filtered.map((vc, i) => (
                  <VCListRow
                    key={vc.id}
                    vc={vc}
                    index={i}
                    isCompared={compared.includes(vc.id)}
                    compareCount={compared.length}
                    onToggleCompare={() => toggleCompare(vc.id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── デモ注意 ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 glass rounded-2xl p-5 border border-genome-accent/20 text-center"
          >
            <p className="text-genome-muted text-sm">
              これはデモデータです。実際のゲノムは{' '}
              <Link href="/genome/entry" className="text-genome-accent hover:underline">
                解析フォーム
              </Link>
              {' '}から作成できます。
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── 比較バー ─── */}
      <AnimatePresence>
        {compared.length > 0 && (
          <CompareBar
            selected={compared}
            vcs={MOCK_VCS}
            onClear={() => setCompared([])}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
