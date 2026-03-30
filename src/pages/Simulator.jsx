import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { RotateCcw, Zap, Layers } from 'lucide-react';
import { POINT_PROGRAMS } from '../data/pointPrograms';

/* ── カテゴリ ── */
const SPENDING_CATEGORIES = [
  { id: 'convenience', label: 'コンビニ',   icon: '🏪', monthlyDefault: 8000 },
  { id: 'supermarket', label: 'スーパー',   icon: '🛒', monthlyDefault: 30000 },
  { id: 'restaurant',  label: '飲食店',     icon: '🍽️', monthlyDefault: 20000 },
  { id: 'online',      label: 'ネット通販', icon: '💻', monthlyDefault: 15000 },
  { id: 'travel',      label: '旅行・交通', icon: '🚅', monthlyDefault: 10000 },
  { id: 'gas',         label: 'ガソリン',   icon: '⛽', monthlyDefault: 8000 },
  { id: 'utility',     label: '公共料金',   icon: '💡', monthlyDefault: 20000 },
];

/* ── 支払い方法（Layer 1） ── */
const PAYMENT_OPTIONS = [
  // クレジットカード
  { id: 'rakuten_card', group: 'クレジットカード', label: '楽天カード',          program: 'rakuten', rates: { base: 0.010, byCategory: { online: 0.030 } } },
  { id: 'smbc_card',    group: 'クレジットカード', label: '三井住友カード',       program: 'vpoint',  rates: { base: 0.005, byCategory: { convenience: 0.050, restaurant: 0.050 } } },
  { id: 'd_card',       group: 'クレジットカード', label: 'dカード',              program: 'dpoint',  rates: { base: 0.010, byCategory: { convenience: 0.050, restaurant: 0.050 } } },
  { id: 'aupay_card',   group: 'クレジットカード', label: 'au PAYカード',         program: 'ponta',   rates: { base: 0.010, byCategory: { gas: 0.020 } } },
  { id: 'paypay_card',  group: 'クレジットカード', label: 'PayPayカード',         program: 'paypay',  rates: { base: 0.015 } },
  { id: 'aeon_card',    group: 'クレジットカード', label: 'イオンカード',          program: 'waon',    rates: { base: 0.005, byCategory: { supermarket: 0.010 } } },
  { id: 'seven_card',   group: 'クレジットカード', label: 'セブンカード・プラス',  program: 'nanaco',  rates: { base: 0.005, byCategory: { convenience: 0.010 } } },
  // スマホ決済
  { id: 'rakuten_pay',  group: 'スマホ決済', label: '楽天Pay',  program: 'rakuten', rates: { base: 0.015 } },
  { id: 'd_pay',        group: 'スマホ決済', label: 'd払い',    program: 'dpoint',  rates: { base: 0.005, byCategory: { utility: 0.010 } } },
  { id: 'paypay_app',   group: 'スマホ決済', label: 'PayPay',   program: 'paypay',  rates: { base: 0.010, byCategory: { convenience: 0.015, restaurant: 0.015 } } },
  { id: 'aupay_app',    group: 'スマホ決済', label: 'au PAY',   program: 'ponta',   rates: { base: 0.005 } },
  // IC/電子マネー
  { id: 'waon_pay',     group: 'IC/電子マネー', label: 'WAON',   program: 'waon',   rates: { base: 0.005, byCategory: { supermarket: 0.010 } } },
  { id: 'nanaco_pay',   group: 'IC/電子マネー', label: 'nanaco', program: 'nanaco', rates: { base: 0.005 } },
  // 現金
  { id: 'cash', group: 'その他', label: '現金 (ポイントなし)', program: null, rates: { base: 0 } },
];

/* ── ポイントカード提示（Layer 2） ── */
const LOYALTY_OPTIONS = [
  { id: 'none',          label: 'なし',                  program: null,     rates: { base: 0 } },
  { id: 'd_pcard',       label: 'dポイントカード',        program: 'dpoint', rates: { base: 0.010 } },
  { id: 'ponta_pcard',   label: 'Pontaカード',           program: 'ponta',  rates: { base: 0.010, byCategory: { gas: 0.020 } } },
  { id: 'rakuten_pcard', label: '楽天ポイントカード',     program: 'rakuten',rates: { base: 0.010 } },
  { id: 'vpoint_pcard',  label: 'Vポイントカード',        program: 'vpoint', rates: { base: 0.005 } },
  { id: 'waon_pcard',    label: 'WAONポイントカード',     program: 'waon',   rates: { base: 0.005 } },
  { id: 'nanaco_pcard',  label: 'nanacoカード',           program: 'nanaco', rates: { base: 0.005 } },
];

