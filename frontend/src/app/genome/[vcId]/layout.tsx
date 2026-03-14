import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { GenomeHeader } from '@/components/genome/GenomeHeader'
import { GenomeTabNav } from '@/components/genome/GenomeTabNav'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ShareButton } from '@/components/ui/ShareButton'

async function getGenomeBasic(vcId: string) {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/genome/${vcId}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ─── タブコンテンツのスケルトン ────────────────────────────────────────────────

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-genome-card rounded-2xl" />
      <div className="h-32 bg-genome-card rounded-2xl" />
      <div className="h-24 bg-genome-card rounded-2xl" />
    </div>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function GenomeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ vcId: string }>
}) {
  const { vcId } = await params
  const genome = await getGenomeBasic(vcId)
  if (!genome) notFound()

  const name    = genome.basic_info?.name ?? ''
  const affil   = genome.basic_info?.current_affiliation ?? ''
  const alias   = genome.basic_info?.ai_generated_alias ?? ''
  const level   = genome.metadata?.data_freshness_level ?? 'C'
  const sources = genome.metadata?.source_count ?? 0

  return (
    <main className="min-h-screen bg-genome-dark">
      {/* ─── Top Nav ─── */}
      <nav className="border-b border-genome-border glass-strong fixed top-0 left-0 right-0 z-sticky">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-105">
              VG
            </div>
            <span className="font-bold">VC Genome</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* シェアボタン（Client Component） */}
            <ShareButton vcId={vcId} name={name} />
            <Link
              href={`/genome/${vcId}/calibrate`}
              className="text-sm text-genome-muted hover:text-genome-text transition-colors"
            >
              プロフィールを修正する
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* ─── Profile Header ─── */}
        <div className="border-b border-genome-border bg-genome-card/60">
          <GenomeHeader
            vcId={vcId}
            name={name}
            affil={affil}
            alias={alias}
            level={level}
            sources={sources}
          />

          {/* ─── Tab Nav ─── */}
          <div className="max-w-5xl mx-auto px-6">
            <GenomeTabNav vcId={vcId} />
          </div>
        </div>

        {/* ─── Page Content (ErrorBoundary + Suspense) ─── */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <ErrorBoundary>
            <Suspense fallback={<TabSkeleton />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </main>
  )
}
