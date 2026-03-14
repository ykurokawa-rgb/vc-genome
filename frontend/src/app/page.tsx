import Link from 'next/link'
import OnboardingModal from '@/components/onboarding/OnboardingModal'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-genome-dark overflow-hidden">
      <OnboardingModal />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-genome-border glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
              VG
            </div>
            <span className="font-bold text-genome-text">VC Genome</span>
            <span className="text-xs text-genome-muted ml-2 border border-genome-border px-2 py-0.5 rounded-full">
              by StartPass
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/genome/entry" className="text-sm text-genome-muted hover:text-genome-text transition-colors">
              キャピタリストの方
            </Link>
            <Link href="/match/discover" className="text-sm text-genome-muted hover:text-genome-text transition-colors">
              起業家の方
            </Link>
            <Link href="/auth/login" className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
              ログイン
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(108,99,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-genome-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-genome-accent/30 bg-genome-accent/10 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 bg-genome-green rounded-full animate-pulse" />
            <span className="text-sm text-genome-accent font-mono">AI Agents ONLINE — 12体稼働中</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            日本のVC業界に、
            <br />
            <span className="text-genome-accent">解像度革命</span>を。
          </h1>

          <p className="text-xl text-genome-muted mb-4 leading-relaxed">
            あなたの投資DNAは、すでにWebに刻まれている。
          </p>
          <p className="text-lg text-genome-muted mb-12 leading-relaxed">
            AIがそれを読み解き、世界最高精度の<br />
            キャピタリストプロフィールを自動生成する。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/genome/entry"
              className="inline-flex items-center justify-center gap-2 bg-genome-accent hover:bg-genome-accent-hover text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 glow"
            >
              <span>🧬</span>
              ゲノムを解析する
              <span className="text-sm font-normal opacity-70">（キャピタリスト）</span>
            </Link>
            <Link
              href="/match/discover"
              className="inline-flex items-center justify-center gap-2 border border-genome-border bg-genome-card hover:border-genome-accent/50 text-genome-text font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
            >
              <span>🔍</span>
              投資家を探す
              <span className="text-sm font-normal text-genome-muted">（起業家）</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-genome-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '247', label: '解析済みVC', unit: '名' },
            { value: '12,000', label: '収集情報ソース', unit: '件' },
            { value: '1,834', label: 'マッチング成立', unit: '件' },
            { value: '91', label: '平均信頼スコア', unit: '点' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold text-genome-accent font-mono">
                {stat.value}<span className="text-lg">{stat.unit}</span>
              </div>
              <div className="text-sm text-genome-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">「入力」は、もう要らない</h2>
          <p className="text-genome-muted text-center mb-16">名前を入れるだけ。AIが24時間、あなたのDNAを調べ上げる。</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '⌨️',
                title: '名前と所属を入力',
                desc: 'フォームへの記入はたった2項目。URLを追加すれば精度がさらに上がります。',
              },
              {
                step: '02',
                icon: '🤖',
                title: 'AIエージェントが自律解析',
                desc: '4体の専門エージェントが並列稼働。Web上の全情報を収集・分析します。',
              },
              {
                step: '03',
                icon: '🧬',
                title: 'ゲノムプロフィール完成',
                desc: '約30秒で、プロが数日かけて作るような職務経歴書が生成されます。',
              },
            ].map((item) => (
              <div key={item.step} className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-genome-accent/50 transition-colors">
                <div className="absolute top-4 right-4 font-mono text-4xl font-bold text-genome-border group-hover:text-genome-accent/20 transition-colors">
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-genome-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section className="py-24 px-6 bg-genome-card/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">4体の専門AIエージェント</h2>
          <p className="text-genome-muted text-center mb-16">それぞれ異なる役割を持ち、合議制で「人物像」を構築する</p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'Fact Investigator',
                role: '実績・経歴の番人',
                icon: '🔍',
                color: 'from-blue-500/20 to-transparent',
                border: 'border-blue-500/30',
                tasks: ['投資実績・フェーズの照合', '名寄せ・重複排除', 'ExitデータのDB照合'],
                confidence: 'A',
              },
              {
                name: 'Philosophy Profiler',
                role: '思想・文体解析官',
                icon: '🧠',
                color: 'from-purple-500/20 to-transparent',
                border: 'border-purple-500/30',
                tasks: ['note/X/記事の文体解析', '投資哲学の言語化', '二つ名の生成'],
                confidence: 'B+',
              },
              {
                name: 'Hands-on Analyst',
                role: '伴走スタイル特定官',
                icon: '🤝',
                color: 'from-green-500/20 to-transparent',
                border: 'border-green-500/30',
                tasks: ['起業家の言及を横断収集', '支援タイプの分類', '第三者評価の集約'],
                confidence: 'B',
              },
              {
                name: 'Freshness Guard',
                role: '鮮度・矛盾検知官',
                icon: '⚖️',
                color: 'from-yellow-500/20 to-transparent',
                border: 'border-yellow-500/30',
                tasks: ['情報の時系列整合性検証', '矛盾の検知と解釈', '信頼スコアの算出'],
                confidence: 'A-',
              },
            ].map((agent) => (
              <div key={agent.name} className={`glass rounded-2xl p-6 border ${agent.border} relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-2xl mb-1">{agent.icon}</div>
                      <h3 className="font-bold text-genome-text">{agent.name}</h3>
                      <p className="text-xs text-genome-muted">{agent.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-genome-muted">精度</div>
                      <div className="font-mono font-bold text-genome-gold">{agent.confidence}</div>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {agent.tasks.map((task) => (
                      <li key={task} className="flex items-center gap-2 text-sm text-genome-muted">
                        <span className="text-genome-green text-xs">✓</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-genome-border">
        <div className="max-w-5xl mx-auto text-center text-genome-muted text-sm">
          <p>© 2026 StartPass, Inc. All rights reserved.</p>
          <p className="mt-2">VC Genome は StartPass のプロダクトです。</p>
        </div>
      </footer>
    </main>
  )
}
