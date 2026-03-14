import type { Metadata, Viewport } from 'next'
import './globals.css'
import BetaBanner from '@/components/ui/BetaBanner'
import OnboardingModal from '@/components/onboarding/OnboardingModal'
import { ClientProviders } from '@/components/providers/ClientProviders'

// ─── サイトURL ─────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vcgenome.startpass.jp'

// ─── メタデータ ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  'VC Genome | 投資DNAを可視化する',
    template: '%s | VC Genome',
  },
  description:
    'AIがあなたの投資哲学・実績・伴走スタイルを自動解析し、世界最高精度のキャピタリストプロフィールを生成します。日本のVC業界に解像度革命を。',

  keywords: [
    'VC', 'ベンチャーキャピタル', '投資家', 'スタートアップ', 'マッチング',
    'AI', 'ゲノム', 'StartPass', 'キャピタリスト', '伴走', '投資哲学',
  ],

  authors:   [{ name: 'StartPass', url: SITE_URL }],
  creator:   'StartPass',
  publisher: 'StartPass',

  // ── Open Graph
  openGraph: {
    type:        'website',
    locale:      'ja_JP',
    url:         SITE_URL,
    siteName:    'VC Genome',
    title:       'VC Genome | 投資DNAを可視化する',
    description: 'AIがあなたの投資哲学・実績・伴走スタイルを自動解析。日本のVC業界に解像度革命を。',
  },

  // ── Twitter / X
  twitter: {
    card:        'summary_large_image',
    site:        '@startpass_jp',
    creator:     '@startpass_jp',
    title:       'VC Genome | 投資DNAを可視化する',
    description: 'AIがあなたの投資哲学・実績・伴走スタイルを自動解析。日本のVC業界に解像度革命を。',
  },

  // ── クローラー設定
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  // ── カテゴリ
  category: 'technology',
}

// ── ビューポート・テーマカラー（Metadataとは分離して export）
export const viewport: Viewport = {
  themeColor:   '#6C63FF',
  colorScheme:  'dark',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// ─── Root Layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-genome-dark text-genome-text antialiased">
        <ClientProviders>
          <OnboardingModal />
          {children}
          <BetaBanner />
        </ClientProviders>
      </body>
    </html>
  )
}
