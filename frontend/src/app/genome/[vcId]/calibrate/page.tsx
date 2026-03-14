'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CalibratePage() {
  const params = useParams()
  const vcId = params.vcId as string

  const [feedback, setFeedback] = useState({
    accuracy: 0,
    corrections: '',
    additionalUrls: [''],
  })
  const [submitted, setSubmitted] = useState(false)

  const addUrl = () => setFeedback(f => ({ ...f, additionalUrls: [...f.additionalUrls, ''] }))
  const updateUrl = (i: number, val: string) => {
    const urls = [...feedback.additionalUrls]
    urls[i] = val
    setFeedback(f => ({ ...f, additionalUrls: urls }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: POST to /api/genome/{vcId}/calibrate
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-genome-dark flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-3">フィードバックを受け付けました</h1>
          <p className="text-genome-muted mb-8">
            いただいた情報をもとに、AIエージェントが再解析を行います。
            通常24時間以内に反映されます。
          </p>
          <Link
            href={`/genome/${vcId}`}
            className="bg-genome-accent hover:bg-genome-accent-hover text-white px-6 py-3 rounded-xl transition-colors inline-block"
          >
            プロフィールに戻る
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* Nav */}
      <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">VG</div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <Link href={`/genome/${vcId}`} className="text-sm text-genome-muted hover:text-genome-text transition-colors">
            ← プロフィールに戻る
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 border border-genome-gold/30 bg-genome-gold/10 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm text-genome-gold font-mono">キャリブレーション</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">プロフィールを修正する</h1>
            <p className="text-genome-muted text-sm">
              AIの解析結果に誤りがある場合、フィードバックをお送りください。<br />
              追加URLを提供することで精度が向上します。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Accuracy Rating */}
            <div className="glass rounded-2xl p-6">
              <label className="block text-sm font-medium text-genome-text mb-4">
                現在のプロフィールの精度は？
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFeedback(f => ({ ...f, accuracy: n }))}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      feedback.accuracy === n
                        ? 'bg-genome-accent border-genome-accent text-white'
                        : 'border-genome-border text-genome-muted hover:border-genome-accent hover:text-genome-accent'
                    }`}
                  >
                    {n === 1 ? '😞' : n === 2 ? '😕' : n === 3 ? '😐' : n === 4 ? '🙂' : '😄'}
                    <div className="text-xs mt-1">
                      {n === 1 ? '全く違う' : n === 2 ? '一部違う' : n === 3 ? '普通' : n === 4 ? 'だいたい合' : '完璧'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Corrections */}
            <div className="glass rounded-2xl p-6">
              <label className="block text-sm font-medium text-genome-text mb-2">
                修正してほしい内容 <span className="text-genome-muted text-xs">任意</span>
              </label>
              <textarea
                value={feedback.corrections}
                onChange={e => setFeedback(f => ({ ...f, corrections: e.target.value }))}
                placeholder="例：投資先数は実際には35社ではなく42社です。フィンテック領域のウェイトが低すぎます。"
                rows={4}
                className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors resize-none text-sm"
              />
            </div>

            {/* Additional URLs */}
            <div className="glass rounded-2xl p-6">
              <label className="block text-sm font-medium text-genome-text mb-2">
                追加URL <span className="text-genome-muted text-xs">任意</span>
              </label>
              <p className="text-xs text-genome-muted mb-3">
                より正確な情報が載っているURLを教えてください
              </p>
              <div className="space-y-2">
                {feedback.additionalUrls.map((url, i) => (
                  <input
                    key={i}
                    type="url"
                    value={url}
                    onChange={e => updateUrl(i, e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors text-sm"
                  />
                ))}
                <button
                  type="button"
                  onClick={addUrl}
                  className="w-full border border-dashed border-genome-border rounded-xl py-2 text-sm text-genome-muted hover:border-genome-accent hover:text-genome-accent transition-colors"
                >
                  + URLを追加
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-genome-accent hover:bg-genome-accent-hover text-white font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] glow"
            >
              フィードバックを送信する
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
