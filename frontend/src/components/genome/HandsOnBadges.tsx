interface Support {
  type: string
  score: number
  description: string
  evidence_count?: number
}

const SUPPORT_ICONS: Record<string, string> = {
  Recruiting: '🏃',
  Sales_Intro: '💼',
  Mental: '🧠',
  Finance: '💰',
  PR: '🌐',
}

const SUPPORT_LABELS: Record<string, string> = {
  Recruiting: '採用支援',
  Sales_Intro: '営業導入',
  Mental: 'メンタルケア',
  Finance: 'ファイナンス',
  PR: 'PR・広報',
}

export default function HandsOnBadges({ supports }: { supports: Support[] }) {
  return (
    <div className="space-y-3">
      {supports.map((s) => (
        <div key={s.type} className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32">
            <span>{SUPPORT_ICONS[s.type] || '•'}</span>
            <span className="text-sm text-genome-muted">{SUPPORT_LABELS[s.type] || s.type}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < Math.round(s.score / 2) ? 'text-genome-gold' : 'text-genome-border'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-genome-muted">{s.description}</span>
        </div>
      ))}
    </div>
  )
}
