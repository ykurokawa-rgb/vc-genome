'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface AgentStatus {
  name: string
  role: string
  icon: string
  status: 'pending' | 'running' | 'done' | 'error'
  progress: number
  logs: string[]
}

interface JobStatus {
  status: 'running' | 'completed' | 'failed'
  vcId?: string
  agents: AgentStatus[]
  keywords: string[]
}

export default function ScanningPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [jobStatus, setJobStatus] = useState<JobStatus>({
    status: 'running',
    agents: [
      { name: 'Fact Investigator', role: '実績・経歴の番人', icon: '🔍', status: 'running', progress: 0, logs: [] },
      { name: 'Philosophy Profiler', role: '思想・文体解析官', icon: '🧠', status: 'pending', progress: 0, logs: [] },
      { name: 'Hands-on Analyst', role: '伴走スタイル特定官', icon: '🤝', status: 'pending', progress: 0, logs: [] },
      { name: 'Freshness Guard', role: '鮮度・矛盾検知官', icon: '⚖️', status: 'pending', progress: 0, logs: [] },
    ],
    keywords: [],
  })

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/genome/status/${jobId}`)
        const data: JobStatus = await res.json()
        setJobStatus(data)
        if (data.status === 'completed' && data.vcId) {
          clearInterval(interval)
          setTimeout(() => router.push(`/genome/${data.vcId}`), 1000)
        }
        if (data.status === 'failed') clearInterval(interval)
      } catch (err) {
        console.error(err)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [jobId, router])

  const overallProgress = Math.round(
    jobStatus.agents.reduce((sum, a) => sum + a.progress, 0) / jobStatus.agents.length
  )

  return (
    <main className="min-h-screen bg-genome-dark flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4 animate-pulse-slow">🧬</div>
          <h1 className="text-2xl font-bold mb-2">ゲノムを解析中...</h1>
          <p className="text-genome-muted text-sm">4体のAIエージェントが並列稼働しています</p>
        </div>

        {/* Overall Progress */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-genome-muted font-mono">総合進捗</span>
            <span className="text-sm font-mono text-genome-accent">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-genome-border rounded-full overflow-hidden">
            <div
              className="h-full bg-genome-accent rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Agents */}
        <div className="space-y-3 mb-8">
          {jobStatus.agents.map((agent) => (
            <div key={agent.name} className={`glass rounded-xl p-4 border transition-colors ${
              agent.status === 'running' ? 'border-genome-accent/50' :
              agent.status === 'done' ? 'border-genome-green/30' :
              'border-genome-border'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{agent.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{agent.name}</span>
                    <span className={`text-xs font-mono ${
                      agent.status === 'running' ? 'text-genome-accent' :
                      agent.status === 'done' ? 'text-genome-green' :
                      'text-genome-muted'
                    }`}>
                      {agent.status === 'pending' ? '待機中' :
                       agent.status === 'running' ? `${agent.progress}%` :
                       agent.status === 'done' ? '完了 ✓' : 'エラー'}
                    </span>
                  </div>
                  <p className="text-xs text-genome-muted">{agent.role}</p>
                </div>
              </div>
              {agent.status !== 'pending' && (
                <div className="h-1 bg-genome-border rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      agent.status === 'done' ? 'bg-genome-green' : 'bg-genome-accent'
                    }`}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              )}
              {agent.logs.length > 0 && (
                <div className="space-y-0.5">
                  {agent.logs.slice(-3).map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-genome-muted font-mono">
                      <span className="text-genome-green">✓</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Floating Keywords */}
        {jobStatus.keywords.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-genome-muted mb-3 font-mono">発見されたキーワード（リアルタイム）</p>
            <div className="flex flex-wrap gap-2">
              {jobStatus.keywords.map((kw, i) => (
                <span
                  key={kw}
                  className="text-xs border border-genome-accent/30 bg-genome-accent/10 text-genome-accent px-2 py-1 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
