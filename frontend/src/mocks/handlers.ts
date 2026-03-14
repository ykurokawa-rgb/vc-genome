import { http, HttpResponse } from 'msw'

// ─── Mock Genome Data ─────────────────────────────────────────────────────────

const mockGenome = {
  vc_id: 'mock-001',
  basic_info: {
    name: '山田 太郎',
    current_affiliation: 'Example Ventures',
    ai_generated_alias: 'ディープテック番人',
  },
  metadata: {
    data_freshness_level: 'A',
    source_count: 12,
    last_updated: new Date().toISOString(),
  },
  investment_footprint: {
    total_funded_startups: 42,
    top_sectors: [
      { sector: 'SaaS / B2B', percentage: 45 },
      { sector: 'DeepTech',   percentage: 30 },
      { sector: 'AI / ML',    percentage: 25 },
    ],
    notable_exits: ['ExampleCo (IPO)', 'TechStartup (M&A)'],
    stage_focus: ['Seed', 'Series A'],
  },
  genome_stats: {
    keywords: ['誠実', '速い', '本気', 'ハンズオン', '採用支援'],
    core_philosophies: [
      {
        tag: '本質主義',
        evidence_quote: '技術の本質を見極め、10年後も価値を持つ事業にしか投資しない。',
        source: 'Forbes Japan 2024',
      },
    ],
    radar_estimates: {
      strategy:  82,
      empathy:   75,
      network:   90,
      expertise: 88,
      speed:     70,
    },
  },
  hands_on_dna: {
    intervention_style: 'Proactive',
    reputation_vibe: '誠実・熱心・本気',
    crisis_behavior: '困難な状況でも最後まで伴走する姿勢が評価されている。',
    weekly_interaction_simulation: '月曜10時にSlackでKPIを確認し、採用面談に同席することが多い。',
    specific_supports: [
      { type: 'Recruiting',  score: 9, description: '採用支援', evidence_count: 8 },
      { type: 'Sales_Intro', score: 8, description: '営業導入', evidence_count: 5 },
      { type: 'Mental',      score: 7, description: 'メンタルケア', evidence_count: 3 },
    ],
  },
  activity_insights: {
    current_focus_area: 'AI × SaaSの領域で次世代のインフラになれる企業を探している。',
    posting_frequency: 'weekly',
  },
}

const mockJobStatus = {
  job_id:   'mock-job-001',
  status:   'completed',
  vc_id:    'mock-001',
  progress: {
    fact_investigator:  { status: 'done', progress: 100, keywords: ['SaaS', 'AI', 'Seed'] },
    philosophy_profiler:{ status: 'done', progress: 100, keywords: ['本質主義', '長期視点'] },
    handson_analyst:    { status: 'done', progress: 100, keywords: ['採用支援', 'ハンズオン'] },
    freshness_guard:    { status: 'done', progress: 100, keywords: ['A評価', '12ソース'] },
  },
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // Genome detail
  http.get('/api/genome/:vcId', ({ params }) => {
    return HttpResponse.json({ ...mockGenome, vc_id: params.vcId as string })
  }),

  // Genome list
  http.get('/api/genome', () => {
    return HttpResponse.json({
      genomes: [mockGenome],
      total: 1,
    })
  }),

  // Genome create
  http.post('/api/genome/create', () => {
    return HttpResponse.json({ job_id: 'mock-job-001' }, { status: 202 })
  }),

  // Job status
  http.get('/api/genome/status/:jobId', () => {
    return HttpResponse.json(mockJobStatus)
  }),

  // Match simulate
  http.post('/api/match/simulate', () => {
    return HttpResponse.json({ job_id: 'mock-match-001' }, { status: 202 })
  }),

  http.get('/api/match/simulate/:jobId', () => {
    return HttpResponse.json({
      status: 'completed',
      results: [
        { vc_id: 'mock-001', name: '山田 太郎', match_score: 87, reason: 'SaaS × AI領域の専門性が高く、Seedステージの支援実績が豊富。' },
      ],
    })
  }),

  // Calendar demo
  http.get('/api/calendar/demo', () => {
    return HttpResponse.json({
      peak_times: ['火曜 10:00-12:00', '木曜 14:00-17:00'],
      blackout_dates: [],
      recommendation: '火曜の午前中が最も返信率が高い傾向があります。',
    })
  }),
]
