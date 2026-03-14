import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VCGenome } from '@/types/genome'

// ─── 型定義 ───────────────────────────────────────────────────────────────────

export interface RecentVC {
  vcId:        string
  name:        string
  affiliation: string
  alias:       string
  confidence:  string
  viewedAt:    number
}

interface GenomeStore {
  // ── キャッシュ（セッション限定・永続化しない）
  cache:       Record<string, VCGenome>
  cacheGenome: (vcId: string, genome: VCGenome) => void
  getCached:   (vcId: string) => VCGenome | undefined
  clearCache:  () => void

  // ── 最近閲覧（localStorage永続化）
  recentlyViewed:    RecentVC[]
  addRecentlyViewed: (vc: RecentVC) => void
  removeRecentlyViewed: (vcId: string) => void

  // ── 比較（セッション限定）
  compared:      string[]
  toggleCompare: (vcId: string) => void
  clearCompared: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGenomeStore = create<GenomeStore>()(
  persist(
    (set, get) => ({
      // ── キャッシュ
      cache: {},
      cacheGenome: (vcId, genome) =>
        set(s => ({ cache: { ...s.cache, [vcId]: genome } })),
      getCached: (vcId) => get().cache[vcId],
      clearCache: () => set({ cache: {} }),

      // ── 最近閲覧（最大6件）
      recentlyViewed: [],
      addRecentlyViewed: (vc) =>
        set(s => {
          const filtered = s.recentlyViewed.filter(r => r.vcId !== vc.vcId)
          return { recentlyViewed: [vc, ...filtered].slice(0, 6) }
        }),
      removeRecentlyViewed: (vcId) =>
        set(s => ({ recentlyViewed: s.recentlyViewed.filter(r => r.vcId !== vcId) })),

      // ── 比較（最大2件）
      compared: [],
      toggleCompare: (vcId) =>
        set(s => {
          const exists = s.compared.includes(vcId)
          if (exists) return { compared: s.compared.filter(id => id !== vcId) }
          if (s.compared.length >= 2) return s
          return { compared: [...s.compared, vcId] }
        }),
      clearCompared: () => set({ compared: [] }),
    }),
    {
      name: 'vc-genome-store',
      // キャッシュはメモリのみ・最近閲覧のみ永続化
      partialize: (s) => ({ recentlyViewed: s.recentlyViewed }),
    }
  )
)
