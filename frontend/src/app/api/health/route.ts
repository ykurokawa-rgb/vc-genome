import { NextResponse } from 'next/server'

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'

  let backendStatus = 'unknown'
  try {
    const res = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(3000) })
    const data = await res.json()
    backendStatus = data.status === 'ok' ? 'healthy' : 'degraded'
  } catch {
    backendStatus = 'unreachable'
  }

  return NextResponse.json({
    status: backendStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '0.3.0-beta',
    services: {
      frontend: 'healthy',
      backend: backendStatus,
    }
  }, {
    status: backendStatus === 'healthy' ? 200 : 503
  })
}
