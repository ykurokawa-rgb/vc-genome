'use client'

import { motion } from 'framer-motion'
import { scaleInBounce, fadeInUp, staggerContainer } from '@/lib/motion'
import { clsx } from 'clsx'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'ghost'
}

interface EmptyStateProps {
  /** Visual icon — emoji or React node */
  icon?: React.ReactNode
  title: string
  description?: string
  actions?: EmptyStateAction[]
  className?: string
  /** Compact version for inline use */
  compact?: boolean
}

// ─── Abstract geometric art for empty states ──────────────────────────────────

function GeometricDecoration({ type }: { type: 'dots' | 'grid' | 'rings' | 'wave' }) {
  if (type === 'dots') {
    return (
      <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-20">
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 16 + 8}
              cy={row * 16 + 8}
              r={2}
              fill="#6C63FF"
              opacity={0.3 + Math.random() * 0.7}
            />
          ))
        )}
      </svg>
    )
  }

  if (type === 'rings') {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-15">
        {[40, 30, 20, 10].map((r, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#6C63FF"
            strokeWidth="1.5"
            strokeDasharray={`${r * 0.4} ${r * 0.2}`}
          />
        ))}
      </svg>
    )
  }

  if (type === 'grid') {
    return (
      <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 24} y1="0" x2={i * 24} y2="80" stroke="#6C63FF" strokeWidth="1" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 20} x2="120" y2={i * 20} stroke="#6C63FF" strokeWidth="1" />
        ))}
      </svg>
    )
  }

  // wave
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" className="opacity-20">
      <path
        d="M0 20 C20 5, 40 35, 60 20 S100 5, 120 20"
        fill="none"
        stroke="#6C63FF"
        strokeWidth="2"
      />
      <path
        d="M0 28 C20 13, 40 43, 60 28 S100 13, 120 28"
        fill="none"
        stroke="#6C63FF"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  )
}

// ─── Preset Configs ───────────────────────────────────────────────────────────

type EmptyStatePreset =
  | 'no-genome'
  | 'no-match'
  | 'no-evidence'
  | 'no-network'
  | 'no-results'
  | 'loading-error'
  | 'coming-soon'

const PRESETS: Record<EmptyStatePreset, Omit<EmptyStateProps, 'actions' | 'className'>> = {
  'no-genome': {
    icon: '🧬',
    title: 'ゲノムがまだ生成されていません',
    description: 'このキャピタリストのゲノムプロフィールは、AIエージェントによる解析後に表示されます。',
  },
  'no-match': {
    icon: '🔍',
    title: 'マッチするVCが見つかりませんでした',
    description: 'フィルター条件を変更するか、スタートアップ情報を詳しく入力してみてください。',
  },
  'no-evidence': {
    icon: '📄',
    title: '根拠データが不足しています',
    description: 'このVCに関する公開情報が少ないため、エビデンスカードを生成できませんでした。',
  },
  'no-network': {
    icon: '🕸',
    title: 'ネットワーク情報がありません',
    description: '投資先・共同投資家のデータが収集されると、ここにネットワークグラフが表示されます。',
  },
  'no-results': {
    icon: '🔭',
    title: '検索結果が見つかりません',
    description: '別のキーワードや条件で検索してみてください。',
  },
  'loading-error': {
    icon: '⚡',
    title: 'データの取得に失敗しました',
    description: '一時的なエラーが発生しました。しばらく待ってから再試行してください。',
  },
  'coming-soon': {
    icon: '🚀',
    title: 'Coming Soon',
    description: 'この機能は現在開発中です。正式リリースをお楽しみに。',
  },
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  actions = [],
  className,
  compact = false,
}: EmptyStateProps) {
  const decoration: 'dots' | 'rings' = compact ? 'rings' : 'dots'

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className
      )}
    >
      {/* Background decoration */}
      {!compact && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
          <GeometricDecoration type={decoration} />
        </div>
      )}

      {/* Icon */}
      <motion.div
        variants={scaleInBounce}
        className={clsx(
          'relative flex items-center justify-center rounded-2xl border border-genome-border bg-genome-card mb-5',
          compact ? 'w-12 h-12 text-xl' : 'w-20 h-20 text-4xl'
        )}
      >
        {/* Glow behind icon */}
        <div className="absolute inset-0 rounded-2xl bg-genome-accent/5 blur-xl" />
        <span className="relative">{icon ?? '📭'}</span>
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={fadeInUp}
        className={clsx(
          'font-bold text-genome-text mb-2',
          compact ? 'text-base' : 'text-lg'
        )}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          variants={fadeInUp}
          className={clsx(
            'text-genome-muted leading-relaxed max-w-sm',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-center gap-3 mt-6"
        >
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={clsx(
                'btn text-sm px-5 py-2.5 rounded-xl transition-all duration-150',
                action.variant === 'ghost'
                  ? 'border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40'
                  : 'bg-genome-accent hover:bg-genome-accent-hover text-white shadow-glow-sm hover:shadow-glow'
              )}
            >
              {action.label}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Preset Helper ────────────────────────────────────────────────────────────

interface EmptyStatePresetProps {
  preset: EmptyStatePreset
  actions?: EmptyStateAction[]
  className?: string
  compact?: boolean
}

export function EmptyStatePreset({ preset, actions, className, compact }: EmptyStatePresetProps) {
  const config = PRESETS[preset]
  return (
    <div className={clsx('relative glass rounded-2xl overflow-hidden', className)}>
      <EmptyState {...config} actions={actions} compact={compact} />
    </div>
  )
}
