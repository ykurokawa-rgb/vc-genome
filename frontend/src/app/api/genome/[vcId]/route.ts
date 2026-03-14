import { NextRequest, NextResponse } from 'next/server'

const DEMO_DATA: Record<string, unknown> = {
  'demo-001': {
    basic_info: { name: '田中 健一', current_affiliation: 'グローバル・ベンチャーズ株式会社', ai_generated_alias: 'The Catalyst' },
    metadata: { data_freshness_level: 'A', source_count: 12 },
    genome_stats: {
      radar_chart: { leadership: 88, technology: 72, network: 95, execution: 80, vision: 90 },
      core_philosophies: [
        { title: 'チームファースト', description: 'プロダクトより先にチームの質を見る', strength: 'high' },
        { title: 'グローバル思考', description: '初期から海外展開を前提とした戦略を重視', strength: 'high' },
        { title: '長期コミット', description: '5年以上の長期的な関与を約束', strength: 'medium' },
      ],
    },
    investment_footprint: {
      total_funded_startups: 34,
      top_sectors: [{ sector: 'SaaS', percentage: 45 }, { sector: 'AI/ML', percentage: 30 }, { sector: 'FinTech', percentage: 25 }],
      stage_distribution: { Seed: 60, PreA: 40 },
    },
    hands_on_dna: {
      specific_supports: [
        { type: '採用支援', description: 'CTO・エンジニア採用ネットワーク提供', frequency: 'high' },
        { type: '海外展開', description: 'USおよびSEAの投資家紹介', frequency: 'high' },
        { type: '資金調達', description: '次ラウンドの投資家候補紹介', frequency: 'medium' },
      ],
    },
  },
  'demo-002': {
    basic_info: { name: '山本 浩二', current_affiliation: 'スカイライン・キャピタル', ai_generated_alias: 'The Architect' },
    metadata: { data_freshness_level: 'A-', source_count: 9 },
    genome_stats: {
      radar_chart: { leadership: 75, technology: 90, network: 70, execution: 85, vision: 82 },
      core_philosophies: [
        { title: 'テック深耕', description: '技術的優位性のあるスタートアップに特化', strength: 'high' },
        { title: 'B2B重視', description: 'エンタープライズ向けSaaSを中心に投資', strength: 'high' },
      ],
    },
    investment_footprint: {
      total_funded_startups: 22,
      top_sectors: [{ sector: 'B2B SaaS', percentage: 60 }, { sector: 'DeepTech', percentage: 40 }],
      stage_distribution: { Seed: 40, PreA: 60 },
    },
    hands_on_dna: {
      specific_supports: [
        { type: '技術顧問', description: 'CTO候補の紹介・技術戦略のレビュー', frequency: 'high' },
        { type: 'エンタープライズ営業', description: '大手企業への導入支援', frequency: 'medium' },
      ],
    },
  },
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ vcId: string }> }) {
  const { vcId } = await params
  if (DEMO_DATA[vcId]) return NextResponse.json(DEMO_DATA[vcId])
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/genome/${vcId}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Genome not found' }, { status: 404 })
  }
}
