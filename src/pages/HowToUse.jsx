import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, TrendingUp, Bell, Calculator,
  ChevronDown, ChevronUp, ArrowRight, CheckCircle2,
} from 'lucide-react';

/* ── データ定義 ── */

const STEPS = [
  {
    step: 1,
    icon: Wallet,
    color: '#2563eb',
    bg: 'from-blue-500 to-blue-600',
    title: 'ポイント残高を登録する',
    to: '/points',
    summary: '各ポイントプログラムの現在の残高・期限間近ポイント・有効期限を入力します。',
    details: [
      { label: '残高の入力', body: '「ポイント管理」ページを開き、登録したいプログラムのカード右上の編集アイコンをタップします。残高欄に現在のポイント数を入力して「保存」を押してください。' },
      { label: '期限間近ポイントの入力', body: '有効期限が近づいているポイントが別途ある場合は「期限間近」欄にも入力します。これによって期限アラートの金額が正確になります。' },
      { label: '有効期限の設定', body: '「有効期限」欄に期限切れ日を入力すると、残り日数が表示され、30日以内になるとアラートページで警告されます。' },
      { label: 'ソート・フィルター', body: '画面上部のタブで「保有中」「期限間近」に絞り込み、ドロップダウンで「残高多い順」「期限近い順」などに並べ替えができます。' },
    ],
  },
  {
    step: 2,
    icon: LayoutDashboard,
    color: '#7c3aed',
    bg: 'from-violet-500 to-violet-600',
    title: 'ダッシュボードで全体を把握する',
    to: '/dashboard',
    summary: '全プログラムの合計資産価値・内訳グラフ・開催中キャンペーンを一覧できます。',
    details: [
      { label: '合計資産価値', body: 'ページ上部のヒーローバナーに、全ポイントを円換算した合計金額が表示されます。1ポイント = 1円で計算（ANAマイル・JALマイルは1マイル = 2円換算）。' },
      { label: 'ポイント内訳グラフ', body: 'ドーナツグラフで各プログラムの割合が確認できます。ホバーすると詳細な数値が表示されます。' },
      { label: '残高推移グラフ', body: '残高を更新するたびに履歴が蓄積され、7件以上になると折れ線グラフに切り替わります。ポイントの増減トレンドが一目でわかります。' },
      { label: '開催中キャンペーン', body: '現在有効なキャンペーン情報を表示します。乗算倍率と残り日数を確認して、お得なタイミングで利用しましょう。' },
    ],
  },
  {
    step: 3,
    icon: TrendingUp,
    color: '#059669',
    bg: 'from-emerald-500 to-emerald-600',
    title: '最適な交換・利用先を確認する',
    to: '/strategy',
    summary: '保有ポイントをどのプログラムに交換すると最も価値が高まるかをランキングで提示します。',
    details: [
      { label: '交換戦略タブ', body: '現在の残高を元に、交換後の推定価値を計算してランキング表示します。各カードを展開すると損益・交換レートの詳細が確認できます。プログラムフィルターで特定のプログラムだけ絞り込めます。' },
      { label: '損益バッジの見方', body: '緑の「+X%」は交換後に価値が増えることを意味します。マイル交換は一見ポイントが半減しますが、特典航空券として使うと1マイル≒2〜3円の価値になります。' },
      { label: 'おすすめ利用先タブ', body: '各ポイントプログラムの主な使い道を一覧できます。保有中のプログラムのみ表示するので、自分に関係のある情報に絞られます。' },
      { label: '残高一覧タブ', body: '全プログラムの残高・円換算・有効期限を一覧できるテーブルです。未保有のプログラムは薄く表示されます。' },
    ],
  },
  {
    step: 4,
    icon: Bell,
    color: '#d97706',
    bg: 'from-amber-500 to-amber-600',
    title: '期限アラートで失効を防ぐ',
    to: '/alerts',
    summary: '有効期限を設定したポイントは、残り日数に応じて「緊急」「注意」などに自動分類されます。',
    details: [
      { label: 'アラートの種類', body: '期限切れ（赤）・緊急 7日以内（オレンジ）・注意 30日以内（黄）・通常 30日超（青）の4段階で色分けされます。' },
      { label: '失効リスク額', body: '緊急・注意のポイントを円換算した「失効リスク額」がサマリーカードに表示されます。どれだけの価値が危機にさらされているかが一目でわかります。' },
      { label: '推奨アクション', body: '各アラートカードの「交換戦略を確認する」リンクから、最適化戦略ページへ直接移動できます。期限前に交換や利用を済ませましょう。' },
      { label: '期限未設定の確認', body: 'ページ下部に「有効期限が未設定のプログラム」が表示されます。ポイント管理ページで期限を設定することで、アラートが機能するようになります。' },
    ],
  },
  {
    step: 5,
    icon: Calculator,
    color: '#7c3aed',
    bg: 'from-purple-500 to-purple-600',
    title: 'シミュレーターで将来を予測する',
    to: '/simulator',
    summary: '月間支出を入力すると、各ポイントプログラムで何ポイント貯まるかをシミュレーションします。',
    details: [
      { label: 'プリセットの活用', body: '「標準家庭」「ネット通販派」「ドライバー」「外食多め」の4プリセットから近い支出パターンを選ぶと、すぐに比較できます。' },
      { label: '月間支出の入力', body: 'コンビニ・スーパー・飲食店・ネット通販など7カテゴリの月間支出を入力します。ページ上部に合計金額がリアルタイムで表示されます。' },
      { label: 'グラフの見方', body: '「比較」ビューは棒グラフで各プログラムの獲得ポイントを比較。「推移」ビューは上位4プログラムの累計ポイントを折れ線グラフで確認できます。' },
      { label: 'カテゴリ別おすすめカード', body: 'ページ下部に「コンビニは Vポイント が最高還元」などカテゴリごとの最適なカードが表示されます。日々の支払いカード選びの参考にしてください。' },
    ],
  },
];

