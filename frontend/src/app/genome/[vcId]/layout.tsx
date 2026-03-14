import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getGenomeBasic(vcId: string) {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/genome/${vcId}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const TABS = [
  { label: '概要',       href: '' },
  { label: '根拠データ', href: '/evidence' },
  { label: '投資年表',   href: '/timeline' },
  { label: 'ネットワーク', href: '/network' },
  { label: '評判',       href: '/reputation' },
  { label: 'カレンダー', href: '/calendar' },
]

export default async function GenomeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ vcId: string }>
}) {
  const { vcId } = await params
  const genome = await getGenomeBasic(vcId)
  if (!genome) notFound()

  const name       = genome.basic_info?.name ?? ''
  const affil      = genome.basic_info?.current_affiliation ?? ''
  const alias      = genome.basic_info?.ai_generated_alias ?? ''
  const level      = genome.metadata?.data_freshness_level ?? 'C'
  const sources    = genome.metadata?.source_count ?? 0

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* ─── Nav ─── */}
      <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
              VG
            </div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/genome/${vcId}/calibrate`}
              className="text-sm text-genome-muted hover:text-genome-text transition-colors"
            >
              プロフィールを修正する
            </Link>
            <button className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
              シェア
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* ─── Profile Header ─── */}
        <div className="border-b border-genome-border bg-genome-card/60">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-genome-accent/20 rounded-2xl flex items-center justify-center text-2xl border border-genome-accent/30 shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold">{name}</h1>
                <p className="text-genome-muted text-sm">{affil}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {alias && (
                    <span className="text-genome-gold text-sm font-mono">✦ {alias}</span>
                  )}
                  <span className="text-xs border border-genome-border px-2 py-0.5 rounded-full text-genome-muted font-mono">
                    信頼スコア: {level}（{sources}ソース）
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Tab Nav ─── */}
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((tab) => {
                const href = `/genome/${vcId}${tab.href}`
                return (
                  <Link
                    key={tab.label}
                    href={href}
                    className="px-4 py-3 text-sm font-medium whitespace-nowrap text-genome-muted hover:text-genome-text border-b-2 border-transparent hover:border-genome-accent/50 transition-colors"
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─── Page Content ─── */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </main>
  )
}
