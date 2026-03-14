'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/Toast'

interface ShareButtonProps {
  vcId:  string
  name:  string
  className?: string
}

export function ShareButton({ vcId, name, className = '' }: ShareButtonProps) {
  const { success } = useToast()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/genome/${vcId}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      success(`${name}のプロフィールURLをコピーしました`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // フォールバック: execCommand
      const el = document.createElement('textarea')
      el.value = `${window.location.origin}/genome/${vcId}`
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      success(`URLをコピーしました`)
    }
  }

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`text-sm text-genome-muted hover:text-genome-text border border-genome-border hover:border-genome-accent/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="text-genome-green text-xs"
          >
            ✓
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="text-xs"
          >
            ↑
          </motion.span>
        )}
      </AnimatePresence>
      <span>{copied ? 'コピー済み' : 'シェア'}</span>
    </motion.button>
  )
}
