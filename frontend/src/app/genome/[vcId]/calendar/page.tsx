'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

interface FocusArea {
  area: string
  percentage: number
  event_count: number
  insight: string
}

interface CalendarData {
  focus_areas: FocusArea[]
  current_top_focus: string
  sourcing_vs_handson: { sourcing: number; handson: number; operations: number }
  activity_summary: string
  next_move_prediction: string
}

export default function CalendarPage() {
  const params = useParams()
  const _vcId = params.vcId as string
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)

  const loadDemo = async () => {
    setLoading(true)
    const res = await fetch('/api/calendar/demo')
    const json = await res.json()
    setData(json)
    setConnected(true)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {!connected ? (
        /* Connect CTA */
        <div className="glass rounded-2xl p-10 text-center border border-genome-accent/20">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-bold mb-3">Googleカレンダーを連携する</h2>
          <p className="text-genome-muted text-sm mb-2 max-w-md mx-auto leading-relaxed">
            直近30日の予定を解析し、「今どの領域に最もリソースを割いているか」をリアルタイムで可視化します。
          </p>
          <p className="text-xs text-genome-muted mb-8">
            カレンダーデータはサーバーに保存されず、解析後即時破棄されます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadDemo}
              disabled={loading}
              className="bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {loading ? '解析中...' : 'デモデータで試す'}
            </button>
            <button className="border border-genome-border hover:border-genome-accent/50 text-genome-muted hover:text-genome-text px-6 py-3 rounded-xl transition-colors text-sm">
              Googleで連携する（準備中）
            </button>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Top Focus Banner */}
          <div className="glass rounded-2xl p-5 border border-genome-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-genome-green rounded-full animate-pulse" />
              <div>
                <p className="text-xs text-genome-muted font-mono">現在の最注力領域</p>
                <p className="font-bold text-genome-accent">{data.current_top_focus}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-genome-muted">次の動き予測</p>
                <p className="text-sm text-genome-gold">{data.next_move_prediction}</p>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-bold mb-3">直近30日 行動サマリー</h2>
            <p className="text-sm text-genome-muted leading-relaxed">{data.activity_summary}</p>
          </div>

          {/* Focus Areas */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-bold mb-4">時間配分（直近30日）</h2>
            <div className="space-y-4">
              {data.focus_areas.map((area) => (
                <div key={area.area}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{area.area}</span>
                      {area.insight && (
                        <span className="text-xs text-genome-muted bg-genome-border px-2 py-0.5 rounded-full">
                          {area.insight}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-genome-muted text-xs">{area.event_count}件</span>
                      <span className="font-mono text-genome-accent">{area.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-genome-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-genome-accent rounded-full transition-all duration-700"
                      style={{ width: `${area.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sourcing vs Hands-on */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-bold mb-4">活動タイプ分布</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'ソーシング', value: data.sourcing_vs_handson.sourcing, color: 'text-genome-accent', icon: '🔍' },
                { label: 'ハンズオン', value: data.sourcing_vs_handson.handson, color: 'text-genome-green', icon: '🤝' },
                { label: 'オペレーション', value: data.sourcing_vs_handson.operations, color: 'text-genome-gold', icon: '⚙️' },
              ].map((item) => (
                <div key={item.label} className="bg-genome-dark rounded-xl p-4 border border-genome-border">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}%</div>
                  <div className="text-xs text-genome-muted mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <p className="text-xs text-genome-muted">
              ⚠ このデータはデモ用のサンプルデータです。実際のGoogleカレンダー連携は準備中です。
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
