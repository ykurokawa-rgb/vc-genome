'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'input' | 'scanning' | 'result'

interface MatchReason {
  category: string
  score: number
  explanation: string
}

interface VCResult {
  vc_id: string
  vc_name: string
  vc_affiliation: string
  vc_alias: string
  vc_radar: Record<string, number>
  match_score: number
  match_reasons: MatchReason[]
  summary: string
  caution: string | null
}

const DOMAINS = [
  'SaaS / B2B',
  'AI / ML',
  'FinTech',
  'HR Tech',
  'Healthcare / MedTech',
  'Deep Tech',
  'Consumer / D2C',
  'Web3 / Crypto',
  'EdTech',
  'ClimaTech',
  'その他',
]

const PHASES = ['Seed', 'Pre-A', 'Series A', 'Series B+']

const NEEDS_OPTIONS = [
  '採用支援',
  '営業導入',
  '海外展開',
  'メンタルケア',
  'PR / ブランディング',
  '資金調達支援',
  '技術アドバイス',
  '事業開発',
]

const SCAN_LOGS = [
  'VCゲノムデータベースを初期化しています...',
  '木下慶彦（ANRI）のゲノムを解析中...',
  'スタートアッププロファイルと照合しています...',
  '赤浦徹（インキュベイトファンド）を解析中...',
  'フェーズ適合度を計算しています...',
  '渡辺洋行（Coral Capital）を解析中...',
  '領域マッチングを実行しています...',
  '宮田拓弥（Scrum Ventures）を解析中...',
  '伴走スタイルの相性を評価中...',
  '孫泰蔵（Mistletoe）を解析中...',
  '経営者タイプとの親和性を算出しています...',
  'スコアを集計しています...',
  'ランキングを生成しています...',
  '解析完了。結果を準備しています...',
]

function ScoreBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const color = score >= 80 ? '#00D48A' : score >= 60 ? '#F0C040' : '#6C63FF'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-genome-muted">マッチスコア</span>
      </div>
      <div className="h-2.5 bg-genome-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.1, delay, ease: [0, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

