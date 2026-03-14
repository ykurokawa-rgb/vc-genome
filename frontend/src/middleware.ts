import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── セキュリティヘッダー（Edge Runtime で付与）─────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options':        'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection':       '1; mode=block',
  'Referrer-Policy':        'strict-origin-when-cross-origin',
  // Strict-Transport-Security（HTTPS 本番環境向け）
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ── セキュリティヘッダー付与
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  // ── /admin 保護: admin-key Cookie が一致しない場合はトップへリダイレクト
  if (pathname.startsWith('/admin')) {
    const adminKey   = request.cookies.get('admin-key')?.value
    const expectedKey = process.env.ADMIN_KEY

    if (!expectedKey || adminKey !== expectedKey) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ── /genome/list の旧パス /genome/ へのアクセスを正規化
  if (pathname === '/genome') {
    return NextResponse.redirect(new URL('/genome/list', request.url))
  }

  return response
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// 静的ファイル・_next 内部ルートは除外

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.json).*)',
  ],
}
