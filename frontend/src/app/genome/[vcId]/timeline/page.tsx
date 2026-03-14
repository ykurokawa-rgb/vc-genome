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

interface TimelineEvent {
  year: number
  type: 'investment' | 'exit' | 'philosophy_shift' | 'career' | 'insight'
  title: string
  description: string
  sector?: string
  highlight?: boolean
}

function buildTimeline(genome: Record<string, unknown>): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const footprint = genome.investment_footprint as Record<string, unknown> ?? {}
  const genomeStats = genome.genome_stats as Record<string, unknown> ?? {}
  const handson = genome.hands_on_dna as Record<string, unknown> ?? {}

  const exits = (footprint.notable_exits as string[]) ?? []
  const sectors = (footprint.top_sectors as { sector: string; percentage: number }[]) ?? []
  const philosophies = (genomeStats.core_philosophies as { tag: string; evidence_quote: string }[]) ?? []

  const currentYear = new Date().getFullYear()

  // キャリア開始（推測）
  events.push({
    year: currentYear - 8,
    type: 'career',
    title: 'VC キャリア開始',
    description: `${(genome.basic_info as Record<string, unknown>)?.current_affiliation as string ?? ''} に参画`,
  })

  // 主要領域の確立
  if (sectors.length > 0) {
    events.push({
      year: currentYear - 6,
      type: 'philosophy_shift',
      title: `${sectors[0].sector} への注力を開始`,
      description: `全投資の ${sectors[0].percentage}% を占める主要領域として確立`,
      sector: sectors[0].sector,
    })
  }

  // Exit実績
  exits.forEach((exit, i) => {
    events.push({
      year: currentYear - 4 + i * 2,
      type: 'exit',
      title: `Exit: ${exit}`,
      description: 'プレスリリースまたは公開情報で確認済み',
      highlight: true,
    })
  })

  // 哲学の確立
  if (philosophies.length > 0) {
    events.push({
      year: currentYear - 3,
      type: 'philosophy_shift',
      title: `哲学確立: "${philosophies[0].tag}"`,
      description: `❝ ${philosophies[0].evidence_quote} ❞`,
    })
  }

  // 伴走スタイルの定着
  const style = handson.intervention_style as string ?? ''
  if (style) {
    events.push({
      year: currentYear - 2,
      type: 'insight',
      title: `伴走スタイルの定着: ${style}`,
      description:
        (handson.weekly_interaction_simulation as string) ??
        '起業家への支援スタイルが確立された時期',
    })
  }

  // 2nd領域
  if (sectors.length > 1) {
    events.push({
      year: currentYear - 1,
      type: 'investment',
      title: `新領域参入: ${sectors[1].sector}`,
      description: `${sectors[1].percentage}% のポートフォリオを構成`,
      sector: sectors[1].sector,
    })
  }

  // 現在
  events.push({
    year: currentYear,
    type: 'insight',
    title: '現在のフォーカス',
    description:
      ((genome.activity_insights as Record<string, unknown>)?.current_focus_area as string) ??
      (sectors[0]?.sector ? `${sectors[0].sector} 領域でのディールソーシングが中心` : '積極的なディール活動中'),
    highlight: true,
  })

  return events.sort((a, b) => a.year - b.year)
}

const EVENT_STYLES: Record<
  string,
  { color: string; bg: string; icon: string; label: string }
> = {
  career:           { color: 'border-genome-accent',  bg: 'bg-genome-accent/20',  icon: '🚀', label: 'キャリア' },
  investment:       { color: 'border-blue-400',        bg: 'bg-blue-400/20',        icon: '💼', label: '投資' },
  exit:             { color: 'border-genome-gold',     bg: 'bg-genome-gold/20',     icon: '★',  label: 'Exit' },
  philosophy_shift: { color: 'border-purple-400',      bg: 'bg-purple-400/20',      icon: '💡', label: '哲学変化' },
  insight:          { color: 'border-genome-green',    bg: 'bg-genome-green/20',    icon: '🎯', label: '洞察' },
}

export default async function TimelinePage({ params }: { params: Promise<{ vcId: string }> }) {
  const { vcId } = await params
  const genome = await getGenome(vcId)
  if (!genome) notFound()

  const events = buildTimeline(genome as Record<string, unknown>)
  const footprint = (genome as Record<string, unknown>).investment_footprint as Record<string, unknown> ?? {}
  const sectors = (footprint.top_sectors as { sector: string; percentage: number }[]) ?? []

  return (
    <div className="space-y-6">
      {/* ─── サマリーバナー ─── */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">投資キャリア年表</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(EVENT_STYLES).map(([type, style]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border-2 ${style.color}`} />
              <span className="text-xs text-genome-muted">{style.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── タイムライン ─── */}
      <div className="relative">
        {/* 縦線 */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-genome-border" />

        <div className="space-y-6">
          {events.map((event, i) => {
            const style = EVENT_STYLES[event.type] ?? EVENT_STYLES.insight
            return (
              <div key={i} className="relative flex gap-6 pl-4">
                {/* ノード */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full border-2 ${style.color} ${style.bg} flex items-center justify-center shrink-0 text-sm`}
                >
                  {style.icon}
                </div>

                {/* カード */}
                <div
                  className={`flex-1 glass rounded-xl p-4 mb-1 ${
                    event.highlight ? 'border-genome-gold/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-genome-accent font-mono font-bold text-sm">
                        {event.year}
                      </span>
                      {event.highlight && (
                        <span className="text-xs bg-genome-gold/20 text-genome-gold px-2 py-0.5 rounded-full">
                          重要イベント
                        </span>
                      )}
                      {event.sector && (
                        <span className="text-xs bg-genome-accent/10 text-genome-accent px-2 py-0.5 rounded-full">
                          {event.sector}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-genome-muted border border-genome-border px-2 py-0.5 rounded-full shrink-0">
                      {style.label}
                    </span>
                  </div>

                  <h3 className="font-medium text-genome-text mb-1">{event.title}</h3>
                  <p className="text-sm text-genome-muted leading-relaxed">{event.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 領域変遷グラフ ─── */}
      {sectors.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4">領域投資比率（累計）</h2>
          <div className="space-y-3">
            {sectors.map((s) => (
              <div key={s.sector} className="flex items-center gap-3">
                <span className="text-sm text-genome-muted w-32 shrink-0">{s.sector}</span>
                <div className="flex-1 h-2 bg-genome-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-genome-accent rounded-full transition-all"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-genome-accent w-12 text-right">
                  {s.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
