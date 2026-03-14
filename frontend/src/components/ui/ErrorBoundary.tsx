'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).slice(2, 8).toUpperCase(),
    }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // In production this would send to Sentry
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    const { error, errorId } = this.state
    const isDev = process.env.NODE_ENV === 'development'

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="glass rounded-2xl p-8 border border-genome-red/30 text-center space-y-5"
      >
        {/* Icon with glow */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-genome-red/20 rounded-full blur-xl" />
          <div className="relative w-16 h-16 rounded-2xl bg-genome-red/10 border border-genome-red/30 flex items-center justify-center text-3xl mx-auto">
            ⚡
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-genome-red text-lg">表示エラーが発生しました</h3>
          <p className="text-sm text-genome-muted">
            {isDev && error?.message
              ? error.message
              : 'このコンポーネントの読み込みに失敗しました。'}
          </p>
        </div>

        {/* Dev: stack trace */}
        {isDev && error?.stack && (
          <pre className="text-left text-2xs text-genome-muted bg-genome-dark rounded-xl p-3 overflow-auto max-h-32 font-mono leading-relaxed">
            {error.stack}
          </pre>
        )}

        {/* Error ID */}
        {errorId && (
          <p className="text-2xs text-genome-muted/60 font-mono">
            Error ID: {errorId}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={this.handleRetry}
            className="btn text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-5 py-2.5 rounded-xl shadow-glow-sm hover:shadow-glow"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn text-sm border border-genome-border text-genome-muted hover:text-genome-text hover:border-genome-accent/40 px-5 py-2.5 rounded-xl"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    )
  }
}

// ─── Functional Error Card (for non-boundary use) ─────────────────────────────

interface ErrorCardProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorCard({
  title = 'データの取得に失敗しました',
  message = '一時的なエラーが発生しました。しばらく待ってから再試行してください。',
  onRetry,
  className,
}: ErrorCardProps) {
  return (
    <div
      role="alert"
      className={`glass rounded-2xl p-6 border border-genome-red/20 text-center space-y-4 ${className ?? ''}`}
    >
      <div className="w-12 h-12 rounded-xl bg-genome-red/10 border border-genome-red/30 flex items-center justify-center text-2xl mx-auto">
        ⚡
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-genome-red">{title}</h3>
        <p className="text-sm text-genome-muted">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg"
        >
          再試行
        </button>
      )}
    </div>
  )
}