const FAQ = [
  {
    q: 'データはどこに保存されますか？',
    a: 'すべてのデータはお使いのブラウザの localStorage に保存されます。サーバーへの送信は一切行いません。ただし、ブラウザのキャッシュ削除や別デバイスからのアクセスではデータが引き継がれません。',
  },
  {
    q: 'ポイントの自動取得はできますか？',
    a: '現在は手動入力のみ対応しています。各ポイントサービスのアプリやWebサイトで残高を確認し、定期的に手動で更新してください。',
  },
  {
    q: '交換レートは最新ですか？',
    a: '交換レートは主要な標準レートをもとに設定していますが、実際のレートはキャンペーンや時期によって変動することがあります。交換前に必ず各サービスの公式サイトで最新情報をご確認ください。',
  },
  {
    q: 'マイルの価値はなぜ2円換算ですか？',
    a: '特典航空券として利用した場合の平均的な価値として1マイル≒2円を採用しています。実際には路線・クラス・時期によって1〜5円以上の価値になることもあります。現金購入の代替として使う場合の参考値です。',
  },
  {
    q: 'キャンペーン情報はいつ更新されますか？',
    a: 'キャンペーン情報はアプリ内に静的に記載されており、自動更新は行われません。最新のキャンペーンは各ポイントサービスの公式サイトをご確認ください。',
  },
  {
    q: '対応していないポイントプログラムを追加できますか？',
    a: '現時点では楽天・Vポイント・dポイント・Ponta・WAON・nanaco・PayPay・ANAマイル・JALマイルの9プログラムに対応しています。追加対応については今後のアップデートを予定しています。',
  },
];

/* ── Sub-components ── */

