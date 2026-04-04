import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';

// ─── データ定義 ────────────────────────────────────────────
const SERVICES = [
  {
    id: 'rakuten',
    name: '楽天ポイント運用',
    icon: '🛒',
    color: '#bf0000',
    courses: [
      {
        id: 'active',
        name: 'アクティブコース',
        annualRate: 0.12,
        risk: '高',
        riskColor: '#ef4444',
        benchmark: '楽天日本株4.3倍ブルファンド連動',
        desc: '日本株レバレッジ型ファンドに連動。大きなリターンが期待できる一方、下落時の損失も大きい高リスク・高リターン型。',
      },
      {
        id: 'balance',
        name: 'バランスコース',
        annualRate: 0.06,
        risk: '中',
        riskColor: '#f59e0b',
        benchmark: '楽天・インデックス・バランス（均等型）連動',
        desc: '国内外の株式・債券に分散投資するバランス型ファンド連動。リスクを抑えながら安定的な成長を目指す中リスク型。',
      },
    ],
  },
  {
    id: 'dpoint',
    name: 'dポイント投資',
    icon: '📱',
    color: '#e60012',
    courses: [
      {
        id: 'challenge',
        name: 'チャレンジコース',
        annualRate: 0.10,
        risk: '高',
        riskColor: '#ef4444',
        benchmark: '日経平均株価インデックス連動',
        desc: '日経平均株価に連動する投資信託。国内株式市場の動きに合わせた運用で、長期での成長が期待できる高リスク型。',
      },
      {
        id: 'omakase_plus',
        name: 'おまかせコース（積極）',
        annualRate: 0.07,
        risk: '中高',
        riskColor: '#f97316',
        benchmark: '株式比率高めのバランス運用',
        desc: '株式比率を高めに設定したバランス型運用。リターン追求と分散効果を両立する中〜高リスク型。',
      },
      {
        id: 'omakase_std',
        name: 'おまかせコース（標準）',
        annualRate: 0.05,
        risk: '中',
        riskColor: '#f59e0b',
        benchmark: '株式・債券バランス型',
        desc: '株式と債券をバランス良く組み合わせたコース。安定した運用成果を目指す標準的な中リスク型。',
      },
      {
        id: 'omakase_stable',
        name: 'おまかせコース（安定）',
        annualRate: 0.025,
        risk: '低',
        riskColor: '#10b981',
        benchmark: '債券比率高めの安定運用',
        desc: '債券を中心とした安全性重視のコース。大きなリターンは期待しづらいが元本割れリスクを最小限に抑える低リスク型。',
      },
    ],
  },
  {
    id: 'ponta',
    name: 'Pontaポイント運用',
    icon: '🦝',
    color: '#e8380d',
    courses: [
      {
        id: 'aggressive',
        name: '積極型コース',
        annualRate: 0.10,
        risk: '高',
        riskColor: '#ef4444',
        benchmark: '国内外株式中心のファンド連動',
        desc: '国内外の株式を中心に積極的にリターンを追求するコース。高い成長性が期待できる反面、価格変動リスクが大きい高リスク型。',
      },
      {
        id: 'balance',
        name: 'バランス型コース',
        annualRate: 0.05,
        risk: '中',
        riskColor: '#f59e0b',
        benchmark: '株式・債券バランス型ファンド連動',
        desc: '株式と債券を組み合わせたバランス型。リスクとリターンのバランスを重視した長期投資向けの中リスク型。',
      },
      {
        id: 'stable',
        name: '安定型コース',
        annualRate: 0.025,
        risk: '低',
        riskColor: '#10b981',
        benchmark: '国内債券中心のファンド連動',
        desc: '国内債券を中心とした安定運用コース。価格変動が小さく、着実に資産を増やしたい方向けの低リスク・低リターン型。',
      },
    ],
  },
  {
    id: 'paypay',
    name: 'PayPayポイント運用',
    icon: '💰',
    color: '#ff0033',
    courses: [
      {
        id: 'challenge',
        name: 'チャレンジコース',
        annualRate: 0.15,
        risk: '超高',
        riskColor: '#dc2626',
        benchmark: 'テスラ株連動',
        desc: 'テスラ社の株価に連動するコース。急騰時の大きなリターンが魅力だが、株価変動が非常に激しく元本を大きく割り込むリスクも高い超高リスク型。',
      },
      {
        id: 'standard',
        name: 'スタンダードコース',
        annualRate: 0.12,
        risk: '中高',
        riskColor: '#f97316',
        benchmark: 'S&P500インデックス連動',
        desc: '米国大型株500社に連動するS&P500インデックスファンド連動。世界最大の株式市場に幅広く分散投資できる中〜高リスク型の定番コース。',
      },
      {
        id: 'gold',
        name: 'ゴールドコース',
        annualRate: 0.06,
        risk: '中',
        riskColor: '#f59e0b',
        benchmark: '金（ゴールド）価格連動',
        desc: '金（ゴールド）の国際価格に連動するコース。インフレへのヘッジ効果が期待でき、株式との相関が低い資産分散向けの中リスク型。',
      },
    ],
  },
];

