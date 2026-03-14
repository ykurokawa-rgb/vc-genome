import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'ダッシュボード', href: '/admin/dashboard', icon: '📊' },
  { label: '一括解析', href: '/admin/batch', icon: '⚡' },
  { label: 'セールスインテル', href: '/admin/sales-intel', icon: '🎯' },
  { label: 'データ品質', href: '/admin/data-quality', icon: '🔬' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-genome-dark flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-genome-card border-r border-genome-border flex flex-col fixed top-0 left-0 h-screen z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-genome-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-genome-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
              VG
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">VC Genome</div>
              <div className="text-xs text-genome-muted leading-tight">Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-genome-muted hover:text-genome-text hover:bg-genome-dark/60 transition-colors group"
            >
              <span className="text-base">{item.icon}</span>
              <span className="group-hover:text-genome-accent transition-colors">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-genome-border">
          <Link
            href="/"
            className="text-xs text-genome-muted hover:text-genome-text transition-colors"
          >
            ← サイトに戻る
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 min-h-screen">
        {children}
      </div>
    </div>
  )
}
