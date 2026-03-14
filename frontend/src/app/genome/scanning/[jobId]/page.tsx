'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeInUp, fadeIn, listItem } from '@/lib/motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentStatus {
  name:     string
  role:     string
  icon:     string
  status:   'pending' | 'running' | 'done' | 'error'
  progress: number
  logs:     string[]
}

interface JobStatus {
  status:   'running' | 'completed' | 'failed'
  vcId?:    string
  agents:   AgentStatus[]
  keywords: string[]
}

// ─── Agent Orbit ──────────────────────────────────────────────────────────────

function AgentOrbit({ agents }: { agents: AgentStatus[] }) {
  const RADIUS = 110
  const SIZE   = 56
  const CENTER = 160
  const ANGLES = [-60, 60, 120, 240]

  return (
    <div className="relative mx-auto" style={{ width: CENTER * 2, height: CENTER * 2 }}>
      {/* Orbit rings */}
      {[RADIUS, RADIUS + 14].map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-genome-accent/10"
          style={{ width: r * 2, height: r * 2, top: CENTER - r, left: CENTER - r }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 18 + i * 8, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Connecting lines */}
      <svg className="absolute inset-0" width={CENTER * 2} height={CENTER * 2} viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}>
        {agents.map((agent, i) => {
          const rad   = (ANGLES[i] * Math.PI) / 180
          const x2    = CENTER + Math.cos(rad) * RADIUS
          const y2    = CENTER + Math.sin(rad) * RADIUS
          const isRun = agent.status === 'running'
          const isDone= agent.status === 'done'
          return (
            <motion.line
              key={agent.name}
              x1={CENTER} y1={CENTER} x2={x2} y2={y2}
              stroke={isDone ? '#00D48A' : isRun ? '#6C63FF' : '#1E1E2E'}
              strokeWidth={isRun ? 1.5 : 1}
              strokeDasharray={isRun ? '4 3' : undefined}
              animate={isRun ? { strokeDashoffset: [0, -14] } : {}}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          )
        })}
      </svg>

      {/* Center icon */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full bg-genome-card border border-genome-accent/40"
        style={{ width: 72, height: 72, top: CENTER - 36, left: CENTER - 36 }}
        animate={{ boxShadow: ['0 0 12px rgba(108,99,255,0.2)', '0 0 32px rgba(108,99,255,0.5)', '0 0 12px rgba(108,99,255,0.2)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span className="text-3xl" animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
          🧬
        </motion.span>
      </motion.div>

      {/* Agent nodes */}
      {agents.map((agent, i) => {
        const rad   = (ANGLES[i] * Math.PI) / 180
        const cx    = CENTER + Math.cos(rad) * RADIUS
        const cy    = CENTER + Math.sin(rad) * RADIUS
        const isRun = agent.status === 'running'
        const isDone= agent.status === 'done'

        return (
          <motion.div
            key={agent.name}
            className="absolute flex items-center justify-center rounded-full border-2 text-xl"
            style={{ width: SIZE, height: SIZE, left: cx - SIZE / 2, top: cy - SIZE / 2 }}
            animate={{
              borderColor:     isDone ? '#00D48A' : isRun ? '#6C63FF' : '#1E1E2E',
              backgroundColor: isDone ? 'rgba(0,212,138,0.1)' : isRun ? 'rgba(108,99,255,0.12)' : 'rgba(18,18,26,0.9)',
              scale:           isRun ? [1, 1.1, 1] : 1,
              boxShadow:       isRun
                ? ['0 0 0px rgba(108,99,255,0)', '0 0 20px rgba(108,99,255,0.45)', '0 0 0px rgba(108,99,255,0)']
                : isDone ? '0 0 12px rgba(0,212,138,0.3)' : 'none',
            }}
            transition={isRun ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          >
            <span>{agent.icon}</span>
            {isDone && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-genome-green flex items-center justify-center text-xs text-white font-bold"
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Live Feed ────────────────────────────────────────────────────────────────

interface FeedItem { id: number; agent: string; text: string; time: string }

function LiveFeed({ agents }: { agents: AgentStatus[] }) {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    agents.forEach((agent) => {
      if (agent.status !== 'pending' && agent.logs.length > 0) {
        const last = agent.logs[agent.logs.length - 1]
        setFeed((prev) => {
          if (prev.some((f) => f.text === last && f.agent === agent.name)) return prev
          return [{
            id:    idRef.current++,
            agent: agent.name,
            text:  last,
            time:  new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          }, ...prev].slice(0, 12)
        })
      }
    })
  }, [agents])

  if (feed.length === 0) return null

  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-genome-muted font-mono mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-genome-green rounded-full animate-pulse inline-block" />
        リアルタイム解析ログ
      </p>
      <div className="space-y-1.5 max-h-36 overflow-hidden">
        <AnimatePresence initial={false}>
          {feed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 text-xs font-mono"
            >
              <span className="text-genome-muted shrink-0">{item.time}</span>
              <span className="text-genome-accent shrink-0">[{item.agent.split(' ')[0]}]</span>
              <span className="text-genome-muted">{item.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Completion Reveal ────────────────────────────────────────────────────────

function CompletionReveal() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-modal flex items-center justify-center bg-genome-dark/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
        className="text-center relative"
      >
        <motion.div
          className="absolute inset-0 m-auto w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', top: '50%', left: '50%' }}
          animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="relative text-6xl mb-6" animate={{ rotate: 360 }} transition={{ duration: 1, ease: 'easeOut' }}>
          🧬
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">ゲノム解析 完了</h2>
        <p className="text-genome-muted mb-6">プロフィールページに移動しています...</p>
        <div className="h-1 bg-genome-border rounded-full overflow-hidden max-w-xs mx-auto">
          <motion.div
            className="h-full bg-genome-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.4, ease: [0, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const INITIAL_AGENTS: AgentStatus[] = [
  { name: 'Fact Investigator',  role: '実績・経歴の番人',   icon: '🔍', status: 'running', progress: 0, logs: [] },
  { name: 'Philosophy Profiler', role: '思想・文体解析官',   icon: '🧠', status: 'pending', progress: 0, logs: [] },
  { name: 'Hands-on Analyst',   role: '伴走スタイル特定官', icon: '🤝', status: 'pending', progress: 0, logs: [] },
  { name: 'Freshness Guard',    role: '鮮度・矛盾検知官',   icon: '⚖️', status: 'pending', progress: 0, logs: [] },
]

export default function ScanningPage() {
  const params = useParams()
  const router = useRouter()
  const jobId  = params.jobId as string

  const [jobStatus, setJobStatus] = useState<JobStatus>({ status: 'running', agents: INITIAL_AGENTS, keywords: [] })
  const [showReveal, setShowReveal] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res  = await fetch(`/api/genome/status/${jobId}`)
        const data: JobStatus = await res.json()
        setJobStatus(data)
        if (data.status === 'completed' && data.vcId) {
          clearInterval(interval)
          setShowReveal(true)
          setTimeout(() => router.push(`/genome/${data.vcId}`), 2200)
        }
        if (data.status === 'failed') clearInterval(interval)
      } catch (err) {
        console.error(err)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [jobId, router])

  const overallProgress = Math.round(jobStatus.agents.reduce((s, a) => s + a.progress, 0) / jobStatus.agents.length)
  const activeAgent     = jobStatus.agents.find((a) => a.status === 'running')
  const doneCount       = jobStatus.agents.filter((a) => a.status === 'done').length
  const etaSeconds      = Math.max(0, Math.round((100 - overallProgress) * 0.4))

  return (
    <>
      {showReveal && <CompletionReveal />}

      <main className="min-h-screen bg-genome-dark py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <div className="inline-flex items-center gap-2 border border-genome-accent/30 bg-genome-accent/10 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 bg-genome-green rounded-full animate-pulse" />
                <span className="text-sm text-genome-accent font-mono">{doneCount}/4 エージェント完了</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">ゲノムを解析中...</h1>
              <p className="text-genome-muted text-sm">
                {activeAgent ? `${activeAgent.name} が稼働中` : '4体のAIエージェントが並列稼働しています'}
              </p>
            </motion.div>

            {/* Orbit */}
            <motion.div variants={fadeIn} className="flex justify-center mb-8">
              <AgentOrbit agents={jobStatus.agents} />
            </motion.div>

            {/* Overall progress */}
            <motion.div variants={fadeInUp} className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-genome-muted font-mono">総合進捗</span>
                <div className="flex items-center gap-3">
                  {etaSeconds > 0 && <span className="text-xs text-genome-muted font-mono">残り約 {etaSeconds}秒</span>}
                  <span className="text-sm font-mono text-genome-accent">{overallProgress}%</span>
                </div>
              </div>
              <div className="h-2 bg-genome-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-genome-accent rounded-full"
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
                />
              </div>
            </motion.div>

            {/* Agent cards */}
            <motion.div variants={staggerContainer} className="space-y-3 mb-6">
              {jobStatus.agents.map((agent) => (
                <motion.div
                  key={agent.name}
                  variants={listItem}
                  animate={{ borderColor: agent.status === 'running' ? 'rgba(108,99,255,0.5)' : agent.status === 'done' ? 'rgba(0,212,138,0.3)' : 'rgba(30,30,46,1)' }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-xl p-4 border"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <motion.span
                      className="text-xl"
                      animate={agent.status === 'running' ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {agent.icon}
                    </motion.span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{agent.name}</span>
                        <span className={`text-xs font-mono ${agent.status === 'running' ? 'text-genome-accent' : agent.status === 'done' ? 'text-genome-green' : 'text-genome-muted'}`}>
                          {agent.status === 'pending' ? '待機中' : agent.status === 'running' ? `${agent.progress}%` : agent.status === 'done' ? '完了 ✓' : 'エラー'}
                        </span>
                      </div>
                      <p className="text-xs text-genome-muted">{agent.role}</p>
                    </div>
                  </div>

                  {agent.status !== 'pending' && (
                    <div className="h-1 bg-genome-border rounded-full overflow-hidden mb-2">
                      <motion.div
                        className={`h-full rounded-full ${agent.status === 'done' ? 'bg-genome-green' : 'bg-genome-accent'}`}
                        animate={{ width: `${agent.progress}%` }}
                        transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
                      />
                    </div>
                  )}

                  <AnimatePresence>
                    {agent.logs.length > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.2 }} className="overflow-hidden space-y-0.5">
                        {agent.logs.slice(-2).map((log, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-genome-muted font-mono">
                            <span className="text-genome-green shrink-0">→</span>{log}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            {/* Live feed */}
            <motion.div variants={fadeInUp} className="mb-4">
              <LiveFeed agents={jobStatus.agents} />
            </motion.div>

            {/* Keywords */}
            {jobStatus.keywords.length > 0 && (
              <motion.div variants={fadeInUp} className="glass rounded-2xl p-4">
                <p className="text-xs text-genome-muted font-mono mb-3">発見されたキーワード（リアルタイム）</p>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {jobStatus.keywords.map((kw, i) => (
                      <motion.span
                        key={kw}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                        className="text-xs border border-genome-accent/40 bg-genome-accent/10 text-genome-accent px-2.5 py-1 rounded-full"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  )
}
