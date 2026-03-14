import Link from 'next/link'

interface NavbarProps {
  showCTA?: boolean
}

export default function Navbar({ showCTA = true }: NavbarProps) {
  return (
    <nav className="border-b border-genome-border glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
            VG
          </div>
          <span className="font-bold text-genome-text">VC Genome</span>
          <span className="text-xs text-genome-muted ml-1 border border-genome-border px-2 py-0.5 rounded-full hidden sm:block">
            by StartPass
          </span>
        </Link>

        {/* Nav links */}
        {showCTA && (
          <div className="flex items-center gap-4">
            <Link
              href="/genome/list"
              className="text-sm text-genome-muted hover:text-genome-text transition-colors hidden sm:block"
            >
              ゲノム一覧
            </Link>
            <Link
              href="/match/discover"
              className="text-sm text-genome-muted hover:text-genome-text transition-colors hidden sm:block"
            >
              投資家を探す
            </Link>
            <Link
              href="/genome/entry"
              className="text-sm text-genome-muted hover:text-genome-text transition-colors hidden sm:block"
            >
              解析する
            </Link>
            <Link
              href="/auth/login"
              className="text-sm bg-genome-accent hover:bg-genome-accent-hover text-white px-4 py-2 rounded-lg transition-colors"
            >
              ログイン
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
