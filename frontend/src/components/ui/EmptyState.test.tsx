import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState, EmptyStatePreset } from './EmptyState'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="テストタイトル" description="テスト説明文" />)
    expect(screen.getByText('テストタイトル')).toBeInTheDocument()
    expect(screen.getByText('テスト説明文')).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(<EmptyState title="test" icon="🔍" />)
    expect(screen.getByText('🔍')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        title="test"
        actions={[{ label: '実行する', onClick, variant: 'primary' }]}
      />
    )
    const btn = screen.getByRole('button', { name: '実行する' })
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders multiple actions', () => {
    render(
      <EmptyState
        title="test"
        actions={[
          { label: 'プライマリ', onClick: vi.fn(), variant: 'primary' },
          { label: 'ゴースト',   onClick: vi.fn(), variant: 'ghost'   },
        ]}
      />
    )
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('does not render description if not provided', () => {
    const { queryByText } = render(<EmptyState title="test" />)
    expect(queryByText(/説明/)).toBeNull()
  })
})

describe('EmptyStatePreset', () => {
  it('renders no-genome preset', () => {
    render(<EmptyStatePreset preset="no-genome" />)
    expect(screen.getByText('ゲノムがまだ生成されていません')).toBeInTheDocument()
  })

  it('renders no-match preset', () => {
    render(<EmptyStatePreset preset="no-match" />)
    expect(screen.getByText('マッチするVCが見つかりませんでした')).toBeInTheDocument()
  })

  it('renders coming-soon preset', () => {
    render(<EmptyStatePreset preset="coming-soon" />)
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })
})
