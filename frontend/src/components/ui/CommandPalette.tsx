'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── コマンド定義 ─────────────────────────────────────────────────────────────

interface Command {
  id:       string
  label:    string
  sub?:     string
  icon:     string
  href:     string
  category: string
  keywords?: string[]
}

const COMMANDS: Command[] = [
  { id: 'discover',  label: '投資家を探す',          icon: '🔍', href: '/match/discover',  category: 'ページ移動', keywords: ['discover', 'vc', '検索'] },
  { id: 'simulator', label: '相性シミュレーター',     icon: '🎯', href: '/match/simulator', category: 'ページ移動', keywords: ['match', 'simulator', '相性'] },
  { id: 'entry',     label: 'VCゲノムを新規作成',    icon: '🧬', href: '/genome/entry',    category: 'ページ移動', keywords: ['entry', '作成', '新規'] },
  { id: 'list',      label: '解析済みゲノム一覧',    icon: '📋', href: '/genome/list',     category: 'ページ移動', keywords: ['list', '一覧'] },
  { id: 'home',      label: 'ホームに戻る',          icon: '🏠', href: '/',                category: 'ページ移動', keywords: ['home', 'top'] },
]

const DEMO_VCS: Command[] = [
  { id: 'vc-001', label: '木下慶彦', sub: 'ANRI',                icon: '👤', href: '/genome/vc-001', category: 'VC', keywords: ['kinoshita', 'anri', 'saas'] },
  { id: 'vc-002', label: '赤浦徹',   sub: 'インキュベイトファンド', icon: '👤', href: '/genome/vc-002', category: 'VC', keywords: ['akaura', 'seed'] },
  { id: 'vc-003', label: '渡辺洋行', sub: 'Coral Capital',       icon: '👤', href: '/genome/vc-003', category: 'VC', keywords: ['watanabe', 'coral', 'global'] },
  { id: 'vc-004', label: '宮田拓弥', sub: 'Scrum Ventures',      icon: '👤', href: '/genome/vc-004', category: 'VC', keywords: ['miyata', 'scrum', 'silicon'] },
  { id: 'vc-005', label: '孫泰蔵',   sub: 'Mistletoe',           icon: '👤', href: '/genome/vc-005', category: 'VC', keywords: ['son', 'mistletoe', 'deep'] },
  { id: 'demo-1', label: '田中 健一', sub: 'Alpha Ventures',     icon: '👤', href: '/genome/demo-1', category: 'VC', keywords: ['tanaka', 'alpha', 'ai'] },
  { id: 'demo-2', label: '佐藤 美咲', sub: 'Horizon Capital',    icon: '👤', href: '/genome/demo-2', category: 'VC', keywords: ['sato', 'horizon', 'healthcare'] },
  { id: 'demo-3', label: '鈴木 大輔', sub: 'Frontier Fund',      icon: '👤', href: '/genome/demo-3', category: 'VC', keywords: ['suzuki', 'frontier', 'deep'] },
]

const ALL_COMMANDS = [...COMMANDS, ...DEMO_VCS]

// ─── コマンドパレット ─────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open,        setOpen]        = useState(false)
  const [query,       setQuery]       = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  // Cmd+K / Ctrl+K トグル
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // 開いたらフォーカス
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = query.trim()
    ? ALL_COMMANDS.filter(c => {
        const q = query.toLowerCase()
        return (
          c.label.toLowerCase().includes(q) ||
          c.sub?.toLowerCase().includes(q) ||
          c.keywords?.some(k => k.includes(q))
        )
      })
    : COMMANDS // デフォルト: ナビゲーションのみ

  const navigate = useCallback((href: string) => {
    router.push(href)
    setOpen(false)
    setQuery('')
  }, [router])

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      navigate(results[selectedIdx].href)
    }
  }

  // クエリ変更でインデックスリセット
  useEffect(() => setSelectedIdx(0), [query])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* バックドロップ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal"
            onClick={() => setOpen(false)}
          />

          {/* パレット本体 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 w-full max-w-xl z-modal glass rounded-2xl border border-genome-accent/25 overflow-hidden shadow-glow-lg"
            onKeyDown={handleKeyDown}
          >
            {/* 検索入力 */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-genome-border">
              <span className="text-genome-muted text-lg">🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="VCを検索、またはコマンドを入力..."
                className="flex-1 bg-transparent text-genome-text placeholder-genome-muted focus:outline-none text-sm"
              />
              <kbd className="text-[10px] text-genome-muted border border-genome-border px-1.5 py-0.5 rounded font-mono shrink-0">
                Esc
              </kbd>
            </div>

            {/* 結果リスト */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm text-genome-muted">「{query}」は見つかりませんでした</p>
                </div>
              ) : (
                <>
                  {/* カテゴリグループ */}
                  {(['ページ移動', 'VC'] as const).map(cat => {
                    const items = results.filter(r => r.category === cat)
                    if (items.length === 0) return null
                    const globalOffset = results.filter(r => r.category === 'ページ移動' && cat === 'VC').length
                    return (
                      <div key={cat} className="mb-1">
                        <p className="text-[10px] text-genome-muted font-mono uppercase tracking-wider px-3 py-1.5">
                          {cat}
                        </p>
                        {items.map((item) => {
                          const idx = results.indexOf(item)
                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => navigate(item.href)}
                              whileHover={{ backgroundColor: 'rgba(108,99,255,0.08)' }}
                              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                                selectedIdx === idx
                                  ? 'bg-genome-accent/12 border border-genome-accent/20'
                                  : ''
                              }`}
                            >
                              <span className="text-base shrink-0">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-genome-text">{item.label}</p>
                                {item.sub && (
                                  <p className="text-xs text-genome-muted truncate">{item.sub}</p>
                                )}
                              </div>
                              <span className="text-[10px] text-genome-muted border border-genome-border px-2 py-0.5 rounded-full shrink-0 font-mono">
                                {item.category}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* フッター */}
            <div className="px-5 py-2.5 border-t border-genome-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-genome-muted font-mono">↑↓ 移動</span>
                <span className="text-[10px] text-genome-muted font-mono">Enter で開く</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="text-[10px] text-genome-muted border border-genome-border px-1.5 py-0.5 rounded font-mono">
                  ⌘K
                </kbd>
                <span className="text-[10px] text-genome-muted">でトグル</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
