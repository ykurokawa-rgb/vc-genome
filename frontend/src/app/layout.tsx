import type { Metadata } from 'next'
import './globals.css'
import BetaBanner from '@/components/ui/BetaBanner'
import OnboardingModal from '@/components/onboarding/OnboardingModal'

export const metadata: Metadata = {
  title: 'VC Genome | 投資DNAを可視化する',
  description: 'AIがあなたの投資哲学・実績・伴走スタイルを自動解析し、世界最高精度のキャピタリストプロフィールを生成します',
  openGraph: {
    title: 'VC Genome',
    description: '日本のVC業界に解像度革命を。',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-genome-dark text-genome-text antialiased">
        <OnboardingModal />
        {children}
        <BetaBanner />
      </body>
    </html>
  )
}
