'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="glass rounded-2xl p-8 text-center border border-genome-red/20">
          <div className="text-3xl mb-3">⚠</div>
          <h3 className="font-bold text-genome-red mb-2">表示エラーが発生しました</h3>
          <p className="text-sm text-genome-muted mb-4">
            {this.state.error?.message ?? 'データの読み込みに失敗しました'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            再試行
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