/* ── ポイントサイト経由（Layer 3 / ネット通販のみ） ── */
const POINTSITE_OPTIONS = [
  { id: 'none',    label: 'なし',     rate: 0.000 },
  { id: 'hapitas', label: 'ハピタス', rate: 0.020 },
  { id: 'moppy',   label: 'モッピー', rate: 0.025 },
  { id: 'pex',     label: 'PeX',     rate: 0.015 },
  { id: 'gendama', label: 'げん玉',   rate: 0.015 },
];

/* ── プリセット ── */
const PRESETS = [
  { label: '標準家庭',    icon: '🏠', values: { convenience: 10000, supermarket: 40000, restaurant: 15000, online: 10000, travel: 5000,  gas: 8000,  utility: 20000 } },
  { label: 'ネット通販派', icon: '💻', values: { convenience: 5000,  supermarket: 20000, restaurant: 10000, online: 50000, travel: 5000,  gas: 3000,  utility: 15000 } },
  { label: 'ドライバー',  icon: '🚗', values: { convenience: 15000, supermarket: 25000, restaurant: 20000, online: 5000,  travel: 20000, gas: 30000, utility: 15000 } },
  { label: '外食多め',    icon: '🍜', values: { convenience: 8000,  supermarket: 10000, restaurant: 50000, online: 5000,  travel: 10000, gas: 5000,  utility: 15000 } },
];

/* ── ユーティリティ ── */
function optionRate(option, catId) {
  if (!option) return 0;
  return option.rates?.byCategory?.[catId] ?? option.rates?.base ?? 0;
}

function buildLayers(catId, stack) {
  const pay  = PAYMENT_OPTIONS.find(o => o.id === stack.payment);
  const loy  = LOYALTY_OPTIONS.find(o => o.id === stack.loyalty);
  const site = POINTSITE_OPTIONS.find(o => o.id === stack.site);
  const layers = [];

  const payRate = optionRate(pay, catId);
  if (pay && pay.id !== 'cash' && payRate > 0) {
    const prog = POINT_PROGRAMS.find(p => p.id === pay.program);
    layers.push({ label: pay.label, programId: pay.program, name: prog?.shortName ?? '', color: prog?.color ?? '#888', icon: prog?.icon ?? '💳', rate: payRate, type: 'payment' });
  }

  const loyRate = optionRate(loy, catId);
  if (loy && loy.id !== 'none' && loyRate > 0) {
    const prog = POINT_PROGRAMS.find(p => p.id === loy.program);
    layers.push({ label: loy.label, programId: loy.program, name: prog?.shortName ?? '', color: prog?.color ?? '#888', icon: prog?.icon ?? '🎫', rate: loyRate, type: 'loyalty' });
  }

  if (catId === 'online' && site && site.id !== 'none' && site.rate > 0) {
    layers.push({ label: site.label, programId: 'site', name: 'サイト', color: '#7c3aed', icon: '🌐', rate: site.rate, type: 'site' });
  }

  return layers;
}

const STACK_LABELS = ['', '', '2重取り', '3重取り'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill ?? '#fff' }} className="font-semibold">{p.value?.toLocaleString()} pt</p>
      ))}
    </div>
  );
};

