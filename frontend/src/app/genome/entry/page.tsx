'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GenomeEntryPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    affiliation: '',
    urls: [''],
    philosophy: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const addUrl = () => setForm(f => ({ ...f, urls: [...f.urls, ''] }))
  const updateUrl = (i: number, val: string) => {
    const urls = [...form.urls]
    urls[i] = val
    setForm(f => ({ ...f, urls }))
  }
  const removeUrl = (i: number) => {
    const urls = form.urls.filter((_, idx) => idx !== i)
    setForm(f => ({ ...f, urls }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.affiliation) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/genome/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.jobId) {
        router.push(`/genome/scanning/${data.jobId}`)
      }
    } catch (err) {
      console.error(err)
      setIsLoading(false)
    }
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
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 border border-genome-accent/30 bg-genome-accent/10 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm text-genome-accent font-mono">STEP 1 / 3</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">ゲノム解析を開始する</h1>
            <p className="text-genome-muted">名前と所属を入力するだけで、AIがあなたの投資DNAを解析します</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-genome-text mb-2">
                  お名前 <span className="text-genome-red text-xs">必須</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="例: 山田 太郎"
                  className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-genome-text mb-2">
                  所属VC / 役職 <span className="text-genome-red text-xs">必須</span>
                </label>
                <input
                  type="text"
                  value={form.affiliation}
                  onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))}
                  placeholder="例: ABC Ventures / General Partner"
                  className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-genome-text mb-2">
                  公開情報URL <span className="text-genome-muted text-xs">任意・複数可</span>
                </label>
                <p className="text-xs text-genome-muted mb-3">note・X・LinkedIn・インタビュー記事などのURLを追加するほど精度が向上します</p>
                <div className="space-y-2">
                  {form.urls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={e => updateUrl(i, e.target.value)}
                        placeholder="https://note.com/..."
                        className="flex-1 bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors text-sm"
                      />
                      {form.urls.length > 1 && (
                        <button type="button" onClick={() => removeUrl(i)}
                          className="px-3 py-3 border border-genome-border rounded-xl text-genome-muted hover:text-genome-red hover:border-genome-red transition-colors">
                          ✕
                        </button>
                      )}
                    </div>
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

              <div>
                <label className="block text-sm font-medium text-genome-text mb-2">
                  投資哲学を一言で <span className="text-genome-muted text-xs">任意</span>
                </label>
                <textarea
                  value={form.philosophy}
                  onChange={e => setForm(f => ({ ...f, philosophy: e.target.value }))}
                  placeholder="例: シードの兄貴分。起業家の熱量を信じて、ロジックで守る。"
                  rows={3}
                  className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors resize-none text-sm"
                />
              </div>
            </div>

            {/* Google Calendar CTA */}
            <div className="glass rounded-2xl p-5 border border-genome-accent/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <div className="font-medium mb-1 flex items-center gap-2">
                    Googleカレンダー連携
                    <span className="text-xs bg-genome-accent/20 text-genome-accent px-2 py-0.5 rounded-full">精度 +15%</span>
                  </div>
                  <p className="text-sm text-genome-muted mb-3">
                    行動ベースのリアルなフォーカス領域が追加されます。<br />
                    カレンダーデータはサーバーに保存されません。
                  </p>
                  <button type="button" className="text-sm text-genome-accent hover:underline">
                    Googleカレンダーを連携する →
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!form.name || !form.affiliation || isLoading}
              className="w-full bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] glow flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  解析を開始中...
                </>
              ) : (
                <>
                  🧬 ゲノムを解析する
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
