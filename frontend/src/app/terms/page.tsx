export default function TermsPage() {
  return (
    <main className="min-h-screen bg-genome-dark py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">利用規約</h1>
          <p className="text-genome-muted text-sm">最終更新: 2026年3月</p>
        </div>
        <div className="glass rounded-2xl p-8 space-y-8 prose prose-invert max-w-none">
          {[
            {
              title: '1. サービスの概要',
              content: 'VC Genome（以下「本サービス」）は、StartPass, Inc.（以下「当社」）が提供するAIを活用したVCキャピタリストプロフィール生成・マッチングプラットフォームです。本規約に同意いただいた上でご利用ください。',
            },
            {
              title: '2. 利用資格',
              content: '本サービスは18歳以上の方を対象としています。法人としてご利用の場合は、適切な権限を持つ担当者が登録を行ってください。利用登録により、本規約に同意したものとみなします。',
            },
            {
              title: '3. 禁止事項',
              content: '以下の行為を禁止します：(1) 虚偽情報の登録、(2) 他者になりすましての利用、(3) 本サービスの逆コンパイル・リバースエンジニアリング、(4) スクレイピング等による大量データ取得、(5) 法令に違反する行為、(6) 当社または第三者の権利を侵害する行為。',
            },
            {
              title: '4. 知的財産権',
              content: '本サービスおよびAIが生成したコンテンツに関する著作権・その他知的財産権は当社に帰属します。ユーザーが入力した情報の権利はユーザーに帰属しますが、サービス改善目的での利用を許諾いただくものとします。',
            },
            {
              title: '5. 免責事項',
              content: 'AIが生成するプロフィール情報は参考情報であり、正確性を保証するものではありません。当社は、本サービスの利用により生じた損害について、法令上の責任を除き一切の責任を負いません。',
            },
            {
              title: '6. サービスの変更・停止',
              content: '当社は、ユーザーへの事前通知なく本サービスの内容を変更・停止する場合があります。ただし、重大な変更については可能な限り事前にお知らせします。',
            },
            {
              title: '7. 準拠法',
              content: '本規約は日本法に準拠し、本サービスに関する紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。',
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
