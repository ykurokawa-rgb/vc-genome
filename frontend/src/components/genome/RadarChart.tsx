'use client'

import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

interface RadarData {
  strategy?: number
  empathy?: number
  network?: number
  expertise?: number
  speed?: number
}

export default function RadarChart({ data }: { data?: RadarData }) {
  const chartData = [
    { subject: '戦略性', value: data?.strategy ?? 0, fullMark: 10 },
    { subject: '共感力', value: data?.empathy ?? 0, fullMark: 10 },
    { subject: 'ネットワーク', value: data?.network ?? 0, fullMark: 10 },
    { subject: '専門性', value: data?.expertise ?? 0, fullMark: 10 },
    { subject: 'スピード', value: data?.speed ?? 0, fullMark: 10 },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RechartsRadar data={chartData}>
        <PolarGrid stroke="#1E1E2E" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B6B80', fontSize: 11 }} />
        <Radar name="genome" dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.3} strokeWidth={2} />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
