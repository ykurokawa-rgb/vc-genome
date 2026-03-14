'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface Support {
  type:           string
  score:          number
  description:    string
  evidence_count?: number
}

interface GenomeData {
  basic_info?:    { name?: string }
  hands_on_dna?: {
    specific_supports?:          Support[]
    reputation_vibe?:            string
    crisis_behavior?:            string
    weekly_interaction_simulation?: string
  }
  genome_stats?: { keywords?: string[] }
}

// ─── 疑似レビューメッセージ ───────────────────────────────────────────────────

const REVIEW_MESSAGES: Record<string, string> = {
  Recruiting:  '採用面接のサポートが非常に手厚く、CXO候補の紹介まで自ら動いてくれました。',
  Sales_Intro: '大手への営業リードを複数紹介していただき、初年度の売上に直結しました。',
  Mental:      'ダウンラウンドの際も最後まで一緒に考えてくれた。投資家として信頼できる方です。',
  Finance:     '次のラウンドに向けた投資家紹介から条件交渉まで徹底的に伴走してくれました。',
  PR:          '登壇の機会をいくつかセットしていただき、認知度向上に大きく貢献しました。',
}

// ─── 星レーティング ───────────────────────────────────────────────────────────

function StarRating({ score, delay = 0 }: { score: number; delay?: number }) {
  const [filled, setFilled] = useState(0)
  const target = Math.round(score / 2)

  useEffect(() => {
    const t = setTimeout(() => setFilled(target), delay * 1000 + 300)
    return () => clearTimeout(t)
  }, [target, delay])

  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, j) => (
        <motion.span
          key={j}
          initial={{ scale: 0.5, opacity: 0.3 }}
          animate={{ scale: j < filled ? 1 : 0.8, opacity: j < filled ? 1 : 0.3 }}
          transition={{ delay: delay + j * 0.06, type: 'spring', stiffness: 300 }}
          className={j < filled ? 'text-genome-gold text-sm' : 'text-genome-border text-sm'}
        >
          ★
        </motion.span>
      ))}
    </div>
  )
}

// ─── アニメーションバー ───────────────────────────────────────────────────────

function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  return (
    <div className="h-2 bg-genome-border rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.0, delay, ease: [0, 0, 0.2, 1] }}
      />
    </div>
  )
}

// ─── ウィークリーターミナル ───────────────────────────────────────────────────

