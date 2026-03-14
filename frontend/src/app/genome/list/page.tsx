import Link from 'next/link'

interface GenomeSummary {
  id: string
  name: string
  affiliation: string
  ai_generated_alias: string
  confidence: string
  created_at: string | null
}

async function getGenomeList(): Promise<GenomeSummary[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/genome/`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

const CONFIDENCE_COLORS: Record<string, string> = {
  A: 'text-genome-green border-genome-green/40 bg-genome-green/10',
  B: 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  C: 'text-genome-muted border-genome-border',
  D: 'text-genome-red border-genome-red/40 bg-genome-red/10',
}

export default async function GenomeListPage() {
  const genomes = await getGenomeList()

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* Nav */}
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">解析済みゲノム一覧</h1>
            <p className="text-genome-muted text-sm">{genomes.length}件のゲノムプロフィール</p>
          </div>

          {genomes.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">🧬</div>
              <h2 className="text-lg font-bold mb-2">まだゲノムがありません</h2>
              <p className="text-genome-muted text-sm mb-6">最初のVCゲノムを解析してみましょう</p>
              <Link
                href="/genome/entry"
                className="bg-genome-accent hover:bg-genome-accent-hover text-white px-6 py-3 rounded-xl transition-colors inline-block"
              >
                解析を開始する
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {genomes.map((g) => (
                <Link
                  key={g.id}
                  href={`/genome/${g.id}`}
                  className="glass rounded-xl p-4 flex items-center justify-between group hover:border-genome-accent/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-genome-accent/20 rounded-xl flex items-center justify-center text-lg border border-genome-accent/30">
                      👤
                    </div>
                    <div>
                      <div className="font-medium text-genome-text group-hover:text-genome-accent transition-colors">
                        {g.name}
                      </div>
                      <div className="text-xs text-genome-muted">{g.affiliation}</div>
                      {g.ai_generated_alias && (
                        <div className="text-xs text-genome-gold font-mono mt-0.5">✦ {g.ai_generated_alias}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {g.created_at && (
                      <span className="text-xs text-genome-muted hidden sm:block">
                        {new Date(g.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                    <span className={`text-xs border px-2 py-0.5 rounded-full font-mono font-bold ${CONFIDENCE_COLORS[g.confidence] || 'text-genome-muted border-genome-border'}`}>
                      {g.confidence}
                    </span>
                    <span className="text-genome-muted group-hover:text-genome-accent transition-colors">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
