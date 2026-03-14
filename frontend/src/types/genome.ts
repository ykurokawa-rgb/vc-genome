// VC Genome 型定義

export interface RadarData {
  strategy: number
  empathy: number
  network: number
  expertise: number
  speed: number
}

export interface Sector {
  sector: string
  percentage: number
}

export interface Philosophy {
  tag: string
  evidence_quote: string
  source_url?: string
  source_description?: string
}

export interface Support {
  type: SupportType
  score: number
  description: string
  evidence_count?: number
}

export type SupportType = 'Recruiting' | 'Sales_Intro' | 'Mental' | 'Finance' | 'PR'

export type ConfidenceLevel = 'A' | 'A-' | 'B+' | 'B' | 'C' | 'D'

export type InterventionStyle = 'Proactive' | 'Supportive' | 'Observer'

export interface GenomeBasicInfo {
  name: string
  current_affiliation: string
  ai_generated_alias: string
  sns_links: Record<string, string>
}

export interface GenomeMetadata {
  overall_confidence_score: number
  data_freshness_level: ConfidenceLevel
  analysis_version: string
  source_count: number
  next_refresh_date?: string
}

export interface GenomeStats {
  radar_chart: RadarData
  core_philosophies: Philosophy[]
  keywords: string[]
}

export interface InvestmentFootprint {
  total_funded_startups: number
  top_sectors: Sector[]
  stage_distribution: Record<string, number>
  notable_exits: string[]
}

export interface HandsOnDNA {
  intervention_style: InterventionStyle
  specific_supports: Support[]
  reputation_vibe: string
  weekly_interaction_simulation: string
}

export interface AuditLog {
  conflicting_data: Array<{ issue: string; resolution: string }>
  audit_notes: string
}

export interface VCGenome {
  basic_info: GenomeBasicInfo
  metadata: GenomeMetadata
  genome_stats: GenomeStats
  investment_footprint: InvestmentFootprint
  hands_on_dna: HandsOnDNA
  audit_log: AuditLog
}

// Job / Agent 型定義

export type AgentStatusType = 'pending' | 'running' | 'done' | 'error'

export interface AgentStatus {
  name: string
  role: string
  icon: string
  status: AgentStatusType
  progress: number
  logs: string[]
}

export type JobStatusType = 'running' | 'completed' | 'failed'

export interface JobStatus {
  status: JobStatusType
  vcId?: string
  agents: AgentStatus[]
  keywords: string[]
}

// API Request 型定義

export interface CreateGenomeRequest {
  name: string
  affiliation: string
  urls: string[]
  philosophy: string
}

export interface CreateGenomeResponse {
  jobId: string
  status: string
}

// Genome Summary (一覧表示用)

export interface GenomeSummary {
  id: string
  name: string
  affiliation: string
  ai_generated_alias: string
  confidence: ConfidenceLevel
  created_at: string | null
}
