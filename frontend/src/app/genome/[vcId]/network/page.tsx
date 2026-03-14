'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface SimNode {
  id:     string
  label:  string
  type:   'center' | 'sector' | 'exit' | 'coInvestor'
  x:      number
  y:      number
  vx:     number
  vy:     number
  size:   number
  detail: string
}

interface SimEdge {
  from:     string
  to:       string
  strength: number
}

// ─── ノード設定 ───────────────────────────────────────────────────────────────

const NODE_CFG = {
  center:     { color: '#6C63FF', label: '中心VC' },
  sector:     { color: '#6C63FF', label: '投資領域' },
  exit:       { color: '#F0C040', label: 'Exit企業' },
  coInvestor: { color: '#00D48A', label: '共同投資家' },
} as const

// ─── 決定論的擬似乱数 ─────────────────────────────────────────────────────────

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

// ─── Force Simulation ─────────────────────────────────────────────────────────

function runSimulation(nodes: SimNode[], edges: SimEdge[], W: number, H: number) {
  const cx = W / 2
  const cy = H / 2
  const k    = 75
  const g    = 0.03
  const damp = 0.82

  for (let iter = 0; iter < 180; iter++) {
    // 反発力
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i]
        const nj = nodes[j]
        const dx   = ni.x - nj.x
        const dy   = ni.y - nj.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const f    = (k * k) / dist * 0.08
        const fx   = (dx / dist) * f
        const fy   = (dy / dist) * f
        if (ni.type !== 'center') { ni.vx += fx; ni.vy += fy }
        if (nj.type !== 'center') { nj.vx -= fx; nj.vy -= fy }
      }
    }
    // 引力（エッジ）
    for (const edge of edges) {
      const ni = nodes.find(n => n.id === edge.from)
      const nj = nodes.find(n => n.id === edge.to)
      if (!ni || !nj) continue
      const dx     = nj.x - ni.x
      const dy     = nj.y - ni.y
      const dist   = Math.sqrt(dx * dx + dy * dy) || 1
      const target = 130 + (ni.size + nj.size)
      const f      = (dist - target) * 0.04 * edge.strength
      const fx     = (dx / dist) * f
      const fy     = (dy / dist) * f
      if (ni.type !== 'center') { ni.vx += fx; ni.vy += fy }
      if (nj.type !== 'center') { nj.vx -= fx; nj.vy -= fy }
    }
    // 中心引力
    for (const node of nodes) {
      if (node.type === 'center') continue
      node.vx += (cx - node.x) * g
      node.vy += (cy - node.y) * g
    }
    // 位置更新
    for (const node of nodes) {
      if (node.type === 'center') continue
      node.vx *= damp
      node.vy *= damp
      node.x  += node.vx
      node.y  += node.vy
      const pad = node.size + 16
      node.x = Math.max(pad, Math.min(W - pad, node.x))
      node.y = Math.max(pad, Math.min(H - pad, node.y))
    }
  }
}

// ─── グラフ構築 ───────────────────────────────────────────────────────────────

