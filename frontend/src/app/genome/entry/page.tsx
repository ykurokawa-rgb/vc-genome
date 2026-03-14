'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp, fadeIn, staggerContainer } from '@/lib/motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name:        string
  affiliation: string
  urls:        string[]
  philosophy:  string
  calendarLinked: boolean
}

const STORAGE_KEY = 'vcgenome_entry_draft'

const INITIAL_FORM: FormData = {
  name:        '',
  affiliation: '',
  urls:        [''],
  philosophy:  '',
  calendarLinked: false,
}

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: '基本情報',  icon: '👤', desc: 'お名前と所属を入力' },
  { id: 2, label: '公開URL',   icon: '🔗', desc: '参照する情報源を追加' },
  { id: 3, label: '哲学・自己紹介', icon: '💡', desc: '投資スタイルをAIに伝える' },
  { id: 4, label: '確認',      icon: '✓',  desc: '内容を確認して送信' },
]

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full">
      {/* Step dots */}
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((s, i) => {
          const done    = step > s.id
          const active  = step === s.id
          return (
            <div key={s.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    backgroundColor: done ? '#00D48A' : active ? '#6C63FF' : '#1E1E2E',
                    borderColor:     done ? '#00D48A' : active ? '#6C63FF' : '#1E1E2E',
                    scale:           active ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                >
                  {done ? '✓' : s.icon}
                </motion.div>
                <span className={`text-xs hidden sm:block ${active ? 'text-genome-accent' : 'text-genome-muted'}`}>
                  {s.label}
                </span>
              </div>
              {i < total - 1 && (
                <div className="flex-1 h-px mx-2 relative overflow-hidden bg-genome-border">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-genome-accent"
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall bar */}
      <div className="h-1 bg-genome-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-genome-accent rounded-full"
          animate={{ width: `${((step - 1) / (total - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

function Step1({ form, onChange }: { form: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeInUp}>
        <label className="block text-sm font-medium text-genome-text mb-2">
          お名前 <span className="text-genome-red text-xs ml-1">必須</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="例: 山田 太郎"
          autoFocus
          className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent focus:shadow-glow-sm transition-all"
          required
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <label className="block text-sm font-medium text-genome-text mb-2">
          所属VC / 役職 <span className="text-genome-red text-xs ml-1">必須</span>
        </label>
        <input
          type="text"
          value={form.affiliation}
          onChange={(e) => onChange({ affiliation: e.target.value })}
          placeholder="例: ABC Ventures / General Partner"
          className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent focus:shadow-glow-sm transition-all"
          required
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-4 border border-genome-accent/15">
        <div className="flex gap-2 items-start">
          <span className="text-genome-accent text-xl mt-0.5">🧬</span>
          <div>
            <p className="text-sm font-medium mb-1">名前だけでも高精度に解析できます</p>
            <p className="text-xs text-genome-muted leading-relaxed">
              次のステップで公開URLを追加すると、さらに精度が向上します。
              会社名や役職が変わった場合も後から修正できます。
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Step 2: URLs ─────────────────────────────────────────────────────────────

const URL_PRESETS = [
  { icon: '📝', label: 'note',        placeholder: 'https://note.com/...' },
  { icon: '🐦', label: 'X (Twitter)', placeholder: 'https://x.com/...' },
  { icon: '💼', label: 'LinkedIn',    placeholder: 'https://linkedin.com/in/...' },
  { icon: '📰', label: 'インタビュー記事', placeholder: 'https://...' },
]

function Step2({ form, onChange }: { form: FormData; onChange: (d: Partial<FormData>) => void }) {
  const addUrl    = () => onChange({ urls: [...form.urls, ''] })
  const updateUrl = (i: number, val: string) => {
    const urls = [...form.urls]
    urls[i] = val
    onChange({ urls })
  }
  const removeUrl = (i: number) => onChange({ urls: form.urls.filter((_, idx) => idx !== i) })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <p className="text-sm text-genome-muted mb-4 leading-relaxed">
          note・X・LinkedIn・インタビュー記事などのURLを追加するほど、AIの解析精度が向上します。
          <span className="text-genome-green ml-1">（任意・スキップ可）</span>
        </p>
      </motion.div>

      {/* URL presets */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-2 mb-4">
        {URL_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              if (!form.urls.some((u) => u === '')) {
                addUrl()
              }
            }}
            className="flex items-center gap-2 border border-genome-border rounded-lg px-3 py-2 text-xs text-genome-muted hover:border-genome-accent/50 hover:text-genome-text transition-colors"
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </motion.div>

      {/* URL inputs */}
      <motion.div variants={fadeInUp} className="space-y-2">
        <AnimatePresence initial={false}>
          {form.urls.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2"
            >
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(i, e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-all text-sm"
              />
              {form.urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(i)}
                  className="w-10 h-auto border border-genome-border rounded-xl text-genome-muted hover:text-genome-red hover:border-genome-red/50 transition-colors text-lg"
                >
                  ✕
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={addUrl}
          className="w-full border border-dashed border-genome-border rounded-xl py-2.5 text-sm text-genome-muted hover:border-genome-accent hover:text-genome-accent transition-colors"
        >
          + URLをさらに追加
        </button>
      </motion.div>

      {/* Google Calendar */}
      <motion.div variants={fadeInUp} className="glass rounded-xl p-4 border border-genome-accent/20 mt-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">📅</span>
          <div className="flex-1">
            <div className="font-medium text-sm mb-1 flex items-center gap-2">
              Googleカレンダー連携
              <span className="text-xs bg-genome-accent/20 text-genome-accent px-2 py-0.5 rounded-full">精度 +15%</span>
            </div>
            <p className="text-xs text-genome-muted mb-3 leading-relaxed">
              行動ベースのリアルなフォーカス領域が追加されます。データはサーバーに保存されません。
            </p>
            <button
              type="button"
              onClick={() => onChange({ calendarLinked: !form.calendarLinked })}
              className={`text-sm transition-colors ${form.calendarLinked ? 'text-genome-green' : 'text-genome-accent hover:underline'}`}
            >
              {form.calendarLinked ? '✓ 連携済み' : 'Googleカレンダーを連携する →'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Step 3: Philosophy ───────────────────────────────────────────────────────

const PHILOSOPHY_EXAMPLES = [
  'シードの兄貴分。起業家の熱量を信じて、ロジックで守る。',
  '技術の本質を見極め、10年後も価値を持つ事業にしか投資しない。',
  '起業家が最初に連絡してくる投資家でありたい。',
  'B2B SaaS × AI の掛け算に確信を持っている。',
]

function Step3({ form, onChange }: { form: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeInUp}>
        <label className="block text-sm font-medium text-genome-text mb-2">
          投資哲学を一言で
          <span className="text-genome-muted text-xs ml-2">任意・AIが参考にします</span>
        </label>
        <textarea
          value={form.philosophy}
          onChange={(e) => onChange({ philosophy: e.target.value })}
          placeholder="例: シードの兄貴分。起業家の熱量を信じて、ロジックで守る。"
          rows={4}
          className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-all resize-none text-sm leading-relaxed"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-genome-muted">{form.philosophy.length} / 200</span>
        </div>
      </motion.div>

      {/* Example chips */}
      <motion.div variants={fadeInUp}>
        <p className="text-xs text-genome-muted mb-2">入力例（クリックで挿入）</p>
        <div className="space-y-2">
          {PHILOSOPHY_EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange({ philosophy: ex })}
              className="w-full text-left text-xs border border-genome-border rounded-lg px-3 py-2 text-genome-muted hover:border-genome-accent/50 hover:text-genome-text transition-colors leading-relaxed"
            >
              &ldquo;{ex}&rdquo;
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="glass rounded-xl p-4 border border-genome-border">
        <div className="flex gap-2 items-start">
          <span className="text-genome-accent text-lg">💡</span>
          <p className="text-xs text-genome-muted leading-relaxed">
            入力しなくてもAIが公開情報から投資哲学を推定します。
            入力した場合は、AIがそれを参考にしてより精度の高い解析を行います。
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────

function Step4({ form, onEdit }: { form: FormData; onEdit: (step: number) => void }) {
  const validUrls = form.urls.filter((u) => u.trim())

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.p variants={fadeInUp} className="text-sm text-genome-muted mb-2">
        以下の情報でゲノム解析を開始します。
      </motion.p>

      {[
        {
          step: 1,
          label: '基本情報',
          icon: '👤',
          content: (
            <div className="space-y-1">
              <p className="font-medium">{form.name}</p>
              <p className="text-sm text-genome-muted">{form.affiliation}</p>
            </div>
          ),
        },
        {
          step: 2,
          label: '公開URL',
          icon: '🔗',
          content: validUrls.length > 0 ? (
            <div className="space-y-1">
              {validUrls.map((url, i) => (
                <p key={i} className="text-sm text-genome-accent font-mono truncate">{url}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-genome-muted">なし（スキップ）</p>
          ),
        },
        {
          step: 3,
          label: '投資哲学',
          icon: '💡',
          content: form.philosophy ? (
            <p className="text-sm italic text-genome-text">&ldquo;{form.philosophy}&rdquo;</p>
          ) : (
            <p className="text-sm text-genome-muted">AIが自動推定します</p>
          ),
        },
      ].map(({ step, label, icon, content }) => (
        <motion.div
          key={step}
          variants={fadeInUp}
          className="glass rounded-xl p-4 flex items-start gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-genome-card border border-genome-border flex items-center justify-center text-sm shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-genome-muted mb-1">{label}</p>
            {content}
          </div>
          <button
            type="button"
            onClick={() => onEdit(step)}
            className="text-xs text-genome-muted hover:text-genome-accent transition-colors shrink-0 opacity-0 group-hover:opacity-100"
          >
            修正
          </button>
        </motion.div>
      ))}

      {form.calendarLinked && (
        <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm text-genome-green">
          <span>✓</span> Googleカレンダー連携済み（精度 +15%）
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="glass rounded-xl p-4 border border-genome-accent/20">
        <div className="flex items-start gap-2">
          <span className="text-genome-accent">🧬</span>
          <div>
            <p className="text-sm font-medium mb-1">解析は約30〜60秒で完了します</p>
            <p className="text-xs text-genome-muted">4体のAIエージェントが並列稼働し、Web上の情報を自律収集します。</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GenomeEntryPage() {
  const router    = useRouter()
  const [step,    setStep]    = useState(1)
  const [form,    setForm]    = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setForm(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  // Persist draft to localStorage
  const updateForm = useCallback((data: Partial<FormData>) => {
    setForm((prev) => {
      const next = { ...prev, ...data }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const canAdvance = () => {
    if (step === 1) return form.name.trim() && form.affiliation.trim()
    return true
  }

  const goNext = () => {
    if (step < STEPS.length) setStep((s) => s + 1)
  }

  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/genome/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (data.jobId || data.job_id) {
        localStorage.removeItem(STORAGE_KEY)
        router.push(`/genome/scanning/${data.jobId ?? data.job_id}`)
      } else {
        throw new Error('job_idが返されませんでした')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  const currentStep = STEPS[step - 1]

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* Nav */}
      <nav className="border-b border-genome-border glass-strong fixed top-0 left-0 right-0 z-sticky">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">VG</div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <span className="text-xs text-genome-muted font-mono">STEP {step} / {STEPS.length}</span>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center mb-10"
          >
            <motion.div variants={fadeInUp} className="text-4xl mb-4">{currentStep.icon}</motion.div>
            <motion.h1 variants={fadeInUp} className="text-2xl font-bold mb-2">
              {step === 1 ? 'ゲノム解析を開始する' : currentStep.label}
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-genome-muted text-sm">{currentStep.desc}</motion.p>
          </motion.div>

          {/* Progress */}
          <div className="mb-8">
            <ProgressBar step={step} total={STEPS.length} />
          </div>

          {/* Step content */}
          <div className="glass rounded-2xl p-6 mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              >
                {step === 1 && <Step1 form={form} onChange={updateForm} />}
                {step === 2 && <Step2 form={form} onChange={updateForm} />}
                {step === 3 && <Step3 form={form} onChange={updateForm} />}
                {step === 4 && <Step4 form={form} onEdit={setStep} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-4 p-3 bg-genome-red/10 border border-genome-red/30 rounded-xl text-sm text-genome-red"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="flex-1 border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40 py-3.5 rounded-xl font-medium transition-all"
              >
                ← 戻る
              </button>
            )}

            {step < STEPS.length ? (
              <motion.button
                type="button"
                onClick={goNext}
                disabled={!canAdvance()}
                whileHover={canAdvance() ? { scale: 1.02 } : {}}
                whileTap={canAdvance() ? { scale: 0.98 } : {}}
                className="flex-1 bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-glow-sm hover:shadow-glow"
              >
                次へ →
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="flex-1 bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      ⟳
                    </motion.span>
                    解析を開始中...
                  </>
                ) : (
                  <>🧬 ゲノムを解析する</>
                )}
              </motion.button>
            )}
          </div>

          {/* Draft indicator */}
          {(form.name || form.affiliation) && step === 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-genome-muted mt-4"
            >
              下書きを自動保存しています
            </motion.p>
          )}
        </div>
      </div>
    </main>
  )
}
