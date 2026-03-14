import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    focus_areas: [
      { area: '物流DX面談', percentage: 35, event_count: 12, insight: '新規ソーシング活発' },
      { area: 'AI採用支援', percentage: 25, event_count: 8, insight: '既存投資先を全力支援' },
      { area: '新規ソーシング', percentage: 20, event_count: 7, insight: '幅広く探索中' },
      { area: 'LP対応', percentage: 15, event_count: 5, insight: '期末報告シーズン' },
      { area: 'その他', percentage: 5, event_count: 3, insight: '' },
    ],
    current_top_focus: '物流DX × AI',
    sourcing_vs_handson: { sourcing: 55, handson: 30, operations: 15 },
    activity_summary: '直近30日は物流DX領域の新規面談が急増。既存投資先の採用支援にも積極的に工数を割いている。',
    next_move_prediction: '素材×AI領域への参入を検討中の可能性が高い',
  })
}
