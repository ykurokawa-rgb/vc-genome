import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  const res = await fetch(
    `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/match/simulate/${jobId}`,
    { cache: 'no-store' }
  )
  return NextResponse.json(await res.json())
}
