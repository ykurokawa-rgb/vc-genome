import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ vcId: string }> }) {
  try {
    const { vcId } = await params
    const res = await fetch(`${process.env.BACKEND_URL}/api/genome/${vcId}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Genome not found' }, { status: 404 })
  }
}
