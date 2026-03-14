import Link from 'next/link'

const MOCK_STATS = [
  { label: '総ゲノム数', value: '247', unit: '件', color: 'text-genome-accent' },
  { label: '本日の解析数', value: '12', unit: '件', color: 'text-genome-green' },
  { label: '平均信頼スコア', value: 'B+', unit: '', color: 'text-genome-gold' },
  { label: 'アクティブエージェント', value: '4', unit: '台', color: 'text-genome-text' },
]

const MOCK_ACTIVITY = [
  { name: '木下慶彦', affil: 'ANRI', action: 'ゲノム更新', time: '3分前', level: 'A' },
  { name: '渡辺洋行', affil: 'Coral Capital', action: '新規解析', time: '18分前', level: 'A-' },
  { name: '孫泰蔵', affil: 'Mistletoe', action: 'キャリブレーション', time: '42分前', level: 'B+' },
  { name: '赤浦徹', affil: 'インキュベイトファンド', action: 'ゲノム更新', time: '1時間前', level: 'A' },
  { name: '宮田拓弥', affil: 'Scrum Ventures', action: '新規解析', time: '2時間前', level: 'B' },
]

const MOCK_AGENTS = [
  { name: 'SNSスキャナー', status: 'running', desc: 'Twitter/Xをモニタリング中', jobs: 8 },
  { name: 'ポートフォリオ解析AI', status: 'running', desc: '投資先データを収集中', jobs: 3 },
  { name: 'ニュースクローラー', status: 'idle', desc: '次回実行: 15:00', jobs: 0 },
  { name: 'ゲノム品質チェッカー', status: 'running', desc: 'データ整合性を確認中', jobs: 12 },
]

const APPROACH_VCS = [
  {
    name: '木下慶彦',
    affil: 'ANRI',
    reason: '3日前にSaaS系スタートアップへの積極投資意向を表明。タイミング最良。',
    match: 'TechFlow Inc.',
  },
  {
    name: '赤浦徹',
    affil: 'インキュベイトファンド',
    reason: 'シードラウンドのHR Tech案件を探している旨をXで投稿。',
    match: 'HireAI株式会社',
  },
  {
    name: '渡辺洋行',
    affil: 'Coral Capital',
    reason: '海外展開支援に関するブログ記事を公開。グローバル志向の起業家に最適。',
    match: 'GlobalSaaS合同会社',
  },
]

const LEVEL_COLORS: Record<string, string> = {
  A: 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'A-': 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'B+': 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  B: 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
}

export default function AdminDashboardPage() {
  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-genome-muted text-sm mt-1">VC Genome 管理パネル</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {MOCK_STATS.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className={`text-3xl font-bold font-mono ${stat.color}`}>
              {stat.value}
              {stat.unit && (
                <span className="text-base font-normal text-genome-muted ml-1">{stat.unit}</span>
              )}
            </div>
            <div className="text-sm text-genome-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Activity feed */}
        <div className="col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">最近のゲノムアクティビティ</h2>
            <Link
              href="/match/discover"
              className="text-xs text-genome-accent hover:underline"
            >
              全件表示 →
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_ACTIVITY.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-2 border-b border-genome-border last:border-0"
              >
                <div className="w-9 h-9 rounded-xl bg-genome-accent/10 border border-genome-accent/20 flex items-center justify-center text-sm shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-genome-muted">{item.affil}</div>
                </div>
                <div className="text-xs text-genome-muted shrink-0">{item.action}</div>
                <span
                  className={`text-xs border px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                    LEVEL_COLORS[item.level] ?? 'text-genome-muted border-genome-border'
                  }`}
                >
                  {item.level}
                </span>
                <div className="text-xs text-genome-muted shrink-0 w-16 text-right">{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent status */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-4">エージェントステータス</h2>
          <div className="space-y-3">
            {MOCK_AGENTS.map((agent, i) => (
              <div key={i} className="bg-genome-card/60 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{agent.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        agent.status === 'running'
                          ? 'bg-genome-green animate-pulse'
                          : 'bg-genome-muted'
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        agent.status === 'running' ? 'text-genome-green' : 'text-genome-muted'
                      }`}
                    >
                      {agent.status === 'running' ? '稼働中' : '待機中'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-genome-muted">{agent.desc}</div>
                {agent.jobs > 0 && (
                  <div className="text-xs text-genome-accent mt-1">{agent.jobs}件処理中</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approach recommendations */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-bold">今すぐアプローチ推奨</h2>
          <span className="text-xs bg-genome-red/20 text-genome-red border border-genome-red/40 px-2 py-0.5 rounded-full">
            HOT
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {APPROACH_VCS.map((vc, i) => (
            <div key={i} className="bg-genome-card/60 rounded-xl p-4 space-y-2 border border-genome-border hover:border-genome-accent/40 transition-colors">
              <div className="font-medium text-sm">{vc.name}</div>
              <div className="text-xs text-genome-muted">{vc.affil}</div>
              <p className="text-xs text-genome-text leading-relaxed">{vc.reason}</p>
              <div className="text-xs border border-genome-accent/30 text-genome-accent px-2 py-1 rounded-lg">
                推奨マッチ: {vc.match}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
