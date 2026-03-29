export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">プライバシーポリシー</h1>
        <p className="page-sub mt-1">最終更新日：2026年3月29日</p>
      </div>

      <div className="card p-6 space-y-6 text-sm text-slate-700 leading-relaxed">

        <section>
          <p>
            本サービス「ポイント最適化」（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の適切な取り扱いに努めます。本プライバシーポリシーは、本サービスにおける個人情報の取り扱いについて説明します。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">1. 収集する情報</h2>

          <h3 className="font-semibold text-slate-700 mb-1">【現在の無料プラン】</h3>
          <p>
            現在の無料プランでは、本サービスはユーザーの個人情報を収集・保存しません。入力されたポイント残高・期限等のデータは、ユーザーのブラウザのローカルストレージにのみ保存され、外部サーバーには送信されません。
          </p>

          <h3 className="font-semibold text-slate-700 mt-4 mb-1">【将来の有料プラン（導入予定）】</h3>
          <p>有料プランを導入した場合、以下の情報を収集する場合があります。</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
            <li>氏名・メールアドレス（アカウント登録時）</li>
            <li>決済情報（クレジットカード番号等）※決済代行会社が管理</li>
            <li>サービス利用履歴・ログデータ</li>
            <li>お問い合わせ内容</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">2. ローカルストレージについて</h2>
          <p>
            本サービスは、ユーザーが入力したポイント残高・有効期限などのデータを、ユーザーのブラウザのローカルストレージに保存します。このデータは当該端末・ブラウザにのみ存在し、本サービスのサーバーには送信・保存されません。
          </p>
          <p className="mt-2">
            ローカルストレージのデータは、ブラウザのキャッシュ・データ削除により消去されます。データの管理はユーザー自身の責任において行われます。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">3. Cookie・アクセス解析について</h2>
          <p>
            本サービスはGoogle AdSenseを利用しており、広告配信のためにCookieが使用される場合があります。Cookieによって収集される情報は広告の最適化に使用され、個人を特定するものではありません。
          </p>
          <p className="mt-2">
            Cookieの使用を希望しない場合は、ブラウザの設定からCookieを無効にすることができます。ただし、一部の機能が正常に動作しない場合があります。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">4. 広告について</h2>
          <p>
            本サービスはGoogle AdSenseによる広告を掲載しています。Googleは、ユーザーの興味に基づいた広告を表示するためにCookieを使用する場合があります。Googleのプライバシーポリシーについては、
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 underline ml-0.5">Google プライバシーポリシー</a>
            をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">5. アフィリエイトについて</h2>
          <p>
            本サービスは各種アフィリエイトプログラムに参加しています。アフィリエイトリンクをクリックした場合、提携先のASP（アフィリエイトサービスプロバイダ）において、クリック・成果情報がトラッキングされる場合があります。これらの情報はASPの規約に従って管理されます。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">6. 第三者への情報提供</h2>
          <p>本サービスは、以下の場合を除き、ユーザーの情報を第三者に提供しません。</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づき開示が必要な場合</li>
            <li>人の生命・身体・財産の保護のために必要な場合</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">7. 有料プラン導入時の追加事項（予定）</h2>
          <p>将来的に有料プランを導入した場合、以下の対応を行う予定です。</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
            <li>収集した個人情報はサービス提供・決済処理・ユーザーサポートのみに使用</li>
            <li>決済情報は決済代行会社（Stripe等）が管理し、本サービスは保持しない</li>
            <li>ユーザーはアカウント削除により、保存されたデータの削除を請求できる</li>
            <li>個人情報の開示・訂正・削除の請求に対応する窓口を設置</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">8. 未成年者の利用について</h2>
          <p>
            本サービスは13歳未満の方の利用を想定しておりません。13歳未満の方が本サービスを利用される場合は、保護者の同意のもとでご利用ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">9. プライバシーポリシーの変更</h2>
          <p>
            本プライバシーポリシーは、法令の改正やサービス内容の変更に伴い、予告なく変更される場合があります。変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。重要な変更がある場合は、本サービス上でお知らせします。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">10. お問い合わせ</h2>
          <p>
            本プライバシーポリシーに関するお問い合わせは、本サービス内のお問い合わせフォームよりご連絡ください。
          </p>
        </section>

      </div>
    </div>
  );
}
