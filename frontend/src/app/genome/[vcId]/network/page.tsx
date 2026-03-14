'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

interface Node {
  id: string
  label: string
  type: 'vc' | 'startup' | 'coInvestor' | 'exit'
  x: number
  y: number
  size: number
  color: string
}

interface Edge {
  from: string
  to: string
  label?: string
}

interface GenomeData {
  basic_info?: { name?: string; current_affiliation?: string }
  investment_footprint?: {
    top_sectors?: { sector: string; percentage: number }[]
    notable_exits?: string[]
    total_funded_startups?: number
  }
  genome_stats?: { keywords?: string[] }
}

export default function NetworkPage() {
  const params = useParams()
  const vcId = params.vcId as string
  const [genome, setGenome] = useState<GenomeData | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'portfolio' | 'coInvestor'>('all')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetch(`/api/genome/${vcId}`)
      .then((r) => r.json())
      .then(setGenome)
      .catch(console.error)
  }, [vcId])

  // Canvas でシンプルなグラフを描画
  useEffect(() => {
    if (!genome || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const name = genome.basic_info?.name ?? 'VC'
    const sectors = genome.investment_footprint?.top_sectors ?? []
    const exits = genome.investment_footprint?.notable_exits ?? []
    const total = genome.investment_footprint?.total_funded_startups ?? 0

    // 中心ノード
    const center = { x: W / 2, y: H / 2 }

    const satelliteNodes: { x: number; y: number; label: string; color: string; size: number }[] = []

    // 投資領域ノード（上部半円）
    sectors.slice(0, 4).forEach((s, i) => {
      const angle = -Math.PI + (i / Math.max(sectors.length - 1, 1)) * Math.PI
      satelliteNodes.push({
        x: center.x + Math.cos(angle) * 160,
        y: center.y + Math.sin(angle) * 100,
        label: s.sector,
        color: '#6C63FF',
        size: 8 + s.percentage / 10,
      })
    })

    // Exit ノード（下部）
    exits.slice(0, 3).forEach((e, i) => {
      const angle = (Math.PI / 4) * (i - 1)
      satelliteNodes.push({
        x: center.x + Math.cos(angle) * 180,
        y: center.y + 120 + Math.sin(angle) * 40,
        label: e.split(' ')[0],
        color: '#F0C040',
        size: 14,
      })
    })

    // 共同投資家（左右）
    const coInvestors = ['East Ventures', 'Incubate Fund', 'Coral Capital']
    coInvestors.slice(0, 2).forEach((co, i) => {
      satelliteNodes.push({
        x: center.x + (i === 0 ? -220 : 220),
        y: center.y + (i === 0 ? -30 : 30),
        label: co,
        color: '#00D48A',
        size: 10,
      })
    })

    // エッジを描画
    satelliteNodes.forEach((node) => {
      ctx.beginPath()
      ctx.moveTo(center.x, center.y)
      ctx.lineTo(node.x, node.y)
      ctx.strokeStyle = 'rgba(108,99,255,0.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // 中心ノード
    ctx.beginPath()
    ctx.arc(center.x, center.y, 28, 0, Math.PI * 2)
    ctx.fillStyle = '#6C63FF'
    ctx.fill()
    ctx.strokeStyle = 'rgba(108,99,255,0.5)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(name.split(' ')[0] ?? 'VC', center.x, center.y - 6)
    ctx.font = '9px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText(`${total}社`, center.x, center.y + 8)

    // サテライトノード
    satelliteNodes.forEach((node) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
      ctx.fillStyle = node.color + '33'
      ctx.fill()
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#E8E8F0'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const shortLabel = node.label.length > 10 ? node.label.slice(0, 10) + '…' : node.label
      ctx.fillText(shortLabel, node.x, node.y + node.size + 4)
    })
  }, [genome, activeFilter])

  const sectors = genome?.investment_footprint?.top_sectors ?? []
  const exits = genome?.investment_footprint?.notable_exits ?? []

  return (
    <div className="space-y-6">
      {/* ─── コントロール ─── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">ネットワークグラフ</h2>
          <div className="flex gap-2">
            {([['all', 'すべて'], ['portfolio', '投資先'], ['coInvestor', '共同投資家']] as const).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeFilter === key
                      ? 'border-genome-accent bg-genome-accent/20 text-genome-accent'
                      : 'border-genome-border text-genome-muted hover:border-genome-accent/50'
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { color: '#6C63FF', label: '投資領域' },
            { color: '#F0C040', label: 'Exit企業' },
            { color: '#00D48A', label: '共同投資家' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-genome-muted">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Canvas グラフ */}
        {genome ? (
          <canvas
            ref={canvasRef}
            width={680}
            height={360}
            className="w-full rounded-xl bg-genome-dark border border-genome-border"
          />
        ) : (
          <div className="h-64 rounded-xl bg-genome-dark border border-genome-border flex items-center justify-center text-genome-muted">
            読み込み中...
          </div>
        )}
      </div>

      {/* ─── 投資領域 ─── */}
      {sectors.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold mb-4">投資領域ノード詳細</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sectors.map((s) => (
              <div key={s.sector} className="bg-genome-dark rounded-xl p-3 border border-genome-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{s.sector}</span>
                  <span className="text-genome-accent font-mono text-sm">{s.percentage}%</span>
                </div>
                <div className="h-1.5 bg-genome-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-genome-accent rounded-full"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Exit実績 ─── */}
      {exits.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold mb-4">Exit実績</h2>
          <div className="space-y-2">
            {exits.map((e) => (
              <div
                key={e}
                className="flex items-center gap-3 p-3 bg-genome-dark rounded-xl border border-genome-gold/20"
              >
                <span className="text-genome-gold">★</span>
                <span className="text-sm">{e}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── インサイト ─── */}
      <div className="glass rounded-2xl p-5 border border-genome-accent/20">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span className="text-genome-accent">💡</span> ネットワーク・インサイト
        </h2>
        <p className="text-sm text-genome-muted leading-relaxed">
          {genome?.basic_info?.name ?? 'このキャピタリスト'}のネットワークは、
          {sectors[0]?.sector ? `${sectors[0].sector}` : '複数の領域'}を中心に形成されています。
          {exits.length > 0
            ? ` ${exits.length}件のExitを達成しており、ポートフォリオ全体の価値創出に貢献しています。`
            : ''}
        </p>
      </div>
    </div>
  )
}
