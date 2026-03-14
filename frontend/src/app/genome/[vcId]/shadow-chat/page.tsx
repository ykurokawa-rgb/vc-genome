'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface Message {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  timestamp: Date
}

interface GenomeData {
  basic_info?: {
    name?:                 string
    current_affiliation?:  string
    ai_generated_alias?:   string
  }
  genome_stats?: {
    core_philosophies?: { tag: string; evidence_quote: string }[]
    keywords?:          string[]
  }
  hands_on_dna?: {
    intervention_style?: string
    reputation_vibe?:    string
  }
  investment_footprint?: {
    top_sectors?: { sector: string; percentage: number }[]
  }
}

// ─── ゲノムサマリー構築 ───────────────────────────────────────────────────────

function buildGenomeSummary(genome: GenomeData): string {
  const name    = genome.basic_info?.name ?? ''
  const affil   = genome.basic_info?.current_affiliation ?? ''
  const style   = genome.hands_on_dna?.intervention_style ?? ''
  const vibe    = genome.hands_on_dna?.reputation_vibe ?? ''
  const sectors = genome.investment_footprint?.top_sectors ?? []
  const phils   = genome.genome_stats?.core_philosophies ?? []
  const kw      = genome.genome_stats?.keywords ?? []

  return [
    `名前: ${name}（${affil}）`,
    `投資スタイル: ${style}`,
    `主要領域: ${sectors.slice(0, 3).map(s => `${s.sector}(${s.percentage}%)`).join(', ')}`,
    `哲学: ${phils.slice(0, 2).map(p => `「${p.tag}」- ${p.evidence_quote}`).join(' / ')}`,
    `評判キーワード: ${vibe}`,
    `関連キーワード: ${kw.slice(0, 8).join(', ')}`,
  ].join('\n')
}

// ─── サジェスト質問 ───────────────────────────────────────────────────────────

function buildSuggestions(genome: GenomeData): string[] {
  const sectors = genome.investment_footprint?.top_sectors ?? []
  const phils   = genome.genome_stats?.core_philosophies ?? []
  const s1      = sectors[0]?.sector ?? 'スタートアップ'
  const p1      = phils[0]?.tag ?? '起業家支援'

  return [
    `${s1}分野に投資する際、最も重視するポイントは何ですか？`,
    `「${p1}」という哲学はどのように生まれましたか？`,
    `初回の起業家面談で必ず確認していることを教えてください。`,
    `投資後のハンズオン支援で特に力を入れている領域は何ですか？`,
    `今の日本のスタートアップエコシステムに感じている課題は何ですか？`,
  ]
}

// ─── ミニアバター ─────────────────────────────────────────────────────────────

function MiniAvatar({ vcId, name }: { vcId: string; name: string }) {
  let h = 0
  for (let i = 0; i < vcId.length; i++) h = (Math.imul(31, h) + vcId.charCodeAt(i)) | 0
  const seed = Math.abs(h)
  const hue  = seed % 360

  return (
    <div
      className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 select-none"
      style={{
        borderColor: `hsla(${hue}, 60%, 50%, 0.5)`,
        background:  `linear-gradient(135deg, hsl(${hue}, 70%, 28%), hsl(${(hue + 60) % 360}, 65%, 22%))`,
        color:       `hsl(${hue}, 90%, 80%)`,
      }}
    >
      {name.charAt(0)}
    </div>
  )
}

