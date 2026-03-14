'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface VCCard {
  id: string
  name: string
  affiliation: string
  alias: string
  sectors: string[]
  stage: string
  handsOn: string[]
  confidence: string
  radar: Record<string, number>
}

const MOCK_VCS: VCCard[] = [
  {
    id: 'vc-001',
    name: '木下慶彦',
    affiliation: 'ANRI',
    alias: 'SaaS成長の番人',
    sectors: ['SaaS', 'AI'],
    stage: 'Seed',
    handsOn: ['採用支援', '営業導入'],
    confidence: 'A',
    radar: { strategy: 8, empathy: 7, network: 9, expertise: 8, speed: 8 },
  },
  {
    id: 'vc-002',
    name: '赤浦徹',
    affiliation: 'インキュベイトファンド',
    alias: 'シードの父',
    sectors: ['B2B SaaS', 'HR Tech'],
    stage: 'Seed',
    handsOn: ['メンタルケア', '採用支援'],
    confidence: 'A',
    radar: { strategy: 7, empathy: 9, network: 8, expertise: 7, speed: 9 },
  },
  {
    id: 'vc-003',
    name: '渡辺洋行',
    affiliation: 'Coral Capital',
    alias: 'グローバル視点のブリッジ',
    sectors: ['SaaS', 'AI', 'グローバル'],
    stage: 'Pre-A',
    handsOn: ['営業導入', '海外展開'],
    confidence: 'A-',
    radar: { strategy: 9, empathy: 6, network: 9, expertise: 9, speed: 7 },
  },
  {
    id: 'vc-004',
    name: '宮田拓弥',
    affiliation: 'Scrum Ventures',
    alias: 'シリコンバレー直結の橋渡し人',
    sectors: ['Deep Tech', 'AI', 'グローバル'],
    stage: 'Seed',
    handsOn: ['海外展開', '営業導入'],
    confidence: 'A',
    radar: { strategy: 9, empathy: 7, network: 9, expertise: 9, speed: 8 },
  },
  {
    id: 'vc-005',
    name: '孫泰蔵',
    affiliation: 'Mistletoe',
    alias: '哲学を持つ宇宙人',
    sectors: ['Deep Tech', '社会課題', 'Web3'],
    stage: 'Seed',
    handsOn: ['メンタルケア', 'PR'],
    confidence: 'B+',
    radar: { strategy: 10, empathy: 8, network: 9, expertise: 8, speed: 6 },
  },
  {
    id: 'demo-1',
    name: '田中 健一',
    affiliation: 'Alpha Ventures',
    alias: '静かなる情熱のデータサイエンティスト',
    sectors: ['SaaS', 'AI/ML', 'FinTech'],
    stage: 'Seed',
    handsOn: ['採用支援', '技術アドバイス'],
    confidence: 'A',
    radar: { strategy: 8, empathy: 7, network: 8, expertise: 9, speed: 7 },
  },
  {
    id: 'demo-2',
    name: '佐藤 美咲',
    affiliation: 'Horizon Capital',
    alias: '起業家の灯台守',
    sectors: ['Healthcare', 'BioTech', 'MedTech'],
    stage: 'Pre-A',
    handsOn: ['メンタルケア', '採用支援'],
    confidence: 'B+',
    radar: { strategy: 7, empathy: 9, network: 8, expertise: 8, speed: 7 },
  },
  {
    id: 'demo-3',
    name: '鈴木 大輔',
    affiliation: 'Frontier Fund',
    alias: 'ディープテックの炭鉱夫',
    sectors: ['Deep Tech', 'Hardware', 'Space'],
    stage: 'Seed',
    handsOn: ['技術アドバイス', '事業開発'],
    confidence: 'A-',
    radar: { strategy: 8, empathy: 6, network: 8, expertise: 10, speed: 7 },
  },
]

const ALL_DOMAINS = ['全領域', 'SaaS', 'AI', 'Deep Tech', 'Healthcare', 'HR Tech', 'FinTech', 'グローバル', 'Web3']
const ALL_PHASES = ['全フェーズ', 'Seed', 'Pre-A', 'Series A']
const ALL_HANDSON = ['全サポート', '採用支援', '営業導入', '海外展開', 'メンタルケア', 'PR', '技術アドバイス']
const ALL_CONFIDENCE = ['全レベル', 'A', 'A-', 'B+', 'B']

const CONFIDENCE_COLORS: Record<string, string> = {
  A: 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'A-': 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'B+': 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  B: 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  C: 'text-genome-muted border-genome-border bg-genome-card',
}

const RADAR_LABELS: Record<string, string> = {
  strategy: '戦略',
  empathy: '共感',
  network: 'ネット',
  expertise: '専門性',
  speed: '速度',
}

function RadarMini({ radar }: { radar: Record<string, number> }) {
  return (
    <div className="grid grid-cols-5 gap-1 text-center">
      {Object.entries(radar).map(([key, val]) => (
        <div key={key}>
          <div className="text-genome-accent font-mono font-bold text-sm">{val}</div>
          <div className="text-genome-muted" style={{ fontSize: '10px' }}>{RADAR_LABELS[key] ?? key}</div>
        </div>
      ))}
    </div>
  )
}

