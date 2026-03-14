import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VC Genome | 投資DNAを可視化する',
    short_name: 'VC Genome',
    description: 'AIがあなたの投資哲学・実績・伴走スタイルを自動解析し、世界最高精度のキャピタリストプロフィールを生成します',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A14',
    theme_color: '#6C63FF',
    orientation: 'portrait-primary',
    categories: ['business', 'finance', 'productivity'],
    lang: 'ja',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'ゲノム解析を開始',
        short_name: '新規解析',
        description: '新しいVCゲノムを解析する',
        url: '/genome/entry',
      },
      {
        name: '投資家を探す',
        short_name: '投資家検索',
        description: 'マッチングで最適な投資家を見つける',
        url: '/match/discover',
      },
    ],
  }
}
