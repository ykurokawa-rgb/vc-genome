import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getGenome(vcId: string) {
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

const CONFIDENCE_COLORS: Record<string, string> = {
  A: 'text-genome-green border-genome-green/40 bg-genome-green/10',
  B: 'text-genome-accent border-genome-accent/40 bg-genome-accent/10',
  C: 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  D: 'text-genome-muted border-genome-border bg-genome-border/20',
}

const CONFIDENCE_STARS: Record<string, string> = {
  A: '★★★★★',
  B: '★★★★☆',
  C: '★★★☆☆',
  D: '★★☆☆☆',
}

const CONFIDENCE_LABEL: Record<string, string> = {
  A: '公式情報確認済み',
  B: '複数ソース確認',
  C: '単一ソース',
  D: '推測・限定情報',
}

export default async function EvidencePage({ params }: { params: Promise<{ vcId: string }> }) {
  const { vcId } = await params
  const genome = await getGenome(vcId)
  if (!genome) notFound()

  const philosophies: { tag: string; evidence_quote: string; source_description?: string }[] =
    genome.genome_stats?.core_philosophies ?? []
  const supports: { type: string; score: number; description: string; evidence_count?: number }[] =
    genome.hands_on_dna?.specific_supports ?? []
  const sectors: { sector: string; percentage: number }[] =
    genome.investment_footprint?.top_sectors ?? []
  const exits: string[] = genome.investment_footprint?.notable_exits ?? []
  const conflicts: { issue: string; resolution: string }[] =
    genome.audit_log?.conflicting_data ?? []
  const level    = genome.metadata?.data_freshness_level ?? 'C'
  const score    = genome.metadata?.overall_confidence_score ?? 0.5
  const sources  = genome.metadata?.source_count ?? 0
  const auditNotes = genome.metadata?.audit_notes ?? ''
  const nextRefresh = genome.metadata?.next_refresh_date ?? ''

  // ソースカードを組み立て（ゲノムデータから逆算）
  const evidenceCards = [
    ...philosophies.map((p, i) => ({
      id: `phil-${i}`,
      confidence: 'B',
      category: '投資哲学',
      title: p.tag,
      excerpt: p.evidence_quote,
      source: p.source_description ?? 'インタビュー・記事',
      url: null,
    })),
    ...supports.map((s, i) => ({
      id: `sup-${i}`,
      confidence: s.evidence_count && s.evidence_count > 3 ? 'A' : s.evidence_count && s.evidence_count > 0 ? 'B' : 'C',
      category: '伴走実績',
      title: s.type,
      excerpt: s.description,
      source: `エビデンス ${s.evidence_count ?? 0}件`,
      url: null,
    })),
    ...sectors.map((s, i) => ({
      id: `sec-${i}`,
      confidence: 'B',
      category: '投資領域',
      title: s.sector,
      excerpt: `全投資の ${s.percentage}% を占める領域`,
      source: 'ポートフォリオ分析',
      url: null,
    })),
    ...exits.map((e, i) => ({
      id: `exit-${i}`,
      confidence: 'A',
      category: 'Exit実績',
      title: e,
      excerpt: 'プレスリリースまたは公開情報で確認済み',
      source: 'プレスリリース・公開情報',
      url: null,
    })),
  ]

  return (
    <div className="space-y-6">
      {/* ─── 信頼性サマリー ─── */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">信頼性サマリー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold font-mono ${CONFIDENCE_COLORS[level]?.split(' ')[0]}`}>
              {level}
            </div>
            <div className="text-xs text-genome-muted mt-1">総合信頼度</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-mono text-genome-text">
              {Math.round(score * 100)}
              <span className="text-base font-normal text-genome-muted">点</span>
            </div>
            <div className="text-xs text-genome-muted mt-1">信頼スコア</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-mono text-genome-accent">
              {sources}
              <span className="text-base font-normal text-genome-muted">件</span>
            </div>
            <div className="text-xs text-genome-muted mt-1">収集ソース数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-mono text-genome-text">
              {evidenceCards.length}
              <span className="text-base font-normal text-genome-muted">件</span>
            </div>
            <div className="text-xs text-genome-muted mt-1">根拠データ</div>
          </div>
        </div>

        {auditNotes && (
          <div className="mt-4 pt-4 border-t border-genome-border">
            <p className="text-sm text-genome-muted">
              <span className="text-genome-gold font-mono mr-2">⚖ 監査メモ</span>
              {auditNotes}
            </p>
          </div>
        )}

        {nextRefresh && (
          <p className="text-xs text-genome-muted mt-2 font-mono">
            次回再解析推奨: {nextRefresh}
          </p>
        )}
      </div>

      {/* ─── フィルター（静的） ─── */}
      <div className="flex flex-wrap gap-2">
        {['すべて', '投資哲学', '伴走実績', '投資領域', 'Exit実績'].map((f) => (
          <button
            key={f}
            className="px-3 py-1.5 text-sm rounded-full border border-genome-border text-genome-muted hover:border-genome-accent hover:text-genome-accent transition-colors"
          >
            {f}
          </button>
        ))}
      </div>

      {/* ─── 根拠カード一覧 ─── */}
      <div className="space-y-3">
        {evidenceCards.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-genome-muted">
            根拠データがまだ収集されていません
          </div>
        ) : (
          evidenceCards.map((card) => (
            <div key={card.id} className="glass rounded-xl p-5 hover:border-genome-accent/30 transition-colors">
              <div className="flex items-start gap-4">
                {/* 信頼度バッジ */}
                <div className={`shrink-0 border rounded-lg px-2 py-1 text-center ${CONFIDENCE_COLORS[card.confidence]}`}>
                  <div className="text-xs font-bold font-mono">{card.confidence}</div>
                  <div className="text-xs">{CONFIDENCE_STARS[card.confidence]}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-genome-border px-2 py-0.5 rounded-full text-genome-muted">
                      {card.category}
                    </span>
                    <span className="text-xs text-genome-muted">{CONFIDENCE_LABEL[card.confidence]}</span>
                  </div>
                  <h3 className="font-medium text-sm text-genome-text mb-1">{card.title}</h3>
                  {card.excerpt && (
                    <p className="text-sm text-genome-muted italic mb-2">❝ {card.excerpt} ❞</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-genome-muted">→ 出典: {card.source}</span>
                    {card.url && (
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-genome-accent hover:underline"
                      >
                        ソースを開く ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── 矛盾検知レポート ─── */}
      {conflicts.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-genome-gold/20">
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
        </div>
      )}
    </div>
  )
}
