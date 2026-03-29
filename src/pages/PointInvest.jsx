import { useState } from 'react';
import { TrendingUp, ExternalLink, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const INVEST_PROGRAMS = [
  {
    id: 'rakuten',
    name: '楽天ポイント運用',
    pointName: '楽天ポイント',
    icon: '🛒',
    color: '#bf0000',
    service: '楽天ポイント運用',
    minPoints: 100,
    accountRequired: false,
    accountNote: '楽天会員のみ（証券口座不要）',
    courses: [
      { name: 'アクティブコース', risk: '高', description: '米国株中心の積極運用。リターンを重視したい方向け。' },
      { name: 'バランスコース',   risk: '中', description: '株・債券をバランスよく組み合わせた安定志向。' },
    ],
    features: [
      '証券口座の開設不要でポイントのみ運用可能',
      'いつでも運用停止・ポイント引き出し可能',
      '運用益はポイントで受け取れる',
    ],
    url: 'https://pointsun.rakuten.co.jp/',
  },
  {
    id: 'dpoint',
    name: 'dポイント投資',
    pointName: 'dポイント',
    icon: '📱',
    color: '#e60012',
    service: 'dポイント投資',
    minPoints: 100,
    accountRequired: false,
    accountNote: 'dアカウントのみ（ドコモ契約不要）',
    courses: [
      { name: '日本株コース',    risk: '高', description: '日本の主要株価指数に連動する運用。' },
      { name: '米国株コース',    risk: '高', description: '米国株式市場に連動。長期成長を期待したい方に。' },
      { name: '金・プラチナコース', risk: '中', description: '貴金属価格に連動。分散投資として活用できる。' },
      { name: 'ノーマルコース',  risk: '低', description: '比較的安定した運用。初心者向け。' },
    ],
    features: [
      'dアカウントがあれば誰でも利用可能',
      'ポイントが増えたらdポイントとして引き出せる',
      '100ポイントから手軽にスタート可能',
    ],
    url: 'https://id.smt.docomo.ne.jp/',
  },
  {
    id: 'ponta',
    name: 'Ponta運用',
    pointName: 'Pontaポイント',
    icon: '🦝',
    color: '#e8380d',
    service: 'Ponta運用（au PAY アプリ）',
    minPoints: 100,
    accountRequired: false,
    accountNote: 'Pontaカード会員（au契約不要）',
    courses: [
      { name: 'スタンダードコース', risk: '中', description: '株・債券をバランスよく組み合わせた安定した運用。' },
      { name: 'チャレンジコース',  risk: '高', description: '株式中心の積極的な運用。高いリターンを狙いたい方に。' },
    ],
    features: [
      'au PAYアプリから簡単にスタート',
      '運用中もPontaポイントとして利用可能',
      'auカブコム証券と連携した本格運用も可能',
    ],
    url: 'https://pointsun.auone.jp/',
  },
  {
    id: 'vpoint',
    name: 'Vポイント運用',
    pointName: 'Vポイント',
    icon: '💳',
    color: '#0066cc',
    service: 'Vポイント運用（SBI証券）',
    minPoints: 1,
    accountRequired: true,
    accountNote: 'SBI証券の口座開設が必要',
    courses: [
      { name: 'SBI証券の投資信託', risk: '様々', description: 'SBI証券で取り扱う投資信託をVポイントで購入可能。銘柄は自由に選択。' },
    ],
    features: [
      '1ポイントから投資信託の購入に充当可能',
      'SBI証券の全投資信託ラインナップに対応',
      '現金と組み合わせてポイントを足し算できる',
    ],
    url: 'https://www.smbc-card.com/mem/service/vpoint/toushi/',
  },
  {
    id: 'paypay',
    name: 'PayPayポイント運用',
    pointName: 'PayPayポイント',
    icon: '💰',
    color: '#ff0033',
    service: 'PayPayポイント運用',
    minPoints: 1,
    accountRequired: false,
    accountNote: 'PayPayアカウントのみ',
    courses: [
      { name: 'スタンダードコース',    risk: '中',  description: '株・債券バランス型。安定志向の方向け。' },
      { name: 'テクノロジーコース',    risk: '高',  description: 'IT・テクノロジー関連株に集中投資。' },
      { name: 'ゴールドコース',        risk: '中',  description: '金価格に連動。インフレ対策として人気。' },
      { name: '逆チャレンジコース',    risk: '高',  description: '相場下落時に利益を狙う逆張り型。上級者向け。' },
    ],
    features: [
      'PayPayアプリ内で完結。手続きが最も簡単',
      '1ポイントから運用可能でハードルが低い',
      '運用益はPayPayポイントとして受け取れる',
    ],
    url: 'https://paypay.ne.jp/guide/point-investment/',
  },
];

const RISK_COLORS = {
  '高': { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  '中': { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200' },
  '低': { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
  '様々': { bg: 'bg-blue-50', text: 'text-blue-600',   border: 'border-blue-200' },
};

function ProgramCard({ prog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: prog.color }} />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
              style={{ backgroundColor: prog.color + '18' }}>
              {prog.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{prog.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{prog.service}</p>
            </div>
          </div>
          <a href={prog.url} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-slate-400">最低運用ポイント</p>
            <p className="font-bold text-slate-800 mt-0.5">{prog.minPoints.toLocaleString()} pt〜</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-slate-400">口座開設</p>
            <p className={`font-bold mt-0.5 text-sm ${prog.accountRequired ? 'text-amber-600' : 'text-green-600'}`}>
              {prog.accountRequired ? '必要' : '不要'}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <Info size={11} className="flex-shrink-0" />
          {prog.accountNote}
        </p>

        {/* Courses */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 mb-1.5">運用コース</p>
          <div className="space-y-1.5">
            {prog.courses.map((course) => {
              const risk = RISK_COLORS[course.risk] ?? RISK_COLORS['中'];
              return (
                <div key={course.name} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${risk.bg} ${risk.border}`}>
                  <span className={`text-xs font-bold flex-shrink-0 ${risk.text}`}>{course.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${risk.bg} ${risk.text} border ${risk.border}`}>
                    リスク{course.risk}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expand: features + course details */}
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? '閉じる' : '詳細・特徴を見る'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">主な特徴</p>
              <ul className="space-y-1">
                {prog.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">コース詳細</p>
              <div className="space-y-2">
                {prog.courses.map((course) => (
                  <div key={course.name} className="text-xs">
                    <span className="font-semibold text-slate-700">{course.name}：</span>
                    <span className="text-slate-500">{course.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareTable() {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[540px]">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">サービス</th>
            <th className="text-center px-4 py-3 text-xs text-slate-400 font-semibold">最低ポイント</th>
            <th className="text-center px-4 py-3 text-xs text-slate-400 font-semibold">口座開設</th>
            <th className="text-center px-4 py-3 text-xs text-slate-400 font-semibold">コース数</th>
            <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">おすすめ</th>
          </tr>
        </thead>
        <tbody>
          {INVEST_PROGRAMS.map((prog, i) => (
            <tr key={prog.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{prog.icon}</span>
                  <span className="font-medium text-slate-700 text-xs">{prog.pointName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-slate-800">{prog.minPoints} pt〜</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prog.accountRequired ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                  {prog.accountRequired ? '必要' : '不要'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-slate-800">{prog.courses.length}</span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {prog.id === 'rakuten'  && '楽天経済圏ユーザー'}
                {prog.id === 'dpoint'  && 'dアカウント所持者'}
                {prog.id === 'ponta'   && 'ローソン・auユーザー'}
                {prog.id === 'vpoint'  && 'SBI証券ユーザー'}
                {prog.id === 'paypay'  && '初心者・PayPayユーザー'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { id: 'list',    label: 'サービス一覧' },
  { id: 'compare', label: '比較表' },
];

export default function PointInvest() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div>
      {/* Header */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 shadow-lg">
        <h1 className="page-title text-white">ポイント運用</h1>
        <p className="text-teal-200 text-sm mt-1">
          貯まったポイントを運用して増やそう。主要5サービスを比較・解説。
        </p>
      </div>

      {/* Risk warning */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5">
        <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          ポイント運用は元本保証ではありません。運用結果によってはポイントが減少する場合があります。各サービスの利用規約・リスク説明を必ずご確認の上、自己責任でご利用ください。
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INVEST_PROGRAMS.map((prog) => (
            <ProgramCard key={prog.id} prog={prog} />
          ))}
        </div>
      )}

      {/* Compare */}
      {activeTab === 'compare' && (
        <div className="space-y-4">
          <CompareTable />
          <div className="card p-4 border-l-4 border-teal-400 bg-teal-50">
            <p className="text-xs font-semibold text-teal-700 mb-1">ポイント運用を始めるコツ</p>
            <ul className="space-y-1">
              {[
                '余剰ポイントで少額から始めるのがおすすめ。使う予定のないポイントを活用しよう。',
                'PayPayポイント運用は口座開設不要・1ptからと最も手軽。初心者はここから始めやすい。',
                '長期保有を前提に積み立て感覚で運用すると、短期の値動きに左右されにくい。',
                'ポイント運用の利益は非課税となるサービスが多いが、条件は各サービスで確認を。',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-1.5 text-xs text-teal-700">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
