'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STEPS = [
  {
    icon: '🧬',
    title: 'VC Genomeへようこそ',
    desc: 'AIがWebの公開情報を自動収集し、キャピタリストの投資DNAを可視化するプラットフォームです。',
    cta: null,
  },
  {
    icon: '🤖',
    title: '4体のAIエージェントが稼働',
    desc: '実績・哲学・伴走スタイル・信頼性を専門エージェントが並列解析。名前を入れるだけで30秒で完成します。',
    cta: null,
  },
  {
    icon: '🎯',
    title: '起業家との相性を可視化',
    desc: '起業家側もピッチ情報を入れることで、最適なキャピタリストとのシンクロ率が算出されます。',
    cta: null,
  },
  {
    icon: '✦',
    title: 'さっそく始めましょう',
    desc: 'あなたはキャピタリストですか？それとも投資家を探している起業家ですか？',
    cta: 'select',
  },
]

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem('vcgenome_onboarded')
    if (!seen) {
      setTimeout(() => setVisible(true), 800)
    }
  }, [])

  const finish = () => {
    localStorage.setItem('vcgenome_onboarded', '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={finish} />

      {/* Modal */}
      <div className="relative glass rounded-3xl p-8 max-w-md w-full border border-genome-accent/30 shadow-2xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-genome-accent w-6' : 'bg-genome-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{current.icon}</div>
          <h2 className="text-xl font-bold mb-3">{current.title}</h2>
          <p className="text-genome-muted text-sm leading-relaxed">{current.desc}</p>
        </div>

        {/* CTA */}
        {isLast ? (
          <div className="space-y-3">
            <Link
              href="/genome/entry"
              onClick={finish}
              className="flex items-center justify-center gap-2 w-full bg-genome-accent hover:bg-genome-accent-hover text-white font-bold py-3 rounded-xl transition-colors"
            >
              🧬 キャピタリストとして登録する
            </Link>
            <Link
              href="/match/discover"
              onClick={finish}
              className="flex items-center justify-center gap-2 w-full border border-genome-border hover:border-genome-accent/50 text-genome-text py-3 rounded-xl transition-colors text-sm"
            >
              🔍 起業家として投資家を探す
            </Link>
            <button onClick={finish} className="w-full text-xs text-genome-muted hover:text-genome-text transition-colors py-2">
              スキップ
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={finish}
              className="flex-1 border border-genome-border text-genome-muted hover:text-genome-text py-3 rounded-xl transition-colors text-sm"
            >
              スキップ
            </button>
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 bg-genome-accent hover:bg-genome-accent-hover text-white font-bold py-3 rounded-xl transition-colors"
            >
              次へ →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
