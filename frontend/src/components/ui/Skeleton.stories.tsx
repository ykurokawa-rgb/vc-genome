import type { Meta, StoryObj } from '@storybook/react'
import {
  Skeleton,
  VCCardSkeleton,
  GenomeProfileSkeleton,
  TimelineSkeleton,
  TableSkeleton,
} from './Skeleton'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const meta: Meta<typeof Skeleton> = {
  title:     'UI/Skeleton',
  component: Skeleton,
  tags:      ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Shimmer skeleton components for loading states. Use the `Shimmer` wrapper for skeleton→content reveal transitions.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Rect: Story = {
  args: { variant: 'rect', className: 'h-24 w-64' },
}

export const Text: Story = {
  args: { variant: 'text', className: 'w-48' },
}

export const Circle: Story = {
  args: { variant: 'circle', className: 'w-16 h-16' },
}

export const TextBlock: Story = {
  name: 'Text Block',
  render: () => (
    <div className="space-y-2 w-80">
      <Skeleton variant="text" className="w-3/4 h-5" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-2/3 h-4" />
    </div>
  ),
}

// ─── Composite Skeletons ──────────────────────────────────────────────────────

export const VCCard: Story = {
  name: 'VC Card Skeleton',
  render: () => <VCCardSkeleton />,
  parameters: { layout: 'padded' },
}

export const GenomeProfile: Story = {
  name: 'Genome Profile Skeleton',
  render: () => (
    <div className="max-w-2xl">
      <GenomeProfileSkeleton />
    </div>
  ),
  parameters: { layout: 'padded' },
}

export const Timeline: Story = {
  name: 'Timeline Skeleton',
  render: () => (
    <div className="max-w-xl">
      <TimelineSkeleton />
    </div>
  ),
  parameters: { layout: 'padded' },
}

export const Table: Story = {
  name: 'Table Skeleton',
  render: () => (
    <div className="max-w-2xl">
      <TableSkeleton rows={5} cols={4} />
    </div>
  ),
  parameters: { layout: 'padded' },
}