export default function DiscoverPage() {
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('全領域')
  const [phase, setPhase] = useState('全フェーズ')
  const [handsOn, setHandsOn] = useState('全サポート')
  const [confidence, setConfidence] = useState('全レベル')
  const [sort, setSort] = useState('confidence')

  const filtered = useMemo(() => {
    let vcs = MOCK_VCS

    if (search) {
      const q = search.toLowerCase()
      vcs = vcs.filter(
        (v) =>
          v.name.includes(q) ||
          v.affiliation.toLowerCase().includes(q) ||
          v.alias.includes(q) ||
          v.sectors.some((s) => s.toLowerCase().includes(q))
      )
    }
    if (domain !== '全領域') {
      vcs = vcs.filter((v) => v.sectors.some((s) => s.includes(domain)))
    }
    if (phase !== '全フェーズ') {
      vcs = vcs.filter((v) => v.stage === phase)
    }
    if (handsOn !== '全サポート') {
      vcs = vcs.filter((v) => v.handsOn.includes(handsOn))
    }
    if (confidence !== '全レベル') {
      vcs = vcs.filter((v) => v.confidence === confidence)
    }

    const ORDER: Record<string, number> = { A: 4, 'A-': 3, 'B+': 2, B: 1, C: 0 }
    if (sort === 'confidence') {
      vcs = [...vcs].sort(
        (a, b) => (ORDER[b.confidence] ?? 0) - (ORDER[a.confidence] ?? 0)
      )
    }

    return vcs
  }, [search, domain, phase, handsOn, confidence, sort])

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* Nav */}
      <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
              VG
            </div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <div className="flex items-center gap-4">
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

      <div className="pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">投資家を探す</h1>
            <p className="text-genome-muted">
              AIが解析した投資家のゲノムプロフィールをフィルタリング・閲覧できます
            </p>
          </div>

          {/* Search bar */}
          <div className="glass rounded-2xl p-4 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="名前・所属・領域で検索..."
              className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-2.5 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors text-sm"
            />
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-genome-muted mb-1">ドメイン</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-genome-dark border border-genome-border rounded-lg px-3 py-2 text-sm text-genome-text focus:outline-none focus:border-genome-accent transition-colors"
              >
                {ALL_DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-genome-muted mb-1">フェーズ</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full bg-genome-dark border border-genome-border rounded-lg px-3 py-2 text-sm text-genome-text focus:outline-none focus:border-genome-accent transition-colors"
              >
                {ALL_PHASES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-genome-muted mb-1">伴走スタイル</label>
              <select
                value={handsOn}
                onChange={(e) => setHandsOn(e.target.value)}
                className="w-full bg-genome-dark border border-genome-border rounded-lg px-3 py-2 text-sm text-genome-text focus:outline-none focus:border-genome-accent transition-colors"
              >
                {ALL_HANDSON.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-genome-muted mb-1">信頼レベル</label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                className="w-full bg-genome-dark border border-genome-border rounded-lg px-3 py-2 text-sm text-genome-text focus:outline-none focus:border-genome-accent transition-colors"
              >
                {ALL_CONFIDENCE.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results meta */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-genome-muted">
              <span className="text-genome-text font-medium">{filtered.length}名</span>{' '}
              のゲノムが見つかりました
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-genome-dark border border-genome-border rounded-lg px-3 py-1.5 text-sm text-genome-muted focus:outline-none focus:border-genome-accent"
            >
              <option value="confidence">信頼スコア順</option>
              <option value="default">デフォルト順</option>
            </select>
          </div>

          {/* VC Cards Grid */}
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center text-genome-muted">
              条件に一致するVCが見つかりませんでした
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((vc) => (
                <div
                  key={vc.id}
                  className="glass rounded-2xl p-5 space-y-4 hover:border-genome-accent/40 transition-all hover:scale-[1.01]"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-genome-accent/20 rounded-xl flex items-center justify-center text-xl border border-genome-accent/30 shrink-0">
                        👤
                      </div>
                      <div>
                        <div className="font-bold text-genome-text">{vc.name}</div>
                        <div className="text-xs text-genome-muted">{vc.affiliation}</div>
                      </div>
                    </div>
                    <span
                      className={`text-xs border px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                        CONFIDENCE_COLORS[vc.confidence] ?? 'text-genome-muted border-genome-border'
                      }`}
                    >
                      {vc.confidence}
                    </span>
                  </div>

                  {/* Alias */}
                  <div className="text-genome-gold text-sm font-mono">✦ {vc.alias}</div>

                  {/* Sectors — top 2 as accent badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {vc.sectors.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-genome-accent/10 border border-genome-accent/30 text-genome-accent px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                    {vc.sectors.length > 2 && (
                      <span className="text-xs text-genome-muted border border-genome-border px-2 py-0.5 rounded-full">
                        +{vc.sectors.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Hands-on badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {vc.handsOn.map((h) => (
                      <span
                        key={h}
                        className="text-xs border border-genome-border text-genome-muted px-2 py-0.5 rounded-full"
                      >
                        {h}
                      </span>
                    ))}
                    <span className="text-xs border border-genome-border text-genome-muted px-2 py-0.5 rounded-full">
                      {vc.stage}
                    </span>
                  </div>

                  {/* Radar mini */}
                  <div className="bg-genome-card/60 rounded-xl p-3">
                    <RadarMini radar={vc.radar} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/genome/${vc.id}`}
                      className="flex-1 text-center py-2 text-sm border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40 rounded-xl transition-colors"
                    >
                      ゲノムを見る
                    </Link>
                    <Link
                      href="/match/simulator"
                      className="flex-1 text-center py-2 text-sm bg-genome-accent hover:bg-genome-accent-hover text-white rounded-xl transition-colors"
                    >
                      相性を診断する
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Demo notice */}
          <div className="mt-8 glass rounded-2xl p-5 border border-genome-accent/20 text-center">
            <p className="text-genome-muted text-sm">
              これはデモデータです。実際のゲノムは{' '}
              <Link href="/genome/entry" className="text-genome-accent hover:underline">
                解析フォーム
              </Link>
              {' '}から作成できます。
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