function buildGraph(
  genome: Record<string, unknown>,
  filter: string,
  W: number,
  H: number,
): { nodes: SimNode[]; edges: SimEdge[] } {
  const cx       = W / 2
  const cy       = H / 2
  const footprint = (genome.investment_footprint as Record<string, unknown>) ?? {}
  const name      = ((genome.basic_info as Record<string, unknown>)?.name as string) ?? 'VC'
  const sectors   = (footprint.top_sectors as { sector: string; percentage: number }[]) ?? []
  const exits     = (footprint.notable_exits as string[]) ?? []
  const total     = (footprint.total_funded_startups as number) ?? 0

  const nodes: SimNode[] = []
  const edges: SimEdge[] = []

  nodes.push({
    id: 'center', label: name, type: 'center',
    x: cx, y: cy, vx: 0, vy: 0,
    size: 30, detail: `${total}社に投資`,
  })

  if (filter === 'all' || filter === 'portfolio') {
    sectors.slice(0, 5).forEach((s, i) => {
      const angle = -Math.PI * 0.8 + i * (Math.PI * 1.6 / Math.max(sectors.length - 1, 1))
      const r     = 140 + seededRand(i * 3) * 30
      nodes.push({
        id: `sector-${i}`, label: s.sector, type: 'sector',
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0, vy: 0,
        size: 9 + s.percentage / 8,
        detail: `投資比率: ${s.percentage}%`,
      })
      edges.push({ from: 'center', to: `sector-${i}`, strength: s.percentage / 100 })
    })

    exits.slice(0, 3).forEach((e, i) => {
      const angle = Math.PI * 0.15 + i * (Math.PI * 0.35)
      nodes.push({
        id: `exit-${i}`, label: e.split(' ')[0], type: 'exit',
        x: cx + Math.cos(angle) * (150 + seededRand(i * 5 + 1) * 40),
        y: cy + Math.sin(angle) * (100 + seededRand(i * 5 + 2) * 30),
        vx: 0, vy: 0, size: 14,
        detail: 'Exit実績あり',
      })
      edges.push({ from: 'center', to: `exit-${i}`, strength: 0.8 })
    })
  }

  if (filter === 'all' || filter === 'coInvestor') {
    const cos = ['East Ventures', 'Incubate Fund', 'Coral Capital', 'WiL', 'Global Brain']
    cos.slice(0, 3).forEach((co, i) => {
      const angle = Math.PI * 0.9 + (i - 1) * 0.55
      nodes.push({
        id: `co-${i}`, label: co, type: 'coInvestor',
        x: cx + Math.cos(angle) * (165 + seededRand(i * 7) * 35),
        y: cy + Math.sin(angle) * (110 + seededRand(i * 7 + 3) * 25),
        vx: 0, vy: 0, size: 12,
        detail: '共同投資家',
      })
      edges.push({ from: 'center', to: `co-${i}`, strength: 0.5 })
    })
  }

  runSimulation(nodes, edges, W, H)
  return { nodes, edges }
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

const W = 680
const H = 400

export default function NetworkPage() {
  const params = useParams()
  const vcId   = params.vcId as string

  const [genome,       setGenome]       = useState<Record<string, unknown> | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'portfolio' | 'coInvestor'>('all')
  const [graph,        setGraph]        = useState<{ nodes: SimNode[]; edges: SimEdge[] } | null>(null)
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null)
  const [hoveredId,    setHoveredId]    = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/genome/${vcId}`)
      .then(r => r.json())
      .then(setGenome)
      .catch(console.error)
  }, [vcId])

  useEffect(() => {
    if (!genome) return
    setSelectedNode(null)
    setGraph(buildGraph(genome, activeFilter, W, H))
  }, [genome, activeFilter])

  const footprint = (genome?.investment_footprint as Record<string, unknown>) ?? {}
  const sectors   = (footprint.top_sectors as { sector: string; percentage: number }[]) ?? []
  const exits     = (footprint.notable_exits as string[]) ?? []
  const name      = ((genome?.basic_info as Record<string, unknown>)?.name as string) ?? 'このキャピタリスト'

  return (
    <div className="space-y-6">
      {/* ─── コントロール ─── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">ネットワークグラフ</h2>
          <div className="flex gap-2">
            {(['all', 'portfolio', 'coInvestor'] as const).map((key) => {
              const label = key === 'all' ? 'すべて' : key === 'portfolio' ? '投資先' : '共同投資家'
              return (
                <motion.button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeFilter === key
                      ? 'border-genome-accent bg-genome-accent/20 text-genome-accent'
                      : 'border-genome-border text-genome-muted hover:border-genome-accent/50'
                  }`}
                >
                  {label}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex flex-wrap gap-4 mb-4">
          {(['sector', 'exit', 'coInvestor'] as const).map(type => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NODE_CFG[type].color }} />
              <span className="text-xs text-genome-muted">{NODE_CFG[type].label}</span>
            </div>
          ))}
        </div>

        {/* SVG グラフ */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {graph ? (
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <svg
                  width={W}
                  height={H}
                  viewBox={`0 0 ${W} ${H}`}
                  className="w-full rounded-xl bg-genome-dark border border-genome-border cursor-default"
                  onClick={() => setSelectedNode(null)}
                >
                  <defs>
                    <radialGradient id="bg-pulse" cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#6C63FF" stopOpacity="0"    />
                    </radialGradient>
                    {(['center', 'sector', 'exit', 'coInvestor'] as const).map(t => (
                      <radialGradient key={t} id={`ng-${t}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor={NODE_CFG[t].color} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={NODE_CFG[t].color} stopOpacity="0.4" />
                      </radialGradient>
                    ))}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* 中心背景グロー */}
                  {graph.nodes[0] && (
                    <circle
                      cx={graph.nodes[0].x}
                      cy={graph.nodes[0].y}
                      r={80}
                      fill="url(#bg-pulse)"
                    />
                  )}

                  {/* エッジ */}
                  {graph.edges.map((edge, i) => {
                    const from = graph.nodes.find(n => n.id === edge.from)
                    const to   = graph.nodes.find(n => n.id === edge.to)
                    if (!from || !to) return null
                    const isActive = hoveredId === edge.from || hoveredId === edge.to

                    return (
                      <motion.line
                        key={`e-${i}`}
                        x1={from.x} y1={from.y}
                        x2={to.x}   y2={to.y}
                        stroke={isActive ? NODE_CFG[to.type].color : 'rgba(108,99,255,0.18)'}
                        strokeWidth={isActive ? 2 : 1}
                        strokeDasharray="5 5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: i * 0.04 }}
                      />
                    )
                  })}

                  {/* ノード */}
                  {graph.nodes.map((node, i) => {
                    const cfg        = NODE_CFG[node.type]
                    const isHovered  = hoveredId    === node.id
                    const isSelected = selectedNode?.id === node.id

                    return (
                      <motion.g
                        key={node.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: i * 0.05 }}
                        style={{
                          transformOrigin: `${node.x}px ${node.y}px`,
                          transformBox:    'fill-box',
                          cursor:          'pointer',
                        }}
                        onHoverStart={() => setHoveredId(node.id)}
                        onHoverEnd={() => setHoveredId(null)}
                        onClick={(e) => { e.stopPropagation(); setSelectedNode(node) }}
                      >
                        {/* ホバー/選択グロー */}
                        {(isHovered || isSelected) && (
                          <circle
                            cx={node.x} cy={node.y}
                            r={node.size + 14}
                            fill={cfg.color}
                            opacity={0.12}
                            filter="url(#glow)"
                          />
                        )}

                        {/* メインサークル */}
                        <circle
                          cx={node.x} cy={node.y}
                          r={node.size}
                          fill={`url(#ng-${node.type})`}
                          stroke={cfg.color}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          strokeOpacity={isSelected ? 1 : 0.7}
                        />

                        {/* 中心ノードのテキスト */}
                        {node.type === 'center' ? (
                          <>
                            <text
                              x={node.x} y={node.y - 5}
                              textAnchor="middle" fontSize={10}
                              fontWeight="700"
                              fontFamily="system-ui, sans-serif"
                              fill="rgba(255,255,255,0.95)"
                            >
                              {node.label.split(' ')[0]}
                            </text>
                            <text
                              x={node.x} y={node.y + 8}
                              textAnchor="middle" fontSize={8}
                              fontFamily="system-ui, sans-serif"
                              fill="rgba(255,255,255,0.55)"
                            >
                              {node.detail}
                            </text>
                          </>
                        ) : (
                          <text
                            x={node.x}
                            y={node.y + node.size + 13}
                            textAnchor="middle"
                            fontSize={9}
                            fontFamily="system-ui, sans-serif"
                            fill="rgba(232,232,240,0.75)"
                          >
                            {node.label.length > 10 ? node.label.slice(0, 10) + '…' : node.label}
                          </text>
                        )}
                      </motion.g>
                    )
                  })}
                </svg>
              </motion.div>
            ) : (
              <div className="h-64 rounded-xl bg-genome-dark border border-genome-border flex items-center justify-center text-genome-muted">
                読み込み中…
              </div>
            )}
          </AnimatePresence>

          {/* ノード詳細パネル */}
          <AnimatePresence>
            {selectedNode && selectedNode.type !== 'center' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-3 right-3 glass rounded-xl p-3.5 border"
                style={{ borderColor: NODE_CFG[selectedNode.type].color + '50' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NODE_CFG[selectedNode.type].color }} />
                    <span className="text-xs text-genome-muted">{NODE_CFG[selectedNode.type].label}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedNode(null) }}
                    className="text-genome-muted hover:text-genome-text text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
                <p className="font-medium text-sm">{selectedNode.label}</p>
                <p className="text-xs text-genome-muted mt-0.5">{selectedNode.detail}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-xs text-genome-muted mt-2">ノードをクリックして詳細を確認できます</p>
      </div>

      {/* ─── 投資領域 ─── */}
      {sectors.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold mb-4">投資領域ノード詳細</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sectors.map((s, i) => (
              <motion.div
                key={s.sector}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-genome-dark rounded-xl p-3 border border-genome-border hover:border-genome-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{s.sector}</span>
                  <span className="text-genome-accent font-mono text-sm">{s.percentage}%</span>
                </div>
                <div className="h-1.5 bg-genome-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-genome-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percentage}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.08 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Exit実績 ─── */}
      {exits.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold mb-4">Exit実績</h2>
          <div className="space-y-2">
            {exits.map((e, i) => (
              <motion.div
                key={e}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-genome-dark rounded-xl border border-genome-gold/20 hover:border-genome-gold/40 transition-colors"
              >
                <span className="text-genome-gold">★</span>
                <span className="text-sm">{e}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── インサイト ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-5 border border-genome-accent/20"
      >
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span className="text-genome-accent">💡</span> ネットワーク・インサイト
        </h2>
        <p className="text-sm text-genome-muted leading-relaxed">
          {name}のネットワークは、
          {sectors[0]?.sector ? `${sectors[0].sector}` : '複数の領域'}を中心に形成されています。
          {exits.length > 0
            ? ` ${exits.length}件のExitを達成しており、ポートフォリオ全体の価値創出に貢献しています。`
            : ''}
        </p>
      </motion.div>
    </div>
  )
}