// ─── タイピングインジケーター ──────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-genome-accent rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function ShadowChatPage() {
  const params = useParams()
  const vcId   = params.vcId as string

  const [genome,    setGenome]    = useState<GenomeData | null>(null)
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [msgCount,  setMsgCount]  = useState(0)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textaRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch(`/api/genome/${vcId}`)
      .then(r => r.json())
      .then(setGenome)
      .catch(console.error)
  }, [vcId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const vcName  = genome?.basic_info?.name ?? ''
  const alias   = genome?.basic_info?.ai_generated_alias ?? ''
  const affil   = genome?.basic_info?.current_affiliation ?? ''
  const suggestions = genome ? buildSuggestions(genome) : []

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !genome || isTyping) return
    setError(null)

    const userMsg: Message = {
      id:        `u-${Date.now()}`,
      role:      'user',
      content:   text.trim(),
      timestamp: new Date(),
    }

    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setIsTyping(true)
    setMsgCount(c => c + 1)

    try {
      const res = await fetch('/api/genome/shadow-chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages:      next.map(m => ({ role: m.role, content: m.content })),
          genomeSummary: buildGenomeSummary(genome),
          vcName,
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      setMessages(prev => [...prev, {
        id:        `a-${Date.now()}`,
        role:      'assistant',
        content:   data.content ?? '（返答を取得できませんでした）',
        timestamp: new Date(),
      }])
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsTyping(false)
    }
  }, [genome, messages, isTyping, vcName])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="space-y-4">
      {/* ─── 警告バナー ─── */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 glass rounded-xl px-4 py-3 border border-genome-gold/25"
      >
        <span className="text-genome-gold shrink-0 mt-0.5 text-sm">⚠</span>
        <p className="text-xs text-genome-muted leading-relaxed">
          このチャットは{vcName && <strong className="text-genome-text">「{vcName}」</strong>}のゲノムデータに基づく
          <strong className="text-genome-text"> AIシミュレーション</strong>です。
          実際のキャピタリストとのコミュニケーションではありません。返答内容は情報提供目的のみです。
        </p>
      </motion.div>

      {/* ─── ペルソナヘッダー ─── */}
      <AnimatePresence>
        {genome && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 flex items-center gap-4"
          >
            <MiniAvatar vcId={vcId} name={vcName} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">{vcName}</span>
                <span className="text-xs bg-genome-green/15 text-genome-green px-2 py-0.5 rounded-full border border-genome-green/30 font-mono">
                  AIペルソナ稼働中
                </span>
              </div>
              {alias && (
                <p className="text-xs text-genome-gold font-mono mt-0.5">✦ {alias}</p>
              )}
              <p className="text-xs text-genome-muted mt-0.5 truncate">{affil}</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-2.5 h-2.5 bg-genome-green rounded-full shrink-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── チャット本体 ─── */}
      <div className="glass rounded-2xl overflow-hidden border border-genome-border">
        {/* メッセージエリア */}
        <div className="h-[440px] overflow-y-auto p-5 space-y-4">
          {/* 初期プレースホルダー */}
          <AnimatePresence>
            {messages.length === 0 && !isTyping && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center h-full text-center py-10"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-5xl mb-5"
                >
                  💬
                </motion.div>
                <h3 className="font-bold mb-2">
                  {genome ? `${vcName}のAIペルソナに質問する` : 'ゲノムデータを読み込み中...'}
                </h3>
                <p className="text-sm text-genome-muted max-w-xs leading-relaxed">
                  ゲノムデータから構築されたAIペルソナが、投資哲学・伴走スタイルについてリアルタイムに答えます。
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* メッセージ一覧 */}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* アバター */}
              {msg.role === 'assistant' ? (
                genome && <MiniAvatar vcId={vcId} name={vcName} />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-genome-accent/15 border border-genome-accent/30 flex items-center justify-center text-xs font-bold text-genome-accent shrink-0">
                  You
                </div>
              )}

              {/* バブル */}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-genome-accent/15 border border-genome-accent/30 text-genome-text rounded-tr-sm'
                    : 'glass border border-genome-border rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* タイピングインジケーター */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex gap-3"
              >
                {genome && <MiniAvatar vcId={vcId} name={vcName} />}
                <div className="glass rounded-2xl border border-genome-border rounded-tl-sm">
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* エラー */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-genome-red text-center py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* 区切り */}
        <div className="border-t border-genome-border" />

        {/* 入力エリア */}
        <div className="p-4">
          <div className="flex gap-3">
            <textarea
              ref={textaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={genome ? `${vcName}に質問する...` : '読み込み中...'}
              disabled={!genome || isTyping}
              rows={2}
              className="flex-1 bg-genome-dark border border-genome-border rounded-xl px-4 py-2.5 text-sm text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors resize-none disabled:opacity-40"
            />
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || !genome || isTyping}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="self-end bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm"
            >
              送信
            </motion.button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-genome-muted">Enter で送信 · Shift+Enter で改行</p>
            {msgCount > 0 && (
              <p className="text-xs text-genome-muted font-mono">{msgCount}往復</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── サジェスト質問（初回のみ） ─── */}
      <AnimatePresence>
        {messages.length === 0 && genome && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs text-genome-muted mb-3 font-mono">// よく聞かれる質問から選ぶ</p>
            <div className="space-y-2">
              {suggestions.map((q, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  onClick={() => sendMessage(q)}
                  disabled={isTyping}
                  whileHover={{ x: 4 }}
                  className="w-full text-left text-sm glass rounded-xl px-4 py-3 border border-genome-border hover:border-genome-accent/40 hover:text-genome-text text-genome-muted transition-all disabled:opacity-40"
                >
                  <span className="text-genome-accent mr-2 font-mono">Q.</span>
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── リセット ─── */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <button
            onClick={() => { setMessages([]); setError(null); setMsgCount(0) }}
            className="text-xs text-genome-muted hover:text-genome-text transition-colors border border-genome-border hover:border-genome-accent/30 px-5 py-2 rounded-full"
          >
            会話をリセット
          </button>
        </motion.div>
      )}
    </div>
  )
}
