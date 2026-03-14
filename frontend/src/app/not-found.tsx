'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useGenomeStore } from '@/store/useGenomeStore'

// ─── クイックリンク ────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { href: '/',               label: 'トップへ',      icon: '🏠', desc: 'ランディングページ' },
  { href: '/genome/list',    label: 'ゲノム一覧',    icon: '🧬', desc: '解析済みVCプロフィール' },
  { href: '/match/discover', label: '投資家を探す',  icon: '🎯', desc: 'マッチングディスカバー' },
  { href: '/genome/entry',   label: '新規解析',      icon: '✦',  desc: 'ゲノム解析を開始する' },
]

// ─── 幾何学アバター（最近閲覧用）──────────────────────────────────────────────

function MiniAvatar({ id, name }: { id: string; name: string }) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i)
  const hue = Math.abs(h) % 360

  return (
    <div
      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white text-sm font-bold border border-white/10"
      style={{ background: `linear-gradient(135deg, hsl(${hue},65%,45%), hsl(${(hue + 40) % 360},70%,35%))` }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────

export default function NotFound() {
  const recentlyViewed = useGenomeStore(s => s.recentlyViewed)

  return (
    <main className="min-h-screen bg-genome-dark flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full">

        {/* ── ヘッダー ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-[80px] font-black text-genome-border/30 font-mono leading-none mb-2 select-none">
            404
          </p>
          <div className="text-5xl mb-5">🧬</div>
          <h1 className="text-2xl font-bold mb-2">ゲノムが見つかりません</h1>
          <p className="text-genome-muted text-sm leading-relaxed">
            このURLのプロフィールは存在しないか、まだ解析中です。
          </p>
        </motion.div>

        {/* ── クイックリンク ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {QUICK_LINKS.map(({ href, label, icon, desc }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 300 }}
            >
              <Link
                href={href}
                className="glass rounded-xl p-4 flex flex-col gap-1.5 hover:border-genome-accent/50 transition-all group h-full"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium group-hover:text-genome-accent transition-colors">{label}</span>
                <span className="text-xs text-genome-muted">{desc}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── 最近閲覧したゲノム ── */}
        {recentlyViewed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-5"
          >
            <p className="text-xs text-genome-muted mb-4 uppercase tracking-widest font-mono">
              最近閲覧したゲノム
            </p>
            <div className="space-y-2">
              {recentlyViewed.slice(0, 4).map((vc) => (
                <Link
                  key={vc.vcId}
                  href={`/genome/${vc.vcId}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-genome-card transition-colors group"
                >
                  <MiniAvatar id={vc.vcId} name={vc.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-genome-accent transition-colors truncate">
                      {vc.name}
                    </p>
                    <p className="text-xs text-genome-muted truncate">{vc.affiliation}</p>
                  </div>
                  <span className="text-xs text-genome-muted shrink-0">→</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── フッターメッセージ ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-genome-muted mt-8"
        >
          問題が解決しない場合は
          <a href="mailto:support@startpass.jp" className="text-genome-accent hover:underline mx-1">
            support@startpass.jp
          </a>
          までご連絡ください
        </motion.p>
      </div>
    </main>
  )
}
