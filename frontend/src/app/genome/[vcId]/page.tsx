'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import RadarChart from '@/components/genome/RadarChart'
import HandsOnBadges from '@/components/genome/HandsOnBadges'
import PhilosophyCards from '@/components/genome/PhilosophyCards'

// ─── デモデータ ──────────────────────────────────────────────────────────────

const DEMO_DATA: Record<string, any> = {
  'demo-001': {
    basic_info: { name: '田中 健一', current_affiliation: 'グローバル・ベンチャーズ株式会社', ai_generated_alias: 'The Catalyst' },
    metadata: { data_freshness_level: 'A', source_count: 12 },
    genome_stats: {
      radar_chart: { leadership: 88, technology: 72, network: 95, execution: 80, vision: 90 },
      core_philosophies: [
        { title: 'チームファースト', description: 'プロダクトより先にチームの質を見る', strength: 'high' },
        { title: 'グローバル思考', description: '初期から海外展開を前提とした戦略を重視', strength: 'high' },
        { title: '長期コミット', description: '5年以上の長期的な関与を約束', strength: 'medium' },
      ],
    },
    investment_footprint: {
      total_funded_startups: 34,
      top_sectors: [{ sector: 'SaaS', percentage: 45 }, { sector: 'AI/ML', percentage: 30 }, { sector: 'FinTech', percentage: 25 }],
      stage_distribution: { Seed: 60, PreA: 40 },
    },
    hands_on_dna: {
      specific_supports: [
        { type: '採用支援', description: 'CTO・エンジニア採用ネットワーク提供', frequency: 'high' },
        { type: '海外展開', description: 'USおよびSEAの投資家紹介', frequency: 'high' },
        { type: '資金調達', description: '次ラウンドの投資家候補紹介', frequency: 'medium' },
      ],
    },
  },
  'demo-002': {
    basic_info: { name: '山本 浩二', current_affiliation: 'スカイライン・キャピタル', ai_generated_alias: 'The Architect' },
    metadata: { data_freshness_level: 'A-', source_count: 9 },
    genome_stats: {
      radar_chart: { leadership: 75, technology: 90, network: 70, execution: 85, vision: 82 },
      core_philosophies: [
        { title: 'テック深耕', description: '技術的優位性のあるスタートアップに特化', strength: 'high' },
        { title: 'B2B重視', description: 'エンタープライズ向けSaaSを中心に投資', strength: 'high' },
      ],
    },
    investment_footprint: {
      total_funded_startups: 22,
      top_sectors: [{ sector: 'B2B SaaS', percentage: 60 }, { sector: 'DeepTech', percentage: 40 }],
      stage_distribution: { Seed: 40, PreA: 60 },
    },
    hands_on_dna: {
      specific_supports: [
        { type: '技術顧問', description: 'CTO候補の紹介・技術戦略のレビュー', frequency: 'high' },
        { type: 'エンタープライズ営業', description: '大手企業への導入支援', frequency: 'medium' },
      ],
    },
  },
  'demo-003': {
    basic_info: { name: '佐藤 美咲', current_affiliation: 'フューチャーブリッジ・パートナーズ', ai_generated_alias: 'The Connector' },
    metadata: { data_freshness_level: 'B+', source_count: 7 },
    genome_stats: {
      radar_chart: { leadership: 80, technology: 65, network: 92, execution: 75, vision: 85 },
      core_philosophies: [
        { title: 'コミュニティ重視', description: '起業家コミュニティへの貢献を優先', strength: 'high' },
        { title: 'インパクト投資', description: '社会課題解決型スタートアップに注力', strength: 'medium' },
      ],
    },
    investment_footprint: {
      total_funded_startups: 18,
      top_sectors: [{ sector: 'HRTech', percentage: 40 }, { sector: 'EdTech', percentage: 35 }, { sector: 'HealthTech', percentage: 25 }],
      stage_distribution: { Seed: 70, PreA: 30 },
    },
    hands_on_dna: {
      specific_supports: [
        { type: 'PR・広報', description: 'メディア露出・プレスリリース支援', frequency: 'high' },
        { type: 'パートナー開拓', description: '大企業との協業機会の創出', frequency: 'medium' },
      ],
    },
  },
}

// ─── Not Found ───────────────────────────────────────────────────────────────

