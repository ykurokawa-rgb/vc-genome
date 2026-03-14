import type { AgentStatus } from '@/types/genome'
import ProgressBar from '@/components/ui/ProgressBar'

interface AgentStatusCardProps {
  agent: AgentStatus
}

export default function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const borderClass =
    agent.status === 'running'
      ? 'border-genome-accent/50'
      : agent.status === 'done'
        ? 'border-genome-green/30'
        : 'border-genome-border'

  const statusLabel =
    agent.status === 'pending'
      ? '待機中'
      : agent.status === 'running'
        ? `${agent.progress}%`
        : agent.status === 'done'
          ? '完了 ✓'
          : 'エラー'

  const statusColor =
    agent.status === 'running'
      ? 'text-genome-accent'
      : agent.status === 'done'
        ? 'text-genome-green'
        : 'text-genome-muted'

  return (
    <div className={`glass rounded-xl p-4 border transition-colors ${borderClass}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{agent.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{agent.name}</span>
            <span className={`text-xs font-mono ${statusColor}`}>{statusLabel}</span>
          </div>
          <p className="text-xs text-genome-muted">{agent.role}</p>
        </div>
      </div>

      {agent.status !== 'pending' && (
        <ProgressBar
          value={agent.progress}
          color={agent.status === 'done' ? 'green' : 'accent'}
          height="sm"
          className="mb-2"
        />
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
  )
}
