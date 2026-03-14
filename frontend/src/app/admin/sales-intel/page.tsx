'use client'

import { useState } from 'react'

interface VCOpportunity {
  name: string
  affil: string
  reason: string
  matchStartup: string
  signal: string
}

const PRIORITIES: { tier: string; label: string; color: string; border: string; vcs: VCOpportunity[] }[] = [
  {
    tier: 'now',
    label: '今すぐ',
    color: 'text-genome-red',
    border: 'border-genome-red/40',
    vcs: [
      {
        name: '木下慶彦',
        affil: 'ANRI',
        reason: '3日前にSaaS投資強化を表明。資金調達中の案件を積極探索中。',
        matchStartup: 'TechFlow Inc.',
        signal: 'SNS投稿 / 3日前',
      },
      {
        name: '赤浦徹',
        affil: 'インキュベイトファンド',
        reason: 'シードHR Tech案件を探している旨をXで公言。今がベストタイミング。',
        matchStartup: 'HireAI株式会社',
        signal: 'X投稿 / 昨日',
      },
    ],
  },
  {
    tier: 'week',
    label: '来週',
    color: 'text-genome-gold',
    border: 'border-genome-gold/40',
    vcs: [
      {
        name: '渡辺洋行',
        affil: 'Coral Capital',
        reason: '海外展開支援に関するブログ更新。グローバル展開志向の案件に最適。',
        matchStartup: 'GlobalSaaS合同会社',
        signal: 'ブログ更新 / 4日前',
      },
      {
        name: '宮田拓弥',
        affil: 'Scrum Ventures',
        reason: 'シリコンバレー視察から帰国予定。Deep Tech案件への関心高まり中。',
        matchStartup: 'RoboSeed株式会社',
        signal: 'カレンダー情報 / 推定',
      },
    ],
  },
  {
    tier: 'month',
    label: '来月',
    color: 'text-genome-accent',
    border: 'border-genome-accent/40',
    vcs: [
      {
        name: '孫泰蔵',
        affil: 'Mistletoe',
        reason: '次のファンドクローズ後に新規案件検討予定とのアナウンス。',
        matchStartup: 'PhiloTech株式会社',
        signal: 'ニュース記事 / 2週間前',
      },
    ],
  },
]

function DMModal({ vc, onClose }: { vc: VCOpportunity; onClose: () => void }) {
  const [generating, setGenerating] = useState(false)
  const [dm, setDm] = useState('')

  const generateDM = async () => {
    setGenerating(true)
    // Simulate AI DM generation
    await new Promise((r) => setTimeout(r, 1500))
    setDm(`${vc.name}様

突然のご連絡失礼いたします。StartPassの[名前]と申します。

現在、${vc.matchStartup}という${vc.signal.split(' / ')[0]}に関連する事業を展開しているスタートアップとご縁があり、${vc.name}様のご専門領域と非常に高い親和性があると感じ、ご連絡させていただきました。

${vc.reason}

もしよろしければ、30分ほどお時間をいただき、詳しくご説明させていただけますでしょうか。

何卒よろしくお願いいたします。`)
    setGenerating(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="glass rounded-2xl w-full max-w-lg p-6 space-y-4 border border-genome-accent/30">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">DM下書き生成 — {vc.name}</h3>
          <button
            onClick={onClose}
            className="text-genome-muted hover:text-genome-text transition-colors"
          >
            ✕
          </button>
        </div>

        {!dm && !generating && (
          <div className="py-8 text-center space-y-3">
            <p className="text-genome-muted text-sm">
              AIが{vc.name}様向けのパーソナライズされたDMを生成します
            </p>
            <button
              onClick={generateDM}
              className="px-6 py-2.5 bg-genome-accent hover:bg-genome-accent-hover text-white rounded-xl text-sm font-medium transition-colors"
            >
              AIでDM下書きを生成
            </button>
          </div>
        )}

        {generating && (
          <div className="py-8 text-center space-y-3">
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-genome-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-genome-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-genome-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-genome-muted text-sm">AIがDMを生成しています...</p>
          </div>
        )}

        {dm && (
          <>
            <textarea
              value={dm}
              onChange={(e) => setDm(e.target.value)}
              rows={10}
              className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text text-sm resize-none focus:outline-none focus:border-genome-accent transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(dm)}
                className="flex-1 py-2.5 border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40 rounded-xl text-sm transition-colors"
              >
                コピー
              </button>
              <button
                onClick={generateDM}
                className="flex-1 py-2.5 border border-genome-accent text-genome-accent hover:bg-genome-accent/10 rounded-xl text-sm transition-colors"
              >
                再生成
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SalesIntelPage() {
  const [selectedVC, setSelectedVC] = useState<VCOpportunity | null>(null)

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">セールスインテリジェンス</h1>
        <p className="text-genome-muted text-sm mt-1">
          AIがVCのシグナルを分析し、最適なアプローチタイミングを提案します
        </p>
      </div>

      <div className="space-y-8">
        {PRIORITIES.map((priority) => (
          <div key={priority.tier}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className={`font-bold text-lg ${priority.color}`}>{priority.label}</h2>
              <div className={`h-px flex-1 border-t ${priority.border}`} />
              <span className="text-xs text-genome-muted">{priority.vcs.length}件</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {priority.vcs.map((vc, i) => (
                <div
                  key={i}
                  className={`glass rounded-2xl p-5 border hover:scale-[1.01] transition-all ${priority.border}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold">{vc.name}</div>
                      <div className="text-xs text-genome-muted">{vc.affil}</div>
                    </div>
                    <span className="text-xs text-genome-muted bg-genome-card/80 px-2 py-1 rounded-lg">
                      {vc.signal}
                    </span>
                  </div>

                  <p className="text-sm text-genome-text leading-relaxed mb-3">{vc.reason}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs border border-genome-accent/30 text-genome-accent px-2 py-1 rounded-lg">
                      推奨マッチ: {vc.matchStartup}
                    </span>
                    <button
                      onClick={() => setSelectedVC(vc)}
                      className="text-xs bg-genome-accent/10 hover:bg-genome-accent/20 text-genome-accent border border-genome-accent/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      AIでDM下書きを生成
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedVC && (
        <DMModal vc={selectedVC} onClose={() => setSelectedVC(null)} />
      )}
    </div>
  )
}