function NotFoundView() {
  return (
    <main className="min-h-screen bg-genome-dark flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-[80px] font-black text-genome-border/30 font-mono leading-none mb-4">404</p>
        <div className="text-5xl mb-4">🧬</div>
        <h1 className="text-2xl font-bold mb-2">ゲノムが見つかりません</h1>
        <p className="text-genome-muted text-sm mb-6">このURLのプロフィールは存在しないか、まだ解析中です。</p>
        <Link href="/genome/list" className="bg-genome-accent hover:bg-genome-accent-hover text-white px-6 py-3 rounded-xl transition-colors inline-block">
          ゲノム一覧へ
        </Link>
      </div>
    </main>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function GenomeProfilePage() {
  const params = useParams()
  const vcId = params.vcId as string
  const [genome, setGenome] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!vcId) return
    if (DEMO_DATA[vcId]) {
      setGenome(DEMO_DATA[vcId])
      setLoading(false)
      return
    }
    fetch(`/api/genome/${vcId}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => {
        if (data) { setGenome(data); setLoading(false) }
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [vcId])

  if (loading) {
    return (
      <main className="min-h-screen bg-genome-dark flex items-center justify-center">
        <div className="text-genome-muted">読み込み中...</div>
      </main>
    )
  }

  if (notFound || !genome) return <NotFoundView />

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* Nav */}
      <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">VG</div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/genome/${vcId}/calibrate`} className="text-sm text-genome-muted hover:text-genome-text transition-colors">
              プロフィールを修正する
            </Link>
            <button className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
              シェア
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Tab Navigation */}
        <div className="border-b border-genome-border">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex gap-1">
              {['概要', '根拠データ', '投資年表', 'ネットワーク', '評判'].map((tab, i) => (
                <button key={tab} className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  i === 0 ? 'border-genome-accent text-genome-accent' : 'border-transparent text-genome-muted hover:text-genome-text'
                }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Profile Header */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-genome-accent/20 rounded-2xl flex items-center justify-center text-2xl border border-genome-accent/30">
                👤
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{genome.basic_info?.name || '名前未設定'}</h1>
                <p className="text-genome-muted">{genome.basic_info?.current_affiliation}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-genome-gold text-sm font-mono">✦ {genome.basic_info?.ai_generated_alias || 'AI解析中...'}</span>
                  <span className="text-xs border border-genome-border px-2 py-0.5 rounded-full text-genome-muted font-mono">
                    信頼スコア: {genome.metadata?.data_freshness_level || 'B'} ({genome.metadata?.source_count || 0}ソース)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Radar Chart */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-4">ゲノム・レーダーチャート</h2>
              <RadarChart data={genome.genome_stats?.radar_chart} />
              <button className="text-xs text-genome-accent hover:underline mt-3">
                各スコアの根拠を見る →
              </button>
            </div>

            {/* Investment Stats */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold mb-4">投資実績サマリー</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold font-mono text-genome-accent">
                    {genome.investment_footprint?.total_funded_startups || 0}
                    <span className="text-base font-normal text-genome-muted ml-1">社</span>
                  </div>
                  <div className="text-sm text-genome-muted">累計投資社数</div>
                </div>
                <div>
                  <div className="text-sm text-genome-muted mb-2">得意領域</div>
                  {(genome.investment_footprint?.top_sectors || []).map((s: { sector: string, percentage: number }) => (
                    <div key={s.sector} className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-genome-border rounded-full overflow-hidden">
                        <div className="h-full bg-genome-accent rounded-full" style={{ width: `${s.percentage}%` }} />
                      </div>
                      <span className="text-xs text-genome-muted w-24 text-right">{s.sector} {s.percentage}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm text-genome-muted mb-1">フェーズ分布</div>
                  <div className="text-sm font-mono">
                    Seed: {genome.investment_footprint?.stage_distribution?.Seed || 0}%
                    {' | '} Pre-A: {genome.investment_footprint?.stage_distribution?.PreA || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-4">投資コアフィロソフィー</h2>
            <PhilosophyCards philosophies={genome.genome_stats?.core_philosophies || []} />
          </div>

          {/* Hands-on DNA */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold mb-4">伴走スタイル</h2>
            <HandsOnBadges supports={genome.hands_on_dna?.specific_supports || []} />
          </div>
        </div>
      </div>
    </main>
  )
}
