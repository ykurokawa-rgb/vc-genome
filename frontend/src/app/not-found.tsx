import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-genome-dark flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🧬</div>
        <h1 className="text-3xl font-bold mb-3">ゲノムが見つかりません</h1>
        <p className="text-genome-muted mb-8">このURLのプロフィールは存在しないか、まだ解析中です。</p>
        <Link href="/" className="bg-genome-accent hover:bg-genome-accent-hover text-white px-6 py-3 rounded-xl transition-colors">
          トップに戻る
        </Link>
      </div>
    </main>
  )
}
