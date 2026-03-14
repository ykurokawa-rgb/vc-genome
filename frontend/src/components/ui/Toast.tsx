'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id:       string
  type:     ToastType
  message:  string
  duration: number
}

interface ToastContextValue {
  toast:   (message: string, type?: ToastType, duration?: number) => void
  success: (message: string) => void
  error:   (message: string) => void
  info:    (message: string) => void
  warn:    (message: string) => void
}

// ─── スタイル設定 ─────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { icon: string; border: string; color: string }> = {
  success: { icon: '✓',  border: 'border-genome-green/40',  color: 'text-genome-green' },
  error:   { icon: '✕',  border: 'border-genome-red/40',    color: 'text-genome-red'   },
  info:    { icon: 'ℹ',  border: 'border-genome-accent/40', color: 'text-genome-accent' },
  warning: { icon: '⚠',  border: 'border-genome-gold/40',   color: 'text-genome-gold'  },
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── 個別 Toast ───────────────────────────────────────────────────────────────

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const cfg = TOAST_CONFIG[item.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      onClick={onDismiss}
      className={`glass rounded-xl px-4 py-3 flex items-start gap-3 cursor-pointer
                  min-w-[260px] max-w-[380px] border shadow-card ${cfg.border}`}
    >
      {/* アイコン */}
      <span className={`text-base shrink-0 mt-0.5 font-bold ${cfg.color}`}>
        {cfg.icon}
      </span>

      {/* メッセージ */}
      <p className="text-sm text-genome-text flex-1 leading-relaxed">{item.message}</p>

      {/* 閉じるボタン */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss() }}
        className="text-genome-muted hover:text-genome-text text-xs shrink-0 mt-0.5 transition-colors"
        aria-label="閉じる"
      >
        ✕
      </button>

      {/* プログレスバー */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-xl"
        style={{ backgroundColor: cfg.color.replace('text-', '').includes('genome')
          ? 'currentColor' : 'var(--accent)' }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: item.duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts,  setToasts]  = useState<ToastItem[]>([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((
    message:  string,
    type:     ToastType = 'info',
    duration: number    = 3800,
  ) => {
    const id = `toast-${++counterRef.current}`
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
  const error   = useCallback((msg: string) => toast(msg, 'error'),   [toast])
  const info    = useCallback((msg: string) => toast(msg, 'info'),    [toast])
  const warn    = useCallback((msg: string) => toast(msg, 'warning'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warn }}>
      {children}

      {/* Toast コンテナ */}
      <div
        className="fixed bottom-6 right-6 z-toast flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="通知"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(item => (
            <div key={item.id} className="pointer-events-auto relative overflow-hidden rounded-xl">
              <ToastCard item={item} onDismiss={() => dismiss(item.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
