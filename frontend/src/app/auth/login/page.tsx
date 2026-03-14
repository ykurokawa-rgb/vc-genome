import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-genome-dark flex items-center justify-center px-6">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(108,99,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-genome-accent rounded-xl flex items-center justify-center text-white font-bold">
              VG
            </div>
            <span className="text-xl font-bold text-genome-text">VC Genome</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">ログイン</h1>
          <p className="text-genome-muted text-sm">アカウントにサインインしてください</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 space-y-4">
          {/* Google OAuth Button */}
          <button
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium px-6 py-3.5 rounded-xl transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-genome-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-genome-card px-3 text-genome-muted">または</span>
            </div>
          </div>

          {/* Email form (placeholder) */}
          <div className="space-y-3">
            <input
              type="email"
              placeholder="メールアドレス"
              className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors"
            />
            <input
              type="password"
              placeholder="パスワード"
              className="w-full bg-genome-dark border border-genome-border rounded-xl px-4 py-3 text-genome-text placeholder-genome-muted focus:outline-none focus:border-genome-accent transition-colors"
            />
            <button className="w-full bg-genome-accent hover:bg-genome-accent-hover text-white font-bold py-3 rounded-xl transition-colors">
              ログイン
            </button>
          </div>

          <p className="text-center text-xs text-genome-muted">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/register" className="text-genome-accent hover:underline">
              新規登録
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-genome-muted mt-6">
          ログインすることで
          <a href="#" className="text-genome-accent hover:underline mx-1">利用規約</a>
          および
          <a href="#" className="text-genome-accent hover:underline mx-1">プライバシーポリシー</a>
          に同意します
        </p>
      </div>
    </main>
  )
}
