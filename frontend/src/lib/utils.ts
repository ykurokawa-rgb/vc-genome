import { clsx, type ClassValue } from 'clsx'

// Tailwind クラス結合ユーティリティ
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// 日付を日本語フォーマットに変換する
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 信頼スコア（0.0〜1.0）をパーセント表示に変換する
export function formatConfidenceScore(score: number): string {
  return `${Math.round(score * 100)}点`
}

// レーダーチャートの軸ラベル
export const RADAR_LABELS: Record<string, string> = {
  strategy: '戦略性',
  empathy: '共感力',
  network: 'ネットワーク',
  expertise: '専門性',
  speed: 'スピード',
}

// 伴走スタイルの日本語ラベル
export const INTERVENTION_STYLE_LABELS: Record<string, string> = {
  Proactive: '積極伴走型',
  Supportive: 'サポート型',
  Observer: 'オブザーバー型',
}

// サポートタイプのアイコン
export const SUPPORT_ICONS: Record<string, string> = {
  Recruiting: '🏃',
  Sales_Intro: '💼',
  Mental: '🧠',
  Finance: '💰',
  PR: '🌐',
}

// サポートタイプの日本語ラベル
export const SUPPORT_LABELS: Record<string, string> = {
  Recruiting: '採用支援',
  Sales_Intro: '営業導入',
  Mental: 'メンタルケア',
  Finance: 'ファイナンス',
  PR: 'PR・広報',
}

// 信頼レベルの色クラス
export const CONFIDENCE_COLORS: Record<string, string> = {
  A: 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'A-': 'text-genome-green border-genome-green/40 bg-genome-green/10',
  'B+': 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  B: 'text-genome-gold border-genome-gold/40 bg-genome-gold/10',
  C: 'text-genome-muted border-genome-border bg-genome-card',
  D: 'text-genome-red border-genome-red/40 bg-genome-red/10',
}
