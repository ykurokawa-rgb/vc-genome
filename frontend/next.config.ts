import type { NextConfig } from 'next'

// ─── セキュリティヘッダー ──────────────────────────────────────────────────────

const SECURITY_HEADERS = [
  // クリックジャッキング防止
  { key: 'X-Frame-Options',        value: 'DENY' },
  // MIMEスニッフィング防止
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // XSS保護（レガシーブラウザ向け）
  { key: 'X-XSS-Protection',       value: '1; mode=block' },
  // リファラーポリシー
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
  // 不要なブラウザ機能の無効化
  { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
  // DNS プリフェッチ制御
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

// ─── Next.js Config ───────────────────────────────────────────────────────────

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'vcgenome.startpass.jp',
      ],
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
      // API ルートには CORS 設定を追加
      {
        source: '/api/(.*)',
        headers: [
          ...SECURITY_HEADERS,
          { key: 'Access-Control-Allow-Origin',  value: process.env.NEXT_PUBLIC_SITE_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // 画像最適化ドメイン許可
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
    ],
  },
}

export default nextConfig
