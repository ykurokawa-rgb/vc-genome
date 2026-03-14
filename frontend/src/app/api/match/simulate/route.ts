import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const res = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/match/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return NextResponse.json(await res.json())
}

export async function GET() {
  return NextResponse.json({ simulations: [] })
}