export default function SimulatorPage() {
  const [step, setStep] = useState<Step>('input')
  const [domain, setDomain] = useState('')
  const [phase, setPhase] = useState('')
  const [summary, setSummary] = useState('')
  const [needs, setNeeds] = useState<string[]>([])
  const [logicRatio, setLogicRatio] = useState(50)
  const [boldRatio, setBoldRatio] = useState(50)
  const [scanLogs, setScanLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<VCResult[]>([])
  const [error, setError] = useState('')
  const [jobId, setJobId] = useState('')
  const logRef = useRef<HTMLDivElement>(null)

  const toggleNeed = (need: string) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    )
  }

  const handleSubmit = async () => {
    if (!domain || !phase || !summary) {
      setError('事業ドメイン、フェーズ、事業概要は必須です')
      return
    }
    setError('')
    setStep('scanning')
    setScanLogs([])
    setProgress(0)

    try {
      const res = await fetch('/api/match/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_domain: domain,
          phase,
          summary,
          needs,
          founder_logic_ratio: logicRatio,
          founder_bold_ratio: boldRatio,
        }),
      })
      const data = await res.json()
      setJobId(data.jobId)
    } catch {
      setError('送信に失敗しました。もう一度お試しください。')
      setStep('input')
    }
  }

  // Poll job status + animate logs
  useEffect(() => {
    if (step !== 'scanning' || !jobId) return

    let logIndex = 0
    const logInterval = setInterval(() => {
      if (logIndex < SCAN_LOGS.length) {
        setScanLogs((prev) => [...prev, SCAN_LOGS[logIndex]])
        logIndex++
        setTimeout(() => {
          logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
        }, 50)
      }
    }, 1400)

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/match/simulate/${jobId}`)
        const data = await res.json()
        setProgress(data.progress ?? 0)
        if (data.status === 'completed') {
          clearInterval(poll)
          clearInterval(logInterval)
          setResults(data.results ?? [])
          setProgress(100)
          setTimeout(() => setStep('result'), 800)
        }
      } catch {
        // ignore transient errors
      }
    }, 2000)

    return () => {
      clearInterval(poll)
      clearInterval(logInterval)
    }
  }, [step, jobId])

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* Nav */}
      <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
              VG
            </div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/match/discover"
              className="text-sm text-genome-muted hover:text-genome-text transition-colors"
            >
              投資家を探す
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {(['input', 'scanning', 'result'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    step === s
                      ? 'border-genome-accent bg-genome-accent text-white'
                      : step === 'result' || (step === 'scanning' && i === 0)
                      ? 'border-genome-green bg-genome-green/20 text-genome-green'
                      : 'border-genome-border text-genome-muted'
                  }`}
                >
                  {(step === 'result' && i < 2) || (step === 'scanning' && i === 0) ? '✓' : i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-16 h-0.5 transition-all ${
                      (step === 'scanning' && i === 0) || step === 'result'
                        ? 'bg-genome-accent'
                        : 'bg-genome-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ───── STEP 1: INPUT FORM ───── */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  <span className="text-genome-accent">相性シミュレーター</span>
                </h1>
                <p className="text-genome-muted">
                  あなたのスタートアップ情報を入力し、最適なVCを見つけましょう
                </p>
              </div>

              {error && (
                <div className="glass border border-genome-red/40 rounded-xl px-4 py-3 text-genome-red text-sm">
                  {error}
                </div>
              )}

              {/* Domain */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-genome-accent text-sm uppercase tracking-wider">
                  01 — 事業情報
                </h2>
                <div>
                  <label className="block text-sm text-genome-muted mb-1.5">
                    事業ドメイン <span className="text-genome-red">*</span>
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-2.5 text-genome-text focus:outline-none focus:border-genome-accent transition-colors text-sm"
                  >
                    <option value="">選択してください</option>
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-genome-muted mb-1.5">
                    フェーズ <span className="text-genome-red">*</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PHASES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPhase(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          phase === p
                            ? 'border-genome-accent bg-genome-accent/20 text-genome-accent'
                            : 'border-genome-border text-genome-muted hover:border-genome-accent/50 hover:text-genome-text'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-genome-muted mb-1.5">
                    事業概要 <span className="text-genome-red">*</span>
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    placeholder="例：中小企業向けのAI搭載経費精算SaaSです。申請から承認まで90%自動化し、月次決算を3日から1日に短縮します。"
                    className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-2.5 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors text-sm resize-none"
                  />
                </div>
              </div>

              {/* Needs */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-genome-accent text-sm uppercase tracking-wider">
                  02 — VCへの期待
                </h2>
                <div className="flex flex-wrap gap-2">
                  {NEEDS_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => toggleNeed(n)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        needs.includes(n)
                          ? 'border-genome-accent bg-genome-accent/20 text-genome-accent'
                          : 'border-genome-border text-genome-muted hover:border-genome-accent/40'
                      }`}
                    >
                      {needs.includes(n) ? '✓ ' : ''}{n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality sliders */}
              <div className="glass rounded-2xl p-6 space-y-6">
                <h2 className="font-bold text-genome-accent text-sm uppercase tracking-wider">
                  03 — 経営者の性格
                </h2>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-genome-muted">感情的</span>
                    <span className="text-genome-text font-mono">
                      論理性 <span className="text-genome-accent">{logicRatio}%</span>
                    </span>
                    <span className="text-genome-muted">論理的</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={logicRatio}
                    onChange={(e) => setLogicRatio(Number(e.target.value))}
                    className="w-full accent-genome-accent"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-genome-muted">慎重</span>
                    <span className="text-genome-text font-mono">
                      大胆性 <span className="text-genome-accent">{boldRatio}%</span>
                    </span>
                    <span className="text-genome-muted">大胆</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={boldRatio}
                    onChange={(e) => setBoldRatio(Number(e.target.value))}
                    className="w-full accent-genome-accent"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-genome-accent hover:bg-genome-accent-hover text-white font-bold rounded-2xl transition-all text-lg glow hover:scale-[1.02]"
              >
                相性を解析する →
              </button>
            </div>
          )}

          {/* ───── STEP 2: SCANNING ───── */}
          {step === 'scanning' && (
            <div className="text-center space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">AIが相性を解析中...</h1>
                <p className="text-genome-muted text-sm">
                  5名のVCゲノムとスタートアップ情報を照合しています
                </p>
              </div>

              {/* Animated ring */}
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full border-4 border-genome-border" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-genome-accent transition-all duration-500"
                    style={{
                      clipPath: `inset(0 ${100 - progress}% 0 0 round 9999px)`,
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-mono text-genome-accent">
                      {Math.round(progress)}%
                    </span>
                    <span className="text-xs text-genome-muted">解析中</span>
                  </div>
                  {/* Rotating dot */}
                  <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: '3s' }}
                  >
                    <div className="w-3 h-3 bg-genome-accent rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 glow" />
                  </div>
                </div>
              </div>

              {/* Agent logs */}
              <div
                ref={logRef}
                className="glass rounded-2xl p-4 h-48 overflow-y-auto text-left font-mono text-xs space-y-1.5"
              >
                {scanLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-genome-green shrink-0">{'>'}</span>
                    <span className={i === scanLogs.length - 1 ? 'text-genome-text' : 'text-genome-muted'}>
                      {log}
                    </span>
                  </div>
                ))}
                {scanLogs.length > 0 && (
                  <div className="flex items-center gap-1 text-genome-accent">
                    <span>{'>'}</span>
                    <span className="animate-pulse">█</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───── STEP 3: RESULTS ───── */}
          {step === 'result' && (
            <div className="space-y-6">
              {/* ヘッダー */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="text-5xl mb-3"
                >
                  🎯
                </motion.div>
                <h1 className="text-2xl font-bold mb-1">相性診断 完了</h1>
                <p className="text-genome-muted text-sm">
                  AIが {results.length} 名のVCとの相性を算出しました
                </p>
              </motion.div>

              {/* 結果カード（スタガーアニメーション） */}
              {results.map((vc, rank) => (
                <motion.div
                  key={vc.vc_id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: rank * 0.12, type: 'spring', stiffness: 260, damping: 24 }}
                  className={`glass rounded-2xl p-6 space-y-4 ${
                    rank === 0 ? 'border-genome-gold/40 glow-gold' : 'hover:border-genome-accent/30 transition-colors'
                  }`}
                >
                  {/* ランク + ヘッダー */}
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: rank * 0.12 + 0.15, type: 'spring', stiffness: 300 }}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                        rank === 0
                          ? 'bg-genome-gold/20 text-genome-gold border border-genome-gold/40'
                          : rank === 1
                          ? 'bg-genome-muted/10 text-genome-text border border-genome-border'
                          : 'bg-genome-card text-genome-muted border border-genome-border'
                      }`}
                    >
                      {rank === 0 ? '👑' : rank + 1}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg">{vc.vc_name}</span>
                        <span className="text-genome-muted text-sm">{vc.vc_affiliation}</span>
                        {rank === 0 && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs bg-genome-gold/20 text-genome-gold border border-genome-gold/40 px-2 py-0.5 rounded-full"
                          >
                            ベストマッチ
                          </motion.span>
                        )}
                      </div>
                      <div className="text-genome-gold text-sm font-mono mt-0.5">
                        ✦ {vc.vc_alias}
                      </div>
                    </div>
                  </div>

                  {/* マッチスコアバー */}
                  <ScoreBar score={vc.match_score} delay={rank * 0.12 + 0.2} />

                  {/* マッチ理由（ミニバー付き） */}
                  {vc.match_reasons.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {vc.match_reasons.slice(0, 4).map((r, i) => {
                        const color = r.score >= 80 ? '#00D48A' : r.score >= 60 ? '#F0C040' : '#6B6B80'
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rank * 0.12 + 0.25 + i * 0.05 }}
                            className="bg-genome-card/50 rounded-lg px-3 py-2.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-genome-muted truncate">{r.category}</span>
                              <span className="text-xs font-mono font-bold shrink-0" style={{ color }}>
                                {r.score}
                              </span>
                            </div>
                            <div className="h-1 bg-genome-border rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${r.score}%` }}
                                transition={{ duration: 0.8, delay: rank * 0.12 + 0.35 + i * 0.05 }}
                              />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  {/* サマリー */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rank * 0.12 + 0.3 }}
                    className="bg-genome-card/60 rounded-xl px-4 py-3"
                  >
                    <p className="text-sm text-genome-text leading-relaxed">
                      <span className="text-genome-accent font-medium">なぜ相性が良いのか：</span>{' '}
                      {vc.summary}
                    </p>
                  </motion.div>

                  {/* 注意 */}
                  {vc.caution && (
                    <div className="flex items-start gap-2 text-xs text-genome-gold bg-genome-gold/5 border border-genome-gold/20 rounded-lg px-3 py-2">
                      <span className="shrink-0">⚠</span>
                      <span>{vc.caution}</span>
                    </div>
                  )}

                  {/* アクション */}
                  <div className="flex gap-3 pt-1">
                    <Link
                      href={`/genome/${vc.vc_id}`}
                      className="flex-1 text-center py-2.5 text-sm border border-genome-accent text-genome-accent rounded-xl hover:bg-genome-accent/10 transition-colors"
                    >
                      ゲノムを見る
                    </Link>
                    <Link
                      href={`/genome/${vc.vc_id}/shadow-chat`}
                      className="flex-1 text-center py-2.5 text-sm bg-genome-accent hover:bg-genome-accent-hover text-white rounded-xl transition-colors"
                    >
                      AIチャットで質問する
                    </Link>
                  </div>
                </motion.div>
              ))}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: results.length * 0.12 + 0.2 }}
                onClick={() => {
                  setStep('input')
                  setResults([])
                  setJobId('')
                  setScanLogs([])
                  setProgress(0)
                }}
                className="w-full py-3 border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40 rounded-2xl text-sm transition-colors"
              >
                もう一度診断する
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
