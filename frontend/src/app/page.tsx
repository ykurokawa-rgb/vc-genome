'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { staggerContainer, fadeInUp, listItem } from '@/lib/motion'
import { useCountUp, useScrollReveal } from '@/hooks/useAnimation'
import OnboardingModal from '@/components/onboarding/OnboardingModal'

// ─── Particle Background ─────────────────────────────────────────────────────

function ParticleField() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x:        15 + Math.sin(i * 2.4) * 40 + Math.cos(i * 1.3) * 35,
    y:        10 + Math.cos(i * 1.8) * 40 + Math.sin(i * 2.1) * 35,
    size:     1.2 + (i % 4) * 0.8,
    duration: 7 + (i % 5) * 2,
    delay:    (i % 6) * 1.1,
    opacity:  0.08 + (i % 5) * 0.04,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-genome-accent"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -20, 0], opacity: [p.opacity, p.opacity * 3, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-72"
        style={{ background: 'linear-gradient(to top, rgba(108,99,255,0.07) 0%, transparent 100%)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─── Animated Stat ────────────────────────────────────────────────────────────

function AnimatedStat({ to, label, unit }: { to: number; label: string; unit: string }) {
  const { value, ref } = useCountUp({ to, duration: 1.8 })
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-genome-accent font-mono tabular">
        {value.toLocaleString()}<span className="text-lg">{unit}</span>
      </div>
      <div className="text-sm text-genome-muted mt-1">{label}</div>
    </div>
  )
}

// ─── Genome Preview Card ──────────────────────────────────────────────────────

function GenomePreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0, 0, 0.2, 1] }}
      className="glass rounded-2xl p-5 border border-genome-accent/25 shadow-glow-sm max-w-xs w-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-genome-accent/15 border border-genome-accent/30 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="7" r="4" fill="#6C63FF" opacity="0.7"/>
            <path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#6C63FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">山田 太郎</div>
          <div className="text-xs text-genome-muted truncate">Example Ventures / GP</div>
        </div>
        <span className="text-xs bg-genome-green/15 text-genome-green border border-genome-green/30 px-2 py-0.5 rounded-full font-mono shrink-0">A</span>
      </div>

      <div className="text-genome-gold text-xs font-mono mb-3">✦ ディープテック番人</div>

      <div className="space-y-2 mb-4">
        {[{ label: '戦略性', v: 82 }, { label: 'ネットワーク', v: 90 }, { label: '専門性', v: 88 }].map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="text-[10px] text-genome-muted w-16 shrink-0">{r.label}</span>
            <div className="flex-1 h-1.5 bg-genome-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-genome-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${r.v}%` }}
                transition={{ duration: 1.2, delay: 0.9, ease: [0, 0, 0.2, 1] }}
              />
            </div>
            <span className="text-[10px] font-mono text-genome-accent w-5 text-right">{r.v}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[{ l: '投資先', v: '42社' }, { l: 'Exit', v: '3件' }, { l: '信頼度', v: 'A' }].map((s) => (
          <div key={s.l} className="bg-genome-dark rounded-lg p-2 text-center">
            <div className="text-sm font-bold">{s.v}</div>
            <div className="text-[10px] text-genome-muted">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {['SaaS / B2B', 'DeepTech', 'Seed'].map((t) => (
          <span key={t} className="text-[10px] border border-genome-accent/30 bg-genome-accent/10 text-genome-accent px-1.5 py-0.5 rounded-full">{t}</span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-genome-border">
        <div className="w-1.5 h-1.5 bg-genome-green rounded-full animate-pulse" />
        <span className="text-[10px] text-genome-muted font-mono">AIが解析中 — 12ソース参照</span>
      </div>
    </motion.div>
  )
}

// ─── Persona CTA ──────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    icon: '🧬',
    tag: 'キャピタリスト',
    title: '自分のゲノムを生成する',
    desc: '名前と所属だけでOK。AIが公開情報から投資DNAを解析・プロフィール化します。',
    href: '/genome/entry',
    accent: true,
  },
  {
    icon: '🔍',
    tag: '起業家',
    title: '相性のいいVCを探す',
    desc: 'スタートアップ情報を入力するだけで、マッチ率の高いVCを自動ランキング表示します。',
    href: '/match/discover',
    accent: false,
  },
  {
    icon: '📊',
    tag: 'リサーチャー',
    title: 'VCデータベースを探索する',
    desc: '日本VC業界のゲノムデータを横断検索・比較分析。業界レポートの作成を支援します。',
    href: '/genome/list',
    accent: false,
  },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 70])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const { ref: statsRef,  isVisible: statsVisible  } = useScrollReveal({ threshold: 0.3 })
  const { ref: howRef,    isVisible: howVisible    } = useScrollReveal({ threshold: 0.1 })
  const { ref: agentsRef, isVisible: agentsVisible } = useScrollReveal({ threshold: 0.1 })

  const [activePersona, setActivePersona] = useState(0)

  return (
    <main className="min-h-screen bg-genome-dark overflow-x-hidden">
      <OnboardingModal />

      {/* ─── Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-sticky border-b border-genome-border glass-strong">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              VG
            </motion.div>
            <span className="font-bold text-genome-text">VC Genome</span>
            <span className="text-xs text-genome-muted ml-2 border border-genome-border px-2 py-0.5 rounded-full hidden sm:inline">
              by StartPass
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/genome/entry"  className="text-sm text-genome-muted hover:text-genome-text transition-colors hidden md:block">キャピタリスト</Link>
            <Link href="/match/discover" className="text-sm text-genome-muted hover:text-genome-text transition-colors hidden md:block">起業家</Link>
            <Link href="/auth/login"    className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-all hover:shadow-glow-sm">
              ログイン
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative pt-32 pb-28 px-6 min-h-[92vh] flex items-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(108,99,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <ParticleField />
        <div className="absolute top-20 left-1/4 w-[28rem] h-[28rem] bg-genome-accent/8 rounded-full blur-[80px]" />
        <div className="absolute top-48 right-1/4 w-64 h-64 bg-purple-600/8 rounded-full blur-[60px]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 border border-genome-accent/30 bg-genome-accent/10 rounded-full px-4 py-1.5 mb-8">
                <div className="w-2 h-2 bg-genome-green rounded-full animate-pulse" />
                <span className="text-sm text-genome-accent font-mono">AI Agents ONLINE — 12体稼働中</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-bold mb-6 leading-[1.1]">
                日本のVC業界に、
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #6C63FF 0%, #4DA6FF 50%, #C084FC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  解像度革命
                </span>
                を。
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg text-genome-muted mb-3 leading-relaxed">
                あなたの投資DNAは、すでにWebに刻まれている。
              </motion.p>
              <motion.p variants={fadeInUp} className="text-base text-genome-muted mb-10 leading-relaxed">
                AIがそれを読み解き、世界最高精度の<br className="hidden md:block" />
                キャピタリストプロフィールを自動生成する。
              </motion.p>

              {/* Persona selector */}
              <motion.div variants={fadeInUp} className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {PERSONAS.map((p, i) => (
                    <button
                      key={p.tag}
                      onClick={() => setActivePersona(i)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                        activePersona === i
                          ? 'border-genome-accent bg-genome-accent/20 text-genome-accent'
                          : 'border-genome-border text-genome-muted hover:border-genome-accent/40'
                      }`}
                    >
                      {p.icon} {p.tag}
                    </button>
                  ))}
                </div>

                <motion.div
                  key={activePersona}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass rounded-2xl p-5 border border-genome-accent/20"
                >
                  <p className="text-sm text-genome-muted mb-4 leading-relaxed">{PERSONAS[activePersona].desc}</p>
                  <Link
                    href={PERSONAS[activePersona].href}
                    className={`inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] ${
                      PERSONAS[activePersona].accent
                        ? 'bg-genome-accent hover:bg-genome-accent-hover text-white shadow-glow-sm hover:shadow-glow'
                        : 'border border-genome-border hover:border-genome-accent/50 text-genome-text'
                    }`}
                  >
                    {PERSONAS[activePersona].icon} {PERSONAS[activePersona].title}
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right: Demo preview */}
            <div className="hidden lg:flex items-center justify-center">
              <GenomePreviewCard />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 px-6 border-y border-genome-border bg-genome-card/30">
        <motion.div
          ref={statsRef as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={statsVisible ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { to: 247,   label: '解析済みVC',     unit: '名' },
            { to: 12000, label: '収集情報ソース',  unit: '件' },
            { to: 1834,  label: 'マッチング成立',  unit: '件' },
            { to: 91,    label: '平均信頼スコア',  unit: '点' },
          ].map((s) => (
            <motion.div key={s.label} variants={listItem}>
              <AnimatedStat {...s} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            ref={howRef as React.RefObject<HTMLDivElement>}
            variants={staggerContainer}
            initial="hidden"
            animate={howVisible ? 'visible' : 'hidden'}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-center mb-4">
              「入力」は、もう要らない
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-genome-muted text-center mb-16">
              名前を入れるだけ。AIが24時間、あなたのDNAを調べ上げる。
            </motion.p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', icon: '⌨️', title: '名前と所属を入力',        desc: 'フォームへの記入はたった2項目。URLを追加すれば精度がさらに上がります。' },
                { step: '02', icon: '🤖', title: 'AIエージェントが自律解析', desc: '4体の専門エージェントが並列稼働。Web上の全情報を収集・分析します。' },
                { step: '03', icon: '🧬', title: 'ゲノムプロフィール完成',   desc: '約30秒で、プロが数日かけて作るような職務経歴書が生成されます。' },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={listItem}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass rounded-2xl p-6 relative overflow-hidden group border border-genome-border hover:border-genome-accent/40 transition-colors cursor-default"
                >
                  <div className="absolute top-4 right-4 font-mono text-5xl font-bold text-genome-border/40 group-hover:text-genome-accent/12 transition-colors select-none">{item.step}</div>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-genome-muted text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Agents ─── */}
      <section className="py-24 px-6 bg-genome-card/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            ref={agentsRef as React.RefObject<HTMLDivElement>}
            variants={staggerContainer}
            initial="hidden"
            animate={agentsVisible ? 'visible' : 'hidden'}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-center mb-4">4体の専門AIエージェント</motion.h2>
            <motion.p variants={fadeInUp} className="text-genome-muted text-center mb-16">それぞれ異なる役割を持ち、合議制で「人物像」を構築する</motion.p>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { name: 'Fact Investigator',  role: '実績・経歴の番人',    icon: '🔍', border: 'border-blue-500/25',        color: 'from-blue-500/12',   confidence: 'A',  tasks: ['投資実績・フェーズの照合', '名寄せ・重複排除', 'ExitデータのDB照合'] },
                { name: 'Philosophy Profiler', role: '思想・文体解析官',    icon: '🧠', border: 'border-purple-500/25',      color: 'from-purple-500/12', confidence: 'B+', tasks: ['note/X/記事の文体解析', '投資哲学の言語化', '二つ名の生成'] },
                { name: 'Hands-on Analyst',   role: '伴走スタイル特定官',  icon: '🤝', border: 'border-genome-green/25',    color: 'from-green-500/12',  confidence: 'B',  tasks: ['起業家の言及を横断収集', '支援タイプの分類', '第三者評価の集約'] },
                { name: 'Freshness Guard',    role: '鮮度・矛盾検知官',    icon: '⚖️', border: 'border-genome-gold/25',     color: 'from-yellow-500/12', confidence: 'A-', tasks: ['情報の時系列整合性検証', '矛盾の検知と解釈', '信頼スコアの算出'] },
              ].map((agent) => (
                <motion.div
                  key={agent.name}
                  variants={listItem}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`glass rounded-2xl p-6 border ${agent.border} relative overflow-hidden group cursor-default`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl mb-1.5">{agent.icon}</div>
                        <h3 className="font-bold">{agent.name}</h3>
                        <p className="text-xs text-genome-muted">{agent.role}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-genome-muted mb-1">精度</div>
                        <div className="font-mono font-bold text-genome-gold text-lg">{agent.confidence}</div>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {agent.tasks.map((t) => (
                        <li key={t} className="flex items-center gap-2 text-sm text-genome-muted">
                          <span className="text-genome-green text-xs shrink-0">✓</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="glass rounded-3xl p-12 border border-genome-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-genome-accent/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="text-4xl mb-4">🧬</div>
              <h2 className="text-3xl font-bold mb-4">あなたのゲノムを、今すぐ生成する</h2>
              <p className="text-genome-muted mb-8 leading-relaxed">
                日本最高精度のキャピタリストプロフィール。<br />
                所要時間は30秒、費用は無料。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/genome/entry"   className="inline-flex items-center justify-center gap-2 bg-genome-accent hover:bg-genome-accent-hover text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-glow hover:shadow-glow-lg">🧬 ゲノムを解析する</Link>
                <Link href="/match/discover" className="inline-flex items-center justify-center gap-2 border border-genome-border hover:border-genome-accent/50 text-genome-text font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02]">🔍 投資家を探す</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-6 border-t border-genome-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-genome-muted text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-genome-accent rounded-md flex items-center justify-center text-white font-bold text-xs">VG</div>
            <span>VC Genome by StartPass</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-genome-text transition-colors">プライバシーポリシー</Link>
            <Link href="/terms"   className="hover:text-genome-text transition-colors">利用規約</Link>
          </div>
          <p>© 2026 StartPass, Inc.</p>
        </div>
      </footer>
    </main>
  )
}
