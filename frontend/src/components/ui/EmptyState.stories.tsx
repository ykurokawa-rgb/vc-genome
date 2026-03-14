import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState, EmptyStatePreset } from './EmptyState'
import { fn } from '@storybook/test'

const meta: Meta<typeof EmptyState> = {
  title:     'UI/EmptyState',
  component: EmptyState,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Empty state component with animated entrance. Use `EmptyStatePreset` for common scenarios.',
      },
    },
  },
  args: {
    icon:        '📭',
    title:       'データが見つかりませんでした',
    description: 'フィルターを変更するか、新しいゲノムを生成してみてください。',
    actions:     [
      { label: 'ゲノムを生成する', onClick: fn(), variant: 'primary' },
      { label: 'キャンセル',       onClick: fn(), variant: 'ghost'   },
    ],
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {}

export const Compact: Story = {
  args: { compact: true },
}

export const IconOnly: Story = {
  args: {
    icon:        '🔍',
    title:       '検索結果がありません',
    description: undefined,
    actions:     [],
  },
}

export const WithSingleAction: Story = {
  args: {
    actions: [{ label: '再試行', onClick: fn(), variant: 'primary' }],
  },
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export const PresetNoGenome: Story = {
  name: 'Preset: No Genome',
  render: () => (
    <div className="max-w-lg">
      <EmptyStatePreset
        preset="no-genome"
        actions={[{ label: 'ゲノムを生成する', onClick: fn() }]}
      />
    </div>
  ),
}

export const PresetNoMatch: Story = {
  name: 'Preset: No Match',
  render: () => (
    <div className="max-w-lg">
      <EmptyStatePreset
        preset="no-match"
        actions={[{ label: '条件を変更する', onClick: fn() }]}
      />
    </div>
  ),
}

export const PresetLoadingError: Story = {
  name: 'Preset: Loading Error',
  render: () => (
    <div className="max-w-lg">
      <EmptyStatePreset
        preset="loading-error"
        actions={[
          { label: '再試行', onClick: fn(), variant: 'primary' },
          { label: 'ホームへ', onClick: fn(), variant: 'ghost' },
        ]}
      />
    </div>
  ),
}

export const PresetComingSoon: Story = {
  name: 'Preset: Coming Soon',
  render: () => (
    <div className="max-w-lg">
      <EmptyStatePreset preset="coming-soon" />
    </div>
  ),
}
