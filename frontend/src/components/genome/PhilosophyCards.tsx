interface Philosophy {
  tag: string
  evidence_quote: string
  source_url?: string
}

export default function PhilosophyCards({ philosophies }: { philosophies: Philosophy[] }) {
  return (
    <div className="space-y-4">
      {philosophies.map((p) => (
        <div key={p.tag} className="border-l-2 border-genome-accent/50 pl-4">
          <div className="inline-flex items-center gap-1 bg-genome-accent/10 text-genome-accent text-xs px-2 py-0.5 rounded-full mb-2">
            {p.tag}
          </div>
          <blockquote className="text-genome-text italic mb-1">
            ❝ {p.evidence_quote} ❞
          </blockquote>
          {p.source_url && (
            <a href={p.source_url} target="_blank" rel="noopener noreferrer"
               className="text-xs text-genome-muted hover:text-genome-accent transition-colors">
              → 出典を見る ↗
            </a>
          )}
        </div>
      ))}
      {philosophies.length === 0 && (
        <p className="text-genome-muted text-sm">解析中...</p>
      )}
    </div>
  )
}