const RISK_ORDER = { '低': 1, '中': 2, '中高': 3, '高': 4, '超高': 5 };

// ─── 複利計算（月次積立あり）────────────────────────────
function calcProjection(initialPts, monthlyPts, years, annualRate) {
  const r = annualRate / 12;
  const data = [{
    year: 0,
    total: initialPts,
    principal: initialPts,
    profit: 0,
  }];
  let current = initialPts;
  let principal = initialPts;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      current = current * (1 + r) + monthlyPts;
      principal += monthlyPts;
    }
    data.push({
      year: y,
      total: Math.round(current),
      principal: Math.round(principal),
      profit: Math.round(current - principal),
    });
  }
  return data;
}

function fmtPt(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万pt`;
  return `${n.toLocaleString()}pt`;
}

// ─── カスタムTooltip ──────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs shadow-xl space-y-1">
      <p className="text-slate-400 font-medium mb-1">{label}年後</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value.toLocaleString()} pt
        </p>
      ))}
    </div>
  );
}

// ─── メイン ──────────────────────────────────────────────
export default function PointInvestSim() {
  const [serviceId,  setServiceId]  = useState('rakuten');
  const [courseId,   setCourseId]   = useState('active');
  const [initialPts, setInitialPts] = useState(10000);
  const [monthlyPts, setMonthlyPts] = useState(1000);
  const [years,      setYears]      = useState(10);

  const service = SERVICES.find((s) => s.id === serviceId);
  const course  = service.courses.find((c) => c.id === courseId) ?? service.courses[0];

  // サービス切り替え時はコースをリセット
  const handleServiceChange = (id) => {
    setServiceId(id);
    setCourseId(SERVICES.find((s) => s.id === id).courses[0].id);
  };

  const data = useMemo(
    () => calcProjection(initialPts, monthlyPts, years, course.annualRate),
    [initialPts, monthlyPts, years, course.annualRate]
  );

  const finalTotal     = data[data.length - 1].total;
  const finalPrincipal = data[data.length - 1].principal;
  const finalProfit    = data[data.length - 1].profit;
  const profitRate     = finalPrincipal > 0
    ? ((finalProfit / finalPrincipal) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-5">

      {/* ── ヘッダー ── */}
      <div
        className="rounded-2xl px-6 py-5 shadow-lg relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${service.color}cc, ${service.color}88)` }}
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <h1 className="page-title text-white flex items-center gap-2">
          <TrendingUp size={22} />
          ポイント運用シミュレーター
        </h1>
        <p className="text-white/70 text-sm mt-1">
          各サービスの運用コース別に将来のポイント推移を試算できます
        </p>
      </div>

      {/* ── 免責バナー ── */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/15 dark:border-amber-700/50 px-4 py-3.5 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
            シミュレーション結果はあくまで目安です
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 leading-relaxed">
            表示される年率・運用益は過去の実績や各サービスの参考値をもとにした<strong>試算値</strong>であり、将来の運用成果を一切保証するものではありません。
            実際の運用では市場環境により元本を下回る場合があります。投資判断はご自身の責任のもとでお願いします。
          </p>
        </div>
      </div>

      {/* ── サービス選択 ── */}
      <div className="card p-5">
        <p className="section-title mb-3">サービスを選択</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleServiceChange(s.id)}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                serviceId === s.id
                  ? 'text-white shadow-md'
                  : 'border-transparent bg-[var(--color-badge-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              style={serviceId === s.id ? { background: s.color, borderColor: s.color } : {}}
            >
              <span className="text-xl">{s.icon}</span>
              <span className="leading-tight text-xs">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">

        {/* ── 左: コース選択 + グラフ ── */}
        <div className="space-y-5">

          {/* コース選択 */}
          <div className="card p-5">
            <p className="section-title mb-3">運用コースを選択</p>
            <div className="space-y-2">
              {service.courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCourseId(c.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                    courseId === c.id
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-[var(--color-card-border)] hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {courseId === c.id && <span className="text-blue-500 mr-1.5">●</span>}
                      {c.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="badge text-white text-[10px]"
                        style={{ backgroundColor: c.riskColor }}
                      >
                        リスク: {c.risk}
                      </span>
                      <span className="text-xs font-bold" style={{ color: service.color }}>
                        年率 {(c.annualRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.benchmark}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* グラフ */}
          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              運用推移グラフ
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>
                （年率 {(course.annualRate * 100).toFixed(1)}% · {years}年間）
              </span>
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                <XAxis
                  dataKey="year"
                  tickFormatter={(v) => `${v}年`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(0)}万` : v.toLocaleString()}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                  width={52}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(v) => v === 'total' ? '運用後合計' : v === 'principal' ? '元本（積立合計）' : '運用益'}
                />
                <ReferenceLine x={0} stroke="transparent" />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="total"
                  stroke={service.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="principal"
                  name="principal"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 右: 入力 + 結果 ── */}
        <div className="space-y-4">

          {/* 入力フォーム */}
          <div className="card p-5">
            <p className="section-title mb-4">条件を入力</p>
            <div className="space-y-4">

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  初期ポイント
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="input pr-8"
                    value={initialPts}
                    min={0}
                    step={100}
                    onChange={(e) => setInitialPts(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>pt</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  月次積立ポイント
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="input pr-8"
                    value={monthlyPts}
                    min={0}
                    step={100}
                    onChange={(e) => setMonthlyPts(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }}>pt/月</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold flex justify-between mb-1.5">
                  <span style={{ color: 'var(--color-text-muted)' }}>運用期間</span>
                  <span style={{ color: 'var(--color-text-primary)' }} className="font-bold">{years}年</span>
                </label>
                <input
                  type="range"
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: service.color }}
                  min={1} max={30} step={1}
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span>1年</span><span>10年</span><span>20年</span><span>30年</span>
                </div>
              </div>
            </div>
          </div>

          {/* 結果サマリー */}
          <div className="card p-5 space-y-3">
            <p className="section-title">{years}年後の試算結果</p>

            <div
              className="rounded-xl p-4 text-center"
              style={{ background: `${service.color}15`, border: `1px solid ${service.color}30` }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>運用後合計</p>
              <p className="text-3xl font-black tracking-tight" style={{ color: service.color }}>
                {finalTotal.toLocaleString()}
                <span className="text-base font-normal ml-1">pt</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{fmtPt(finalTotal)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-badge-bg)' }}>
                <p className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>元本（積立合計）</p>
                <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {finalPrincipal.toLocaleString()}
                  <span className="text-xs font-normal ml-0.5">pt</span>
                </p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-[10px] mb-1 text-emerald-500">運用益</p>
                <p className="text-lg font-bold text-emerald-500">
                  +{finalProfit.toLocaleString()}
                  <span className="text-xs font-normal ml-0.5">pt</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--color-badge-bg)' }}>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>トータルリターン</span>
              <span className="text-lg font-black text-emerald-500">+{profitRate}%</span>
            </div>

            {/* 年率表示 */}
            <div className="flex items-center gap-2 pt-1">
              <Info size={13} className="text-blue-400 flex-shrink-0" />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                使用年率: <strong style={{ color: 'var(--color-text-primary)' }}>{(course.annualRate * 100).toFixed(1)}%</strong>
                （{course.name} · 月次複利計算）
              </p>
            </div>
          </div>

          {/* 注意書き */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/40 px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} />
              ご注意
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
              表示される年率は過去の実績等をもとにした参考値です。将来の運用成果を保証するものではありません。実際の運用では元本割れが生じる場合があります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
