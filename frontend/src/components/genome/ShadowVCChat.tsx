'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ShadowVCChatProps {
  vcName: string
  vcAlias: string
  genomeData: Record<string, unknown>
}

function buildGenomeSummary(vcName: string, vcAlias: string, genomeData: Record<string, unknown>): string {
  const basic = genomeData.basic_info as Record<string, unknown> | undefined
  const stats = genomeData.genome_stats as Record<string, unknown> | undefined
  const footprint = genomeData.investment_footprint as Record<string, unknown> | undefined
  const handsOn = genomeData.hands_on_dna as Record<string, unknown> | undefined

  const affil = basic?.current_affiliation ?? ''
  const philosophies = (stats?.core_philosophies as Array<{ title?: string; description?: string }> | undefined)
    ?.map((p) => p.title ?? '')
    .filter(Boolean)
    .join('、') ?? ''
  const sectors = (footprint?.top_sectors as Array<{ sector: string }> | undefined)
    ?.map((s) => s.sector)
    .join('、') ?? ''
  const supports = (handsOn?.specific_supports as Array<{ area?: string }> | undefined)
    ?.map((s) => s.area ?? '')
    .filter(Boolean)
    .join('、') ?? ''

  return `
名前: ${vcName}（${affil}）
二つ名: ${vcAlias}
コアフィロソフィー: ${philosophies || '不明'}
得意領域: ${sectors || '不明'}
伴走スタイル: ${supports || '不明'}
`.trim()
}

export default function ShadowVCChat({ vcName, vcAlias, genomeData }: ShadowVCChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `こんにちは。私は${vcName}のAIシミュレーションです。投資・事業に関するご相談をお気軽にどうぞ。（AIシミュレーション）`,
        },
      ])
    }
  }, [open, messages.length, vcName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const genomeSummary = buildGenomeSummary(vcName, vcAlias, genomeData)
      const res = await fetch('/api/genome/shadow-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          genomeSummary,
          vcName,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content ?? '申し訳ありません。応答できませんでした。' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '通信エラーが発生しました。もう一度お試しください。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-genome-accent hover:bg-genome-accent-hover text-white px-5 py-3 rounded-2xl shadow-lg glow transition-all hover:scale-105 font-medium text-sm"
      >
        <span className="text-base">🤖</span>
        Shadow VCに相談する
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 z-50 flex flex-col glass border-l border-genome-border transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-genome-border shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-genome-green animate-pulse" />
              <span className="font-bold text-sm">Shadow VC — {vcName}</span>
            </div>
            <div className="text-xs text-genome-gold font-mono mt-0.5">✦ {vcAlias}</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-genome-muted hover:text-genome-text transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-genome-gold/5 border-b border-genome-gold/20 shrink-0">
          <p className="text-xs text-genome-gold">
            ⚠ これはAIによるシミュレーションです。実際の{vcName}氏の発言ではありません。
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-genome-accent/20 border border-genome-accent/40 flex items-center justify-center text-xs mr-2 shrink-0 mt-0.5">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-genome-accent text-white rounded-tr-sm'
                    : 'bg-genome-card border border-genome-border text-genome-text rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-genome-accent/20 border border-genome-accent/40 flex items-center justify-center text-xs mr-2 shrink-0 mt-0.5">
                🤖
              </div>
              <div className="bg-genome-card border border-genome-border px-3 py-2.5 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 bg-genome-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-genome-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-genome-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-genome-border shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="相談内容を入力してください..."
              className="flex-1 bg-genome-dark border border-genome-border rounded-xl px-3 py-2.5 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors text-sm resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-genome-accent hover:bg-genome-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors text-sm font-medium shrink-0"
            >
              送信
            </button>
          </div>
          <p className="text-xs text-genome-muted mt-1.5">
            Shift+Enter で改行 / Enter で送信
          </p>
        </div>
      </div>
    </>
  )
}
