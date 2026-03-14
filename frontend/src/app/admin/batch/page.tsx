'use client'

import { useState } from 'react'

interface BatchItem {
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  level?: string
}

const STATUS_LABELS: Record<BatchItem['status'], string> = {
  pending: '待機中',
  running: '解析中...',
  completed: '完了',
  error: 'エラー',
}

const STATUS_COLORS: Record<BatchItem['status'], string> = {
  pending: 'text-genome-muted',
  running: 'text-genome-accent',
  completed: 'text-genome-green',
  error: 'text-genome-red',
}

export default function BatchPage() {
  const [input, setInput] = useState('')
  const [items, setItems] = useState<BatchItem[]>([])
  const [running, setRunning] = useState(false)

  const handleStart = async () => {
    const names = input
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)

    if (names.length === 0) return

    const initial: BatchItem[] = names.map((name) => ({
      name,
      status: 'pending',
      progress: 0,
    }))
    setItems(initial)
    setRunning(true)

    // Simulate batch processing
    for (let i = 0; i < initial.length; i++) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: 'running', progress: 0 } : item
        )
      )

      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 300))
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, progress: p } : item
          )
        )
      }

      // Mark completed with random level
      const levels = ['A', 'A-', 'B+', 'B', 'C']
      const level = levels[Math.floor(Math.random() * levels.length)]
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: 'completed', progress: 100, level } : item
        )
      )
    }

    setRunning(false)
  }

  const handleReset = () => {
    setItems([])
    setInput('')
    setRunning(false)
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">一括解析</h1>
        <p className="text-genome-muted text-sm mt-1">
          複数のVC名を一括でゲノム解析します
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-sm text-genome-accent uppercase tracking-wider">
            解析対象リスト
          </h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            disabled={running}
            placeholder={`VC名を1行1人で入力してください\n例：\n木下慶彦\n赤浦徹\n渡辺洋行`}
            className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors text-sm resize-none font-mono disabled:opacity-50"
          />
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              disabled={running || !input.trim()}
              className="flex-1 py-3 bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
            >
              {running ? '解析中...' : '一括解析開始'}
            </button>
            <button
              onClick={handleReset}
              disabled={running}
              className="px-4 py-3 border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40 disabled:opacity-40 rounded-xl transition-colors text-sm"
            >
              リセット
            </button>
          </div>
          {input.trim() && (
            <p className="text-xs text-genome-muted">
              {input.split('\n').filter((l) => l.trim()).length} 件を解析します
            </p>
          )}
        </div>

        {/* Progress list */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-sm text-genome-accent uppercase tracking-wider mb-4">
            解析ステータス
          </h2>
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-genome-muted text-sm">
              左のフォームに名前を入力して解析を開始してください
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-96">
              {items.map((item, i) => (
                <div key={i} className="bg-genome-card/60 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {item.status === 'running' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-genome-accent animate-pulse" />
                      )}
                      {item.status === 'completed' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-genome-green" />
                      )}
                      {item.status === 'pending' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-genome-muted" />
                      )}
                      {item.status === 'error' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-genome-red" />
                      )}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.level && (
                        <span className="text-xs font-mono text-genome-gold border border-genome-gold/40 px-1.5 py-0.5 rounded-full">
                          {item.level}
                        </span>
                      )}
                      <span className={`text-xs ${STATUS_COLORS[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                  </div>
                  {item.status === 'running' && (
                    <div className="h-1 bg-genome-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-genome-accent rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === 'completed' && (
                    <div className="h-1 bg-genome-green/20 rounded-full overflow-hidden">
                      <div className="h-full bg-genome-green rounded-full w-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && !running && (
            <div className="mt-4 pt-4 border-t border-genome-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-genome-muted">完了</span>
                <span className="text-genome-green font-mono">
                  {items.filter((i) => i.status === 'completed').length} / {items.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