function WeeklyTerminal({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(t); setDone(true) }
    }, 18)
    return () => clearInterval(t)
  }, [text])

  return (
    <div className="bg-genome-dark rounded-xl p-4 border border-genome-border font-mono text-sm leading-relaxed">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-genome-red/60" />
        <div className="w-3 h-3 rounded-full bg-genome-gold/60" />
        <div className="w-3 h-3 rounded-full bg-genome-green/60" />
        <span className="text-xs text-genome-muted ml-2">weekly_simulation.txt</span>
      </div>
      <p className="text-genome-text">
        {displayed}
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-0.5 h-4 bg-genome-accent align-middle ml-0.5"
          />
        )}
      </p>
    </div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function ReputationPage() {
  const params = useParams()
  const vcId   = params.vcId as string

  const [genome,  setGenome]  = useState<GenomeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/genome/${vcId}`)
      .then(r => r.json())
      .then((d) => { setGenome(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [vcId])

  const handson  = genome?.hands_on_dna ?? {}
  const supports: Support[] = handson.specific_supports ?? []
  const vibe:    string     = handson.reputation_vibe ?? ''
  const crisis:  string     = handson.crisis_behavior ?? ''
  const weekly:  string     = handson.weekly_interaction_simulation ?? ''
  const keywords: string[]  = genome?.genome_stats?.keywords ?? []

  const vibeItems = vibe
    ? vibe.split(/[・\/、,]/).map(v => v.trim()).filter(Boolean)
    : keywords.slice(0, 8)

  const positiveKeywords = ['誠実', '丁寧', '熱心', '速い', '支援', '信頼', '採用', '本気', '寄り添う', 'ハンズオン']
  const positiveCount   = keywords.filter(k => positiveKeywords.some(p => k.includes(p))).length
  const positiveRatio   = keywords.length > 0
    ? Math.min(96, 68 + Math.round((positiveCount / keywords.length) * 30))
    : 80
  const neutralRatio    = Math.round((100 - positiveRatio) * 0.68)
  const negativeRatio   = 100 - positiveRatio - neutralRatio

  const reputationCards = supports
    .filter(s => s.score >= 6)
    .map(s => ({
      type:       s.type,
      score:      s.score,
      message:    REVIEW_MESSAGES[s.type] ?? `${s.description}の面での支援が印象的でした。`,
      isPositive: s.score >= 7,
    }))

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer h-40 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── 感情分析サマリー ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="font-bold text-lg mb-6">Founder&apos;s Voice — 評判分析</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 感情スコアバー */}
          <div className="space-y-4">
            <p className="text-sm text-genome-muted">感情分析スコア</p>
            {[
              { label: 'ポジティブ', value: positiveRatio,  color: '#00D48A', delay: 0 },
              { label: 'ニュートラル', value: neutralRatio,  color: '#6B6B80', delay: 0.1 },
              { label: 'ネガティブ', value: negativeRatio,   color: '#FF4D6A', delay: 0.2 },
            ].map(({ label, value, color, delay }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color }}>{label}</span>
                  <span className="font-mono text-genome-text">{value}%</span>
                </div>
                <AnimatedBar value={value} color={color} delay={delay} />
              </div>
            ))}
          </div>

          {/* 印象タグ */}
          <div className="md:col-span-2">
            <p className="text-sm text-genome-muted mb-3">起業家からの印象キーワード</p>
            <div className="flex flex-wrap gap-2">
              {vibeItems.map((v, i) => (
                <motion.span
                  key={v}
                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 300 }}
                  className="text-sm border border-genome-accent/40 bg-genome-accent/10 text-genome-accent px-3 py-1 rounded-full"
                >
                  {v}
                </motion.span>
              ))}
            </div>

            {/* 総評スコアゲージ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 p-4 bg-genome-dark rounded-xl border border-genome-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-genome-muted">総合評判スコア</span>
                <span className="font-mono text-genome-green font-bold">{positiveRatio}点</span>
              </div>
              <div className="h-3 bg-genome-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00D48A, #6C63FF)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${positiveRatio}%` }}
                  transition={{ duration: 1.4, delay: 0.4, ease: [0, 0, 0.2, 1] }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ─── 危機時の行動 ─── */}
      {crisis && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5 border border-genome-gold/20"
        >
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <span className="text-genome-gold text-lg">⚡</span>
            危機時のスタイル
          </h2>
          <p className="text-sm text-genome-muted leading-relaxed">{crisis}</p>
        </motion.div>
      )}

      {/* ─── 週次シミュレーション（タイプライター） ─── */}
      {weekly && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 border border-genome-accent/20"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <span>📅</span>
            投資後の月曜日（週次シミュレーション）
          </h2>
          <WeeklyTerminal text={weekly} />
          <p className="text-xs text-genome-muted mt-3">
            ※ AIによるシミュレーションです。実際のコミュニケーションは個人差があります。
          </p>
        </motion.div>
      )}

      {/* ─── 起業家からの声 ─── */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="font-bold mb-4"
        >
          伴走実績ベースの評判
        </motion.h2>

        {reputationCards.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-genome-muted">
            伴走実績データの収集中です
          </div>
        ) : (
          <div className="space-y-4">
            {reputationCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`glass rounded-xl p-5 border transition-colors hover:border-genome-accent/20 ${
                  card.isPositive ? 'border-genome-green/20' : 'border-genome-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.1, type: 'spring', stiffness: 300 }}
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                      card.isPositive
                        ? 'bg-genome-green/20 text-genome-green border border-genome-green/30'
                        : 'bg-genome-border text-genome-muted'
                    }`}
                  >
                    {card.isPositive ? '✓' : '○'}
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs border border-genome-border px-2 py-0.5 rounded-full text-genome-muted">
                        {card.type}
                      </span>
                      <StarRating score={card.score} delay={0.35 + i * 0.1} />
                    </div>
                    <blockquote className="text-sm text-genome-text italic leading-relaxed">
                      ❝ {card.message} ❞
                    </blockquote>
                    <p className="text-xs text-genome-muted mt-2">
                      AI解析によるシミュレーション（伴走スコア: {card.score}/10 に基づく）
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 免責 ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-xl p-4 border border-genome-border"
      >
        <p className="text-xs text-genome-muted leading-relaxed">
          ⚠ このページの評判データはAIによる公開情報の解析と伴走スタイル分析に基づいて生成されています。
          実際の起業家の証言とは異なる場合があります。
          より正確な情報はキャピタリスト本人の
          <a href={`/genome/${vcId}/calibrate`} className="text-genome-accent hover:underline">
            キャリブレーション
          </a>
          によって更新されます。
        </p>
      </motion.div>
    </div>
  )
}
