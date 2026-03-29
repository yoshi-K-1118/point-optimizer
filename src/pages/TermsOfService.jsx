export default function TermsOfService() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">利用規約</h1>
        <p className="page-sub mt-1">最終更新日：2026年3月29日</p>
      </div>

      <div className="card p-6 space-y-6 text-sm text-slate-700 leading-relaxed">

        <section>
          <p>本利用規約（以下「本規約」）は、「ポイント最適化」（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様には、本規約に同意いただいた上で本サービスをご利用いただきます。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第1条（適用）</h2>
          <p>本規約は、ユーザーと本サービス運営者との間の本サービスの利用に関わる一切の関係に適用されます。本サービスを利用した時点で、本規約に同意したものとみなします。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第2条（利用登録）</h2>
          <p>現在の無料プランでは、利用登録なしにサービスをご利用いただけます。将来的に有料プランを導入した場合、所定の方法により利用登録を行っていただきます。運営者が登録を不適切と判断した場合、登録を拒否することがあります。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第3条（料金・有料プラン）</h2>
          <p>現在、本サービスは無料でご利用いただけます。将来的に有料プランを導入する場合は、事前にサービス上でお知らせします。有料プランの料金・支払い方法・解約条件等については、導入時に別途定める規約によります。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第4条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり以下の行為を行ってはなりません。</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスのサーバーへの不正アクセス・過負荷をかける行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーまたは第三者に不利益・損害を与える行為</li>
            <li>本サービスのコンテンツを無断で複製・転載・改変する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第5条（本サービスの提供の停止等）</h2>
          <p>運営者は、以下の場合に事前通知なく本サービスの全部または一部の提供を停止・中断することができます。</p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
            <li>システムの保守・更新を行う場合</li>
            <li>地震・火災・停電等の不可抗力により提供が困難な場合</li>
            <li>コンピュータ・通信回線等が障害により停止した場合</li>
            <li>その他、運営者が停止・中断を必要と判断した場合</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第6条（著作権）</h2>
          <p>本サービスに掲載されているコンテンツ（テキスト・デザイン・ロゴ等）の著作権は運営者に帰属します。ユーザーは個人的な利用目的以外でこれらを無断で使用することはできません。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第7条（免責事項）</h2>
          <p>本サービスは情報提供を目的としており、掲載情報の正確性・完全性を保証しません。本サービスの利用により生じた損害について、運営者は一切の責任を負いません。詳細は<a href="/disclaimer" className="text-blue-600 underline">免責事項</a>をご確認ください。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第8条（サービス内容の変更等）</h2>
          <p>運営者は、ユーザーへの事前通知なく本サービスの内容を変更・追加・削除することができます。また、本サービスの提供を終了することができます。これによってユーザーに生じた損害について、運営者は一切の責任を負いません。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第9条（利用規約の変更）</h2>
          <p>運営者は、必要に応じて本規約を変更することができます。変更後の規約は、本サービス上に掲載した時点から効力を生じます。変更後も本サービスを利用継続した場合、変更後の規約に同意したものとみなします。</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">第10条（準拠法・管轄裁判所）</h2>
          <p>本規約の解釈については日本法を準拠法とし、本サービスに関する一切の紛争については、日本の裁判所を専属的合意管轄裁判所とします。</p>
        </section>

      </div>
    </div>
  );
}
