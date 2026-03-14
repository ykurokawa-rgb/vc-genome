'use client'

import { useState, useEffect } from 'react'
import { useGenomeStore } from '@/store/useGenomeStore'
import type { VCGenome } from '@/types/genome'

// ─── インフライト重複排除マップ ────────────────────────────────────────────────
// 同一vcIdに対するリクエストを一本化し、ウォーターフォール防止

const inFlight = new Map<string, Promise<VCGenome>>()

async function fetchGenome(vcId: string): Promise<VCGenome> {
  const res = await fetch(`/api/genome/${vcId}`)
  if (!res.ok) throw new Error(`Genome not found: ${res.status}`)
  return res.json()
}

// ─── useGenome ────────────────────────────────────────────────────────────────

export function useGenome(vcId: string) {
  const getCached         = useGenomeStore(s => s.getCached)
  const cacheGenome       = useGenomeStore(s => s.cacheGenome)
  const addRecentlyViewed = useGenomeStore(s => s.addRecentlyViewed)

  const [data,    setData]    = useState<VCGenome | null>(() => getCached(vcId) ?? null)
  const [loading, setLoading] = useState(!getCached(vcId))
  const [error,   setError]   = useState<Error | null>(null)

  useEffect(() => {
    const cached = getCached(vcId)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // インフライト重複排除
    let promise = inFlight.get(vcId)
    if (!promise) {
      promise = fetchGenome(vcId)
      inFlight.set(vcId, promise)
      promise.finally(() => inFlight.delete(vcId))
    }

    let cancelled = false
    promise
      .then(genome => {
        if (cancelled) return
        cacheGenome(vcId, genome)
        setData(genome)
        addRecentlyViewed({
          vcId,
          name:        genome.basic_info?.name ?? '',
          affiliation: genome.basic_info?.current_affiliation ?? '',
          alias:       genome.basic_info?.ai_generated_alias ?? '',
          confidence:  genome.metadata?.data_freshness_level ?? 'C',
          viewedAt:    Date.now(),
        })
      })
      .catch(err => {
        if (!cancelled) setError(err as Error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vcId])

  // 強制再取得（キャッシュバイパス）
  const revalidate = async () => {
    setLoading(true)
    setError(null)
    try {
      const genome = await fetchGenome(vcId)
      cacheGenome(vcId, genome)
      setData(genome)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, revalidate }
}
