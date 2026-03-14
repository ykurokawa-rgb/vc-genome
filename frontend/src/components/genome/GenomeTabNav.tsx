'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const TABS: { label: string; href: string; badge?: boolean }[] = [
  { label: '概要',        href: '' },
  { label: '根拠データ',  href: '/evidence' },
  { label: '投資年表',    href: '/timeline' },
  { label: 'ネットワーク', href: '/network' },
  { label: '評判',        href: '/reputation' },
  { label: 'カレンダー',  href: '/calendar' },
  { label: 'AIチャット',  href: '/shadow-chat', badge: true },
]

interface GenomeTabNavProps {
  vcId: string
}

/**
 * Tab navigation with a Framer Motion layoutId indicator that slides smoothly
 * between active tabs. Must be a Client Component to read the current pathname.
 */
export function GenomeTabNav({ vcId }: GenomeTabNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => {
        const href    = `/genome/${vcId}${tab.href}`
        // Match exact for overview (""), prefix for others
        const isActive = tab.href === ''
          ? pathname === `/genome/${vcId}`
          : pathname.startsWith(href)

        return (
          <Link
            key={tab.label}
            href={href}
            className="relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-genome-accent rounded-t-lg"
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {/* Hover bg */}
            <span
              className="absolute inset-0 rounded-t-lg transition-colors duration-150 group-hover:bg-genome-accent/5"
              aria-hidden="true"
            />

            {/* Label */}
            <span className="relative flex items-center gap-1.5">
              {tab.label}
              {tab.badge && (
                <span className="text-[9px] bg-genome-accent text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                  AI
                </span>
              )}
            </span>

            {/* Active indicator — slides between tabs */}
            {isActive && (
              <motion.div
                layoutId="genome-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-genome-accent rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