/* ── メインコンポーネント ── */
export default function Simulator() {
  const [spending, setSpending] = useState(
    Object.fromEntries(SPENDING_CATEGORIES.map(c => [c.id, c.monthlyDefault]))
  );
  const [stacks, setStacks] = useState(
    Object.fromEntries(SPENDING_CATEGORIES.map(c => [c.id, { payment: 'rakuten_card', loyalty: 'none', site: 'none' }]))
  );
  const [months, setMonths] = useState(12);

  const totalMonthly = Object.values(spending).reduce((s, v) => s + Number(v || 0), 0);

  /* カテゴリごとのレイヤー */
  const categoryLayers = useMemo(() =>
    Object.fromEntries(SPENDING_CATEGORIES.map(c => [c.id, buildLayers(c.id, stacks[c.id])])),
  [stacks]);

  /* プログラム別集計 */
  const simulation = useMemo(() => {
    const byProgram = {};
    SPENDING_CATEGORIES.forEach(cat => {
      const amount = Number(spending[cat.id] || 0);
      categoryLayers[cat.id].forEach(layer => {
        const pid = layer.programId;
        if (!byProgram[pid]) byProgram[pid] = { points: 0, color: layer.color, icon: layer.icon, name: layer.name, programId: pid };
        byProgram[pid].points += Math.floor(amount * layer.rate);
      });
    });
    return Object.values(byProgram)
      .map(p => {
        const prog = POINT_PROGRAMS.find(pr => pr.id === p.programId);
        return {
          ...p,
          monthlyPoints: p.points,
          totalPoints: p.points * months,
          jpy: p.points * months * (prog?.exchangeRateToJpy ?? (p.programId === 'site' ? 1 : 1)),
        };
      })
      .sort((a, b) => b.monthlyPoints - a.monthlyPoints);
  }, [spending, categoryLayers, months]);

  const totalMonthlyPoints = simulation.reduce((s, p) => s + p.monthlyPoints, 0);
  const totalJpy = simulation.filter(p => p.programId !== 'site').reduce((s, p) => s + p.jpy, 0);
  const siteBonus = (simulation.find(p => p.programId === 'site')?.jpy ?? 0);

  /* おすすめ組み合わせ */
  const bestCombos = useMemo(() =>
    SPENDING_CATEGORIES.map(cat => {
      let best = { rate: 0, payment: PAYMENT_OPTIONS[0], loyalty: LOYALTY_OPTIONS[0], site: POINTSITE_OPTIONS[0] };
      PAYMENT_OPTIONS.forEach(pay =>
        LOYALTY_OPTIONS.forEach(loy => {
          const siteCheck = cat.id === 'online' ? POINTSITE_OPTIONS : [POINTSITE_OPTIONS[0]];
          siteCheck.forEach(site => {
            const layers = buildLayers(cat.id, { payment: pay.id, loyalty: loy.id, site: site.id });
            const rate = layers.reduce((s, l) => s + l.rate, 0);
            if (rate > best.rate) best = { rate, payment: pay, loyalty: loy, site, layers };
          });
        })
      );
      return { cat, ...best };
    }),
  []);

  function updateStack(catId, key, val) {
    setStacks(prev => ({ ...prev, [catId]: { ...prev[catId], [key]: val } }));
  }

  function applyBest(catId) {
    const b = bestCombos.find(b => b.cat.id === catId);
    if (!b) return;
    setStacks(prev => ({ ...prev, [catId]: { payment: b.payment.id, loyalty: b.loyalty.id, site: b.site.id } }));
  }

  const payGroups = [...new Set(PAYMENT_OPTIONS.map(o => o.group))];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="page-title">シミュレーター</h2>
        <p className="page-sub">支払い方法の組み合わせで2重・3重取りを計算します</p>
      </div>

      {/* Presets */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">支出プリセット</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <button key={preset.label}
              onClick={() => setSpending(preset.values)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl text-sm text-gray-700 transition-all active:scale-95">
              {preset.icon} {preset.label}
            </button>
          ))}
          <button onClick={() => { setSpending(Object.fromEntries(SPENDING_CATEGORIES.map(c => [c.id, c.monthlyDefault]))); setStacks(Object.fromEntries(SPENDING_CATEGORIES.map(c => [c.id, { payment: 'rakuten_card', loyalty: 'none', site: 'none' }]))); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-sm text-gray-400 transition-all active:scale-95">
            <RotateCcw size={12} /> リセット
          </button>
        </div>
      </div>

      {/* Category stack config */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-blue-500" />
            <p className="text-sm font-semibold text-gray-800">支出 &amp; ポイント重ね取り設定</p>
          </div>
          <span className="text-xs text-gray-400">合計 <span className="font-bold text-blue-600">¥{totalMonthly.toLocaleString()}</span>/月</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {SPENDING_CATEGORIES.map(cat => {
            const layers = categoryLayers[cat.id];
            const totalRate = layers.reduce((s, l) => s + l.rate, 0);
            const stackN = layers.length;
            const amount = Number(spending[cat.id] || 0);
            const monthlyPts = layers.reduce((s, l) => s + Math.floor(amount * l.rate), 0);

            return (
              <div key={cat.id} className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    {cat.icon} {cat.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {stackN >= 2 && (
                      <span className="badge text-white text-[10px]"
                        style={{ backgroundColor: stackN >= 3 ? '#7c3aed' : '#2563eb' }}>
                        {STACK_LABELS[stackN]}
                      </span>
                    )}
                    <button onClick={() => applyBest(cat.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-medium transition-all active:scale-95">
                      <Zap size={9} /> 最適化
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs">¥</span>
                  <input type="number" value={spending[cat.id]}
                    onChange={e => setSpending(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    className="input pl-7" min="0" step="1000" />
                </div>

                {/* Layer 1: 支払い */}
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold mb-1">💳 支払い方法</p>
                  <select value={stacks[cat.id].payment}
                    onChange={e => updateStack(cat.id, 'payment', e.target.value)}
                    className="input text-xs py-1.5">
                    {payGroups.map(group => (
                      <optgroup key={group} label={group}>
                        {PAYMENT_OPTIONS.filter(o => o.group === group).map(o => (
                          <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Layer 2: ポイントカード提示 */}
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold mb-1">🎫 ポイントカード提示</p>
                  <select value={stacks[cat.id].loyalty}
                    onChange={e => updateStack(cat.id, 'loyalty', e.target.value)}
                    className="input text-xs py-1.5">
                    {LOYALTY_OPTIONS.map(o => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Layer 3: ポイントサイト (online only) */}
                {cat.id === 'online' && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold mb-1">🌐 ポイントサイト経由</p>
                    <select value={stacks[cat.id].site}
                      onChange={e => updateStack(cat.id, 'site', e.target.value)}
                      className="input text-xs py-1.5">
                      {POINTSITE_OPTIONS.map(o => (
                        <option key={o.id} value={o.id}>{o.label}{o.rate > 0 ? ` (+${(o.rate * 100).toFixed(1)}%)` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Stacking breakdown */}
                {layers.length > 0 ? (
                  <div className="rounded-xl bg-white border border-gray-100 p-2.5 space-y-1.5">
                    {layers.map((layer, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 min-w-0 truncate">
                          <span>{layer.icon}</span>
                          <span className="font-medium" style={{ color: layer.color }}>{layer.name}</span>
                          <span className="text-gray-300 truncate hidden sm:inline">{layer.label}</span>
                        </span>
                        <span className="text-[11px] font-bold flex-shrink-0" style={{ color: layer.color }}>
                          +{(layer.rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                    <div className="pt-1.5 mt-0.5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">合計還元率</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-600">{(totalRate * 100).toFixed(2)}%</span>
                        <span className="text-[10px] text-gray-400 ml-1.5">{monthlyPts.toLocaleString()} pt/月</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-300 text-center py-1">ポイント獲得なし</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100 flex-wrap">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">シミュレーション期間</span>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 3, 6, 12, 24].map(m => (
              <button key={m} onClick={() => setMonths(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                  months === m ? 'bg-slate-900 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {m}ヶ月
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">{months}ヶ月間の合計獲得ポイント価値</p>
        <p className="text-3xl font-bold tracking-tight">¥{(totalJpy + siteBonus).toLocaleString()}</p>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-300">
          <span>ポイント換算 ¥{totalJpy.toLocaleString()}</span>
          {siteBonus > 0 && <span>サイト還元 ¥{siteBonus.toLocaleString()}</span>}
          <span>月間 {totalMonthlyPoints.toLocaleString()} pt</span>
        </div>
      </div>

      {/* Results chart + table */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-800 mb-4">{months}ヶ月間 プログラム別獲得ポイント</p>
        {simulation.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={simulation} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="totalPoints" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {simulation.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <table className="w-full text-sm mt-4 border-t border-gray-50 pt-2">
              <thead>
                <tr>
                  <th className="text-left py-2 text-xs text-gray-400 font-semibold">プログラム</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-semibold">月間</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-semibold">{months}ヶ月合計</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-semibold hidden sm:table-cell">円換算</th>
                </tr>
              </thead>
              <tbody>
                {simulation.map((s, i) => (
                  <tr key={s.programId} className="border-t border-gray-50">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span>{s.icon}</span>
                        <span className="font-medium text-gray-700 text-xs">{s.name || s.programId}</span>
                        {i === 0 && <span className="badge bg-amber-100 text-amber-700 text-[10px]">最多</span>}
                        {s.programId === 'site' && <span className="badge bg-purple-100 text-purple-700 text-[10px]">別途換金</span>}
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-xs">{s.monthlyPoints.toLocaleString()} pt</td>
                    <td className="py-2.5 text-right font-bold text-xs" style={{ color: s.color }}>
                      {s.totalPoints.toLocaleString()} pt
                    </td>
                    <td className="py-2.5 text-right text-emerald-600 font-semibold text-xs hidden sm:table-cell">
                      ¥{s.jpy.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-sm text-gray-300 py-8 text-center">支払い方法を設定してください</p>
        )}
      </div>

      {/* Best combinations */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} className="text-amber-500" />
          <p className="text-sm font-semibold text-gray-800">カテゴリ別おすすめ最大重ね取り</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">「最適化」ボタンを押すとそのカテゴリに自動適用されます</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {bestCombos.map(({ cat, rate, layers, payment, loyalty, site }) => (
            <button key={cat.id} onClick={() => applyBest(cat.id)}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 transition-all text-left active:scale-95">
              <span className="text-xl mt-0.5">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
                  {layers.length >= 2 && (
                    <span className="badge text-white text-[10px]"
                      style={{ backgroundColor: layers.length >= 3 ? '#7c3aed' : '#2563eb' }}>
                      {STACK_LABELS[layers.length]}
                    </span>
                  )}
                  <span className="ml-auto text-xs font-bold text-amber-600">{(rate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {layers.map((l, i) => (
                    <span key={i} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: l.color + '18', color: l.color }}>
                      {l.icon} {l.name} {(l.rate * 100).toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-300 mt-3">※ 還元率は代表的な値です。ポイントサイトはハピタス/モッピー等の参考値。実際はカード・店舗・サービスにより異なります。</p>
      </div>
    </div>
  );
}
