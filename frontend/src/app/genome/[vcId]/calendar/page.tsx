'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface FocusArea {
  area:        string
  percentage:  number
  event_count: number
  insight:     string
}

interface CalendarData {
  focus_areas:            FocusArea[]
  current_top_focus:      string
  sourcing_vs_handson:    { sourcing: number; handson: number; operations: number }
  activity_summary:       string
  next_move_prediction:   string
}

// ─── 決定論的ヒートマップ生成 ─────────────────────────────────────────────────

function generateHeatmap(seed: number, days = 35): number[] {
  return Array.from({ length: days }, (_, i) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233) * 10000
    const v = x - Math.floor(x)
    return v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : v < 0.9 ? 3 : 4
  })
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

function ActivityHeatmap({ seed }: { seed: number }) {
  const cells  = generateHeatmap(seed)
  const colors = [
    'rgba(108,99,255,0.08)',
    'rgba(108,99,255,0.25)',
    'rgba(108,99,255,0.45)',
    'rgba(108,99,255,0.70)',
    'rgba(108,99,255,0.95)',
  ]

  // 7列 × 5行
  const weeks = Array.from({ length: 5 }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7)
  )

  return (
    <div>
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-genome-muted">{d}</div>
        ))}
      </div>

      {/* セルグリッド */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((level, di) => {
              const dayIndex = wi * 7 + di
              return (
                <motion.div
                  key={di}
                  title={`${level > 0 ? `${level * 3}件の活動` : '活動なし'}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: dayIndex * 0.015, type: 'spring', stiffness: 300 }}
                  className="aspect-square rounded-sm cursor-default"
                  style={{ backgroundColor: colors[level] }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-xs text-genome-muted">少ない</span>
        {colors.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-genome-muted">多い</span>
      </div>
    </div>
  )
}

// ─── ドーナツチャート ─────────────────────────────────────────────────────────

function DonutChart({ sourcing, handson, operations }: { sourcing: number; handson: number; operations: number }) {
  const R  = 54
  const CR = 2 * Math.PI * R
  const segments = [
    { value: sourcing,   color: '#6C63FF', label: 'ソーシング' },
    { value: handson,    color: '#00D48A', label: 'ハンズオン' },
    { value: operations, color: '#F0C040', label: 'オペレーション' },
  ]

  let offset = 0
  const arcs = segments.map(seg => {
    const dash = (seg.value / 100) * CR
    const arc  = { ...seg, dash, offset: CR - offset }
    offset += dash
    return arc
  })

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
          {arcs.map((arc, i) => (
            <motion.circle
              key={i}
              cx="64" cy="64" r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth="16"
              strokeLinecap="butt"
              strokeDasharray={`${arc.dash} ${CR - arc.dash}`}
              initial={{ strokeDashoffset: CR }}
              animate={{ strokeDashoffset: arc.offset - CR }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0, 0, 0.2, 1] }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-genome-muted">合計</span>
          <span className="text-lg font-bold font-mono">100%</span>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {segments.map((seg) => (
          <div key={seg.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-sm">{seg.label}</span>
              </div>
              <span className="font-mono text-sm" style={{ color: seg.color }}>{seg.value}%</span>
            </div>
            <div className="h-1.5 bg-genome-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: seg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${seg.value}%` }}
                transition={{ duration: 0.9, delay: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

const DEMO_DATA: CalendarData = {
  focus_areas: [
    { area: 'SaaSスタートアップ支援',         percentage: 38, event_count: 14, insight: '最優先' },
    { area: 'ディールソーシング',              percentage: 27, event_count: 10, insight: '積極化中' },
    { area: 'LP・社内オペレーション',          percentage: 18, event_count: 7,  insight: '安定稼働' },
    { area: 'イベント・カンファレンス参加',     percentage: 11, event_count: 4,  insight: '' },
    { area: 'リサーチ・情報収集',              percentage: 6,  event_count: 2,  insight: '' },
  ],
  current_top_focus:    'SaaSスタートアップ支援',
  sourcing_vs_handson:  { sourcing: 35, handson: 47, operations: 18 },
  activity_summary:     '直近30日は主にポートフォリオ企業4社への集中的な伴走期間。週2回のメンタリングセッションを通じてプロダクト戦略の方向性を共同策定。ソーシングはPR/Timesベースに加え、創業者紹介が中心。',
  next_move_prediction: 'Deep Tech分野への新規ディール検討',
}

export default function CalendarPage() {
  const params    = useParams()
  const vcId      = params.vcId as string
  const [data,      setData]      = useState<CalendarData | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [connected, setConnected] = useState(false)

  const heatmapSeed = vcId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

  const loadDemo = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setData(DEMO_DATA)
    setConnected(true)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!connected ? (
          /* ─── 連携CTA ─── */
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass rounded-2xl p-10 text-center border border-genome-accent/20"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-4"
            >
              📅
            </motion.div>
            <h2 className="text-xl font-bold mb-3">Googleカレンダーを連携する</h2>
            <p className="text-genome-muted text-sm mb-2 max-w-md mx-auto leading-relaxed">
              直近30日の予定を解析し、「今どの領域に最もリソースを割いているか」をリアルタイムで可視化します。
            </p>
            <p className="text-xs text-genome-muted mb-8">
              カレンダーデータはサーバーに保存されず、解析後即時破棄されます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={loadDemo}
                disabled={loading}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 justify-center"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    解析中…
                  </>
                ) : 'デモデータで試す'}
              </motion.button>
              <button className="border border-genome-border hover:border-genome-accent/50 text-genome-muted hover:text-genome-text px-6 py-3 rounded-xl transition-colors text-sm">
                Googleで連携する（準備中）
              </button>
            </div>
          </motion.div>
        ) : data ? (
          /* ─── データ表示 ─── */
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* 現在のフォーカス */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 border border-genome-accent/30"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-genome-green rounded-full"
                  />
                  <div>
                    <p className="text-xs text-genome-muted font-mono">現在の最注力領域</p>
                    <p className="font-bold text-genome-accent">{data.current_top_focus}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-genome-muted">次の動き予測</p>
                  <p className="text-sm text-genome-gold">{data.next_move_prediction}</p>
                </div>
              </div>
            </motion.div>

            {/* アクティビティヒートマップ */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-bold mb-5">直近35日 活動ヒートマップ</h2>
              <ActivityHeatmap seed={heatmapSeed} />
            </motion.div>

            {/* 行動サマリー */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-bold mb-3">直近30日 行動サマリー</h2>
              <p className="text-sm text-genome-muted leading-relaxed">{data.activity_summary}</p>
            </motion.div>

            {/* 時間配分バー */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-bold mb-4">時間配分（直近30日）</h2>
              <div className="space-y-4">
                {data.focus_areas.map((area, i) => (
                  <div key={area.area}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{area.area}</span>
                        {area.insight && (
                          <span className="text-xs text-genome-accent bg-genome-accent/10 px-2 py-0.5 rounded-full">
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
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, #6C63FF, #9D95FF)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${area.percentage}%` }}
                        transition={{ duration: 1.0, delay: 0.3 + i * 0.1, ease: [0, 0, 0.2, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 活動タイプ ドーナツチャート */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-bold mb-5">活動タイプ分布</h2>
              <DonutChart
                sourcing={data.sourcing_vs_handson.sourcing}
                handson={data.sourcing_vs_handson.handson}
                operations={data.sourcing_vs_handson.operations}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-4"
            >
              <p className="text-xs text-genome-muted">
                ⚠ このデータはデモ用のサンプルデータです。実際のGoogleカレンダー連携は準備中です。
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