function StepCard({ step, icon: Icon, color, bg, title, to, summary, details }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        {/* Step number + icon */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-sm`}>
          <Icon size={18} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
              STEP {step}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-800 leading-snug">{title}</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{summary}</p>
        </div>

        <div className="flex-shrink-0 mt-1 text-gray-300">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-gray-50 bg-gray-50/40 px-5 py-4 space-y-4">
          {details.map((d, i) => (
            <div key={i} className="flex gap-3">
              <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color }} />
              <div>
                <p className="text-xs font-semibold text-gray-700">{d.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{d.body}</p>
              </div>
            </div>
          ))}

          {/* Go to page button */}
          <button
            onClick={() => navigate(to)}
            className="btn-primary text-xs py-1.5 px-3 mt-2"
            style={{ background: `linear-gradient(135deg, ${color}dd, ${color})` }}
          >
            このページを開く <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <p className="text-sm font-medium text-gray-800 leading-snug">{q}</p>
        <span className="flex-shrink-0 mt-0.5 text-gray-300">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ── Main ── */

export default function HowToUse() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="page-title">使い方ガイド</h2>
        <p className="page-sub">ポイントオプティマイザーの基本的な使い方を説明します</p>
      </div>

      {/* Overview banner */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-5">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-3">このアプリでできること</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: '💳', text: '9種のポイントプログラムを一括管理' },
              { icon: '📊', text: 'ポイントを円換算して総資産を把握' },
              { icon: '🔄', text: '最もお得な交換ルートをレコメンド' },
              { icon: '⏰', text: '有効期限が近いポイントをアラート' },
              { icon: '📈', text: '支出から将来の獲得ポイントを予測' },
              { icon: '🏆', text: '用途別の最高還元カードを提示' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1" />
      </div>

      {/* Step-by-step */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="text-base font-bold text-gray-800">ステップガイド</h3>
          <span className="text-xs text-gray-400">— タップして詳細を見る</span>
        </div>
        <div className="space-y-3">
          {STEPS.map((s) => (
            <StepCard key={s.step} {...s} />
          ))}
        </div>
      </section>

      {/* Tips */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-5 rounded-full bg-amber-500" />
          <h3 className="text-base font-bold text-gray-800">活用のヒント</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              icon: '📅',
              title: '月1回の残高更新を習慣に',
              body: '毎月1日など日を決めて各ポイントサービスのアプリで残高を確認し、まとめて更新すると管理が楽になります。',
            },
            {
              icon: '✈️',
              title: 'マイルは使い方で価値が変わる',
              body: '同じマイル数でも国際線ビジネスクラスに使うと1マイル5円以上の価値になることがあります。大きな旅行計画と合わせてマイル交換を検討しましょう。',
            },
            {
              icon: '🎯',
              title: 'キャンペーン期間に集中利用',
              body: 'ダッシュボードのキャンペーン情報を定期的に確認し、ポイント倍増期間にネットショッピングや旅行予約を集中させると獲得効率が上がります。',
            },
            {
              icon: '⚠️',
              title: '期限管理は最優先で',
              body: '未使用のまま失効したポイントは取り戻せません。ポイント登録時に必ず有効期限を設定し、期限アラートを活用して失効ゼロを目指しましょう。',
            },
            {
              icon: '💡',
              title: 'シミュレーターで最適カードを選ぶ',
              body: '自分の支出パターンをシミュレーターに入力すると、どのカードが最も効率よくポイントを貯められるかがわかります。メインカード選びの参考に。',
            },
            {
              icon: '🔗',
              title: 'ポイント集約で使い勝手向上',
              body: '複数プログラムに少量ずつ分散するより、1〜2プログラムに集中させると使い道が広がります。交換戦略を活用してポイントを集約しましょう。',
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-5 rounded-full bg-emerald-500" />
          <h3 className="text-base font-bold text-gray-800">よくある質問</h3>
        </div>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="card p-4 border-l-4 border-l-blue-400 bg-blue-50/50">
        <p className="text-xs font-semibold text-blue-700 mb-1">ご注意</p>
        <p className="text-xs text-blue-600 leading-relaxed">
          本アプリの情報はあくまで参考用です。ポイントの交換・利用に際しては必ず各サービスの公式サイトで最新の規約・レートをご確認ください。
          ポイントの失効や交換損失について、本アプリは責任を負いません。
        </p>
      </div>
    </div>
  );
}
