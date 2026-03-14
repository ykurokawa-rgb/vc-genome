'use client'
import { useState } from 'react'

export default function BetaBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-genome-accent/30 bg-genome-card/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs border border-genome-accent text-genome-accent px-2 py-0.5 rounded-full font-mono">β</span>
          <p className="text-sm text-genome-muted">
            VC Genome はベータ版です。フィードバックは
            <a href="mailto:feedback@startpass.jp" className="text-genome-accent hover:underline ml-1">
              feedback@startpass.jp
            </a>
            へ。
          </p>
        </div>
        <button onClick={() => setVisible(false)} className="text-genome-muted hover:text-genome-text text-xs ml-4 shrink-0">
          ✕ 閉じる
        </button>
      </div>
    </div>
  )
}
