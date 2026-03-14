import { notFound } from 'next/navigation'

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

export default async function ReputationPage({ params }: { params: Promise<{ vcId: string }> }) {
  const { vcId } = await params
  const genome = await getGenome(vcId)
  if (!genome) notFound()

  const handson   = genome.hands_on_dna ?? {}
  const supports: { type: string; score: number; description: string; evidence_count?: number }[] =
    handson.specific_supports ?? []
  const vibe: string  = handson.reputation_vibe ?? ''
  const crisis: string = handson.crisis_behavior ?? ''
  const weekly: string = handson.weekly_interaction_simulation ?? ''
  const keywords: string[] = genome.genome_stats?.keywords ?? []

  // vibe を分割（「・」「/」「、」区切り）
  const vibeItems = vibe
    ? vibe.split(/[・\/、,]/).map((v: string) => v.trim()).filter(Boolean)
    : []

  // 感情スコアをキーワードから推定
  const positiveKeywords = ['誠実', '丁寧', '熱心', '速い', '支援', '信頼', '採用', '本気', '寄り添う', 'ハンズオン']
  const positiveCount = keywords.filter((k) =>
    positiveKeywords.some((p) => k.includes(p))
  ).length
  const positiveRatio = keywords.length > 0
    ? Math.min(95, 70 + Math.round((positiveCount / keywords.length) * 30))
    : 80

  // 疑似レビューカード（伴走データから組み立て）
  const reputationCards = supports
    .filter((s) => s.score >= 6)
    .map((s) => {
      const messages: Record<string, string> = {
        Recruiting:  '採用面接のサポートが非常に手厚く、CXO候補の紹介まで動いてくれました。',
        Sales_Intro: '大手への営業リードを複数紹介していただき、初年度の売上に直結しました。',
        Mental:      'ダウンラウンドの際も最後まで一緒に考えてくれた。投資家として信頼できる方です。',
        Finance:     '次のラウンドに向けた投資家紹介から条件交渉まで伴走してくれました。',
        PR:          '登壇の機会をいくつかセットしていただき、認知度向上に大きく貢献しました。',
      }
      return {
        type: s.type,
        score: s.score,
        message: messages[s.type] ?? `${s.description}の面での支援が印象的でした。`,
        isPositive: s.score >= 7,
      }
    })

  return (
    <div className="space-y-6">
      {/* ─── 感情分析サマリー ─── */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-5">Founder's Voice — 評判分析</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 感情スコア */}
          <div>
            <p className="text-sm text-genome-muted mb-3">感情分析スコア</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-genome-green">ポジティブ</span>
                  <span className="font-mono">{positiveRatio}%</span>
                </div>
                <div className="h-2 bg-genome-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-genome-green rounded-full"
                    style={{ width: `${positiveRatio}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-genome-muted">ニュートラル</span>
                  <span className="font-mono">{Math.round((100 - positiveRatio) * 0.7)}%</span>
                </div>
                <div className="h-2 bg-genome-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-genome-muted rounded-full"
                    style={{ width: `${Math.round((100 - positiveRatio) * 0.7)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-genome-red">ネガティブ</span>
                  <span className="font-mono">{Math.round((100 - positiveRatio) * 0.3)}%</span>
                </div>
                <div className="h-2 bg-genome-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-genome-red rounded-full"
                    style={{ width: `${Math.round((100 - positiveRatio) * 0.3)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 印象タグ */}
          <div className="md:col-span-2">
            <p className="text-sm text-genome-muted mb-3">起業家からの印象キーワード</p>
            <div className="flex flex-wrap gap-2">
              {vibeItems.length > 0
                ? vibeItems.map((v: string) => (
                    <span
                      key={v}
                      className="text-sm border border-genome-accent/40 bg-genome-accent/10 text-genome-accent px-3 py-1 rounded-full"
                    >
                      {v}
                    </span>
                  ))
                : keywords.slice(0, 8).map((k) => (
                    <span
                      key={k}
                      className="text-sm border border-genome-border bg-genome-dark text-genome-muted px-3 py-1 rounded-full"
                    >
                      {k}
                    </span>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 危機時の行動 ─── */}
      {crisis && (
        <div className="glass rounded-2xl p-5 border border-genome-gold/20">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <span className="text-genome-gold">⚡</span>
            危機時のスタイル
          </h2>
          <p className="text-sm text-genome-muted leading-relaxed">{crisis}</p>
        </div>
      )}

      {/* ─── 週次インタラクションシミュレーション ─── */}
      {weekly && (
        <div className="glass rounded-2xl p-5 border border-genome-accent/20">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <span>📅</span>
            投資後の月曜日（週次シミュレーション）
          </h2>
          <div className="bg-genome-dark rounded-xl p-4">
            <p className="text-sm text-genome-text leading-relaxed font-mono">{weekly}</p>
          </div>
          <p className="text-xs text-genome-muted mt-2">
            ※ AIによるシミュレーションです。実際のコミュニケーションは個人差があります。
          </p>
        </div>
      )}

      {/* ─── 起業家からの声（伴走実績から生成） ─── */}
      <div className="space-y-4">
        <h2 className="font-bold">伴走実績ベースの評判</h2>

        {reputationCards.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-genome-muted">
            伴走実績データの収集中です
          </div>
        ) : (
          reputationCards.map((card, i) => (
            <div
              key={i}
              className={`glass rounded-xl p-5 border ${
                card.isPositive ? 'border-genome-green/20' : 'border-genome-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    card.isPositive
                      ? 'bg-genome-green/20 text-genome-green'
                      : 'bg-genome-border text-genome-muted'
                  }`}
                >
                  {card.isPositive ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs border border-genome-border px-2 py-0.5 rounded-full text-genome-muted">
                      {card.type}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={
                            j < Math.round(card.score / 2)
                              ? 'text-genome-gold text-xs'
                              : 'text-genome-border text-xs'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-sm text-genome-text italic">
                    ❝ {card.message} ❞
                  </blockquote>
                  <p className="text-xs text-genome-muted mt-2">
                    AI解析によるシミュレーション（伴走スコア: {card.score}/10 に基づく）
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── 免責 ─── */}
      <div className="glass rounded-xl p-4 border border-genome-border">
        <p className="text-xs text-genome-muted leading-relaxed">
          ⚠ このページの評判データはAIによる公開情報の解析と伴走スタイル分析に基づいて生成されています。
          実際の起業家の証言とは異なる場合があります。
          より正確な情報はキャピタリスト本人の<a href="#" className="text-genome-accent hover:underline">キャリブレーション</a>によって更新されます。
        </p>
      </div>
    </div>
  )
}
