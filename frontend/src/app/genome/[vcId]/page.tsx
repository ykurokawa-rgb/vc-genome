import Link from 'next/link'
import { notFound } from 'next/navigation'
import RadarChart from '@/components/genome/RadarChart'
import HandsOnBadges from '@/components/genome/HandsOnBadges'
import PhilosophyCards from '@/components/genome/PhilosophyCards'

async function getGenomeData(vcId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/genome/${vcId}`, {
      cache: 'no-store'
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function GenomeProfilePage({ params }: { params: Promise<{ vcId: string }> }) {
  const { vcId } = await params
  const genome = await getGenomeData(vcId)
  if (!genome) notFound()

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
