import type {
  CreateGenomeRequest,
  CreateGenomeResponse,
  JobStatus,
  VCGenome,
  GenomeSummary,
} from '@/types/genome'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ゲノム解析ジョブを作成する
export async function createGenome(data: CreateGenomeRequest): Promise<CreateGenomeResponse> {
  const res = await fetch(`${API_BASE}/api/genome/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(`Failed to create genome: ${res.status}`)
  }
  return res.json()
}

// ジョブステータスを取得する
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/genome/status/${jobId}`)
  if (!res.ok) {
    throw new Error(`Failed to get job status: ${res.status}`)
  }
  return res.json()
}

// ゲノムプロフィールを取得する
export async function getGenome(vcId: string): Promise<VCGenome> {
  const res = await fetch(`${API_BASE}/api/genome/${vcId}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Genome not found: ${res.status}`)
  }
  return res.json()
}

// ゲノム一覧を取得する
export async function listGenomes(): Promise<GenomeSummary[]> {
  const res = await fetch(`${API_BASE}/api/genome/`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    return []
  }
  return res.json()
}

// 信頼スコアを色クラスに変換する
export function getConfidenceColorClass(level: string): string {
  const map: Record<string, string> = {
    A: 'text-genome-green border-genome-green/40 bg-genome-green/10',
    'A-': 'text-genome-green border-genome-green/40 bg-genome-green/10',
    'B+': 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
    B: 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
    C: 'text-genome-muted border-genome-border bg-genome-card',
    D: 'text-genome-red border-genome-red/40 bg-genome-red/10',
  }
  return map[level] || 'text-genome-muted border-genome-border'
}

// 数値を日本語フォーマットに変換する
export function formatNumber(n: number): string {
  return n.toLocaleString('ja-JP')
}
