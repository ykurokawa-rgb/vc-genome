export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-genome-dark py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">プライバシーポリシー</h1>
          <p className="text-genome-muted text-sm">最終更新: 2026年3月</p>
        </div>
        <div className="glass rounded-2xl p-8 space-y-8 prose prose-invert max-w-none">
          {[
            {
              title: '1. 収集する情報',
              content: 'VC Genomeは、キャピタリストのプロフィール生成のために、Web上で公開されている情報（記事、SNS投稿、プレスリリース等）をAIが自動収集・解析します。登録時に入力いただいた名前・所属・URLも収集します。',
            },
            {
              title: '2. Googleカレンダーデータの取扱い',
              content: 'Googleカレンダーを連携した場合、予定タイトルのみを解析に使用します。予定の詳細・参加者・場所等は収集しません。解析完了後、カレンダーデータは即時破棄され、サーバーには保存されません。',
            },
            {
              title: '3. データの利用目的',
              content: 'プロフィールの生成・改善、マッチング精度の向上、StartPassのサービス品質向上のために使用します。第三者への販売は行いません。',
            },
            {
              title: '4. データの削除',
              content: 'ゲノムプロフィールの削除を希望する場合は、support@startpass.jp までご連絡ください。48時間以内に対応します。',
            },
            {
              title: '5. Cookieの使用',
              content: 'セッション管理および利用統計のためにCookieを使用します。ブラウザ設定からCookieを無効にすることができますが、一部機能が制限される場合があります。',
            },
            {
              title: '6. お問い合わせ',
              content: 'プライバシーに関するお問い合わせは support@startpass.jp までご連絡ください。',
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-genome-text mb-2">{section.title}</h2>
              <p className="text-genome-muted text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
