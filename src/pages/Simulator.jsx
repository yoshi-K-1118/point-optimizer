import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import { RotateCcw, BookmarkPlus, BarChart2, TrendingUp } from 'lucide-react';
import { POINT_PROGRAMS } from '../data/pointPrograms';

const SPENDING_CATEGORIES = [
  { id: 'convenience', label: 'コンビニ',  icon: '🏪', monthlyDefault: 8000 },
  { id: 'supermarket', label: 'スーパー',  icon: '🛒', monthlyDefault: 30000 },
  { id: 'restaurant',  label: '飲食店',    icon: '🍽️', monthlyDefault: 20000 },
  { id: 'online',      label: 'ネット通販',icon: '💻', monthlyDefault: 15000 },
  { id: 'travel',      label: '旅行・交通',icon: '🚅', monthlyDefault: 10000 },
  { id: 'gas',         label: 'ガソリン',  icon: '⛽', monthlyDefault: 8000 },
  { id: 'utility',     label: '公共料金',  icon: '💡', monthlyDefault: 20000 },
];

const PROGRAM_RATES = {
  rakuten: { convenience: 0.01, supermarket: 0.01, restaurant: 0.01, online: 0.03, travel: 0.01, gas: 0.01, utility: 0.01 },
  vpoint:  { convenience: 0.05, supermarket: 0.01, restaurant: 0.05, online: 0.01, travel: 0.01, gas: 0.01, utility: 0.01 },
  dpoint:  { convenience: 0.05, supermarket: 0.01, restaurant: 0.05, online: 0.01, travel: 0.01, gas: 0.01, utility: 0.02 },
  ponta:   { convenience: 0.01, supermarket: 0.01, restaurant: 0.01, online: 0.01, travel: 0.01, gas: 0.02, utility: 0.01 },
  paypay:  { convenience: 0.05, supermarket: 0.01, restaurant: 0.05, online: 0.01, travel: 0.01, gas: 0.01, utility: 0.01 },
  waon:    { convenience: 0.005,supermarket: 0.01, restaurant: 0.005,online: 0.005,travel: 0.005,gas: 0.005,utility: 0.005 },
  nanaco:  { convenience: 0.01, supermarket: 0.005,restaurant: 0.005,online: 0.005,travel: 0.005,gas: 0.005,utility: 0.005 },
};

const PRESETS = [
  { label: '標準家庭',   icon: '🏠', values: { convenience: 10000, supermarket: 40000, restaurant: 15000, online: 10000, travel: 5000,  gas: 8000,  utility: 20000 } },
  { label: 'ネット通販派',icon: '💻', values: { convenience: 5000,  supermarket: 20000, restaurant: 10000, online: 50000, travel: 5000,  gas: 3000,  utility: 15000 } },
  { label: 'ドライバー', icon: '🚗', values: { convenience: 15000, supermarket: 25000, restaurant: 20000, online: 5000,  travel: 20000, gas: 30000, utility: 15000 } },
  { label: '外食多め',   icon: '🍜', values: { convenience: 8000,  supermarket: 10000, restaurant: 50000, online: 5000,  travel: 10000, gas: 5000,  utility: 15000 } },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#fff' }} className="font-semibold">
          {p.name ?? ''} {p.value?.toLocaleString()} pt
        </p>
      ))}
    </div>
  );
};

export default function Simulator() {
  const [spending,   setSpending]   = useState(Object.fromEntries(SPENDING_CATEGORIES.map((c) => [c.id, c.monthlyDefault])));
  const [months,     setMonths]     = useState(12);
  const [chartType,  setChartType]  = useState('bar');

  const totalMonthly = Object.values(spending).reduce((s, v) => s + Number(v || 0), 0);

  const simulation = useMemo(() => {
    return Object.entries(PROGRAM_RATES).map(([programId, rates]) => {
      const prog = POINT_PROGRAMS.find((p) => p.id === programId);
      const monthlyPoints = SPENDING_CATEGORIES.reduce((sum, cat) =>
        sum + Math.floor(Number(spending[cat.id] || 0) * (rates[cat.id] ?? 0.01)), 0);
      const totalPoints = monthlyPoints * months;
      const jpy = totalPoints * (prog?.exchangeRateToJpy ?? 1);
      return {
        programId, name: prog?.shortName ?? programId, fullName: prog?.name ?? programId,
        color: prog?.color ?? '#888', icon: prog?.icon ?? '•',
        monthlyPoints, totalPoints, jpy,
        returnRate: totalMonthly > 0 ? (monthlyPoints / totalMonthly) * 100 : 0,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [spending, months, totalMonthly]);

  const lineData = useMemo(() =>
    Array.from({ length: Math.min(months, 24) }, (_, i) => {
      const mo = i + 1;
      const entry = { month: `${mo}M` };
      simulation.slice(0, 4).forEach((s) => { entry[s.name] = s.monthlyPoints * mo; });
      return entry;
    }),
  [simulation, months]);

  const bestPerCat = useMemo(() =>
    SPENDING_CATEGORIES.map((cat) => {
      let bestId = null, bestRate = 0;
      Object.entries(PROGRAM_RATES).forEach(([id, rates]) => {
        if ((rates[cat.id] ?? 0) > bestRate) { bestRate = rates[cat.id]; bestId = id; }
      });
      return { cat, prog: POINT_PROGRAMS.find((p) => p.id === bestId), rate: bestRate };
    }),
  []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="page-title">シミュレーター</h2>
        <p className="page-sub">支出パターンから獲得ポイントを予測します</p>
      </div>

      {/* Presets */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">プリセット</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button key={preset.label} onClick={() => setSpending(preset.values)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl text-sm text-gray-700 transition-all active:scale-95">
              <span>{preset.icon}</span>
              {preset.label}
            </button>
          ))}
          <button onClick={() => setSpending(Object.fromEntries(SPENDING_CATEGORIES.map((c) => [c.id, c.monthlyDefault])))}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-sm text-gray-400 transition-all active:scale-95">
            <RotateCcw size={12} /> リセット
          </button>
        </div>
      </div>

      {/* Spending inputs */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800">月間支出</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">合計</span>
            <span className="font-bold text-blue-600">¥{totalMonthly.toLocaleString()}<span className="text-xs font-normal text-gray-400">/月</span></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SPENDING_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1">
                <span>{cat.icon}</span>{cat.label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs">¥</span>
                <input type="number" value={spending[cat.id]}
                  onChange={(e) => setSpending((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                  className="input pl-7" min="0" step="1000" />
              </div>
            </div>
          ))}
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">シミュレーション期間</span>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 3, 6, 12, 24].map((m) => (
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

      {/* Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800">{months}ヶ月間の獲得ポイント予測</p>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[
              { v: 'bar',  l: '比較', Icon: BarChart2 },
              { v: 'line', l: '推移', Icon: TrendingUp },
            ].map(({ v, l, Icon }) => (
              <button key={v} onClick={() => setChartType(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  chartType === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>
                <Icon size={12} />{l}
              </button>
            ))}
          </div>
        </div>

        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={simulation} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="totalPoints" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {simulation.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                interval={Math.max(0, Math.floor(months / 6) - 1)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {simulation.slice(0, 4).map((s) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color}
                  strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Results table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{months}ヶ月間 試算結果</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-semibold">プログラム</th>
              <th className="text-right px-5 py-2.5 text-xs text-gray-400 font-semibold">月間</th>
              <th className="text-right px-5 py-2.5 text-xs text-gray-400 font-semibold">合計</th>
              <th className="text-right px-5 py-2.5 text-xs text-gray-400 font-semibold hidden sm:table-cell">円換算</th>
              <th className="text-right px-5 py-2.5 text-xs text-gray-400 font-semibold hidden md:table-cell">還元率</th>
            </tr>
          </thead>
          <tbody>
            {simulation.map((s, i) => (
              <tr key={s.programId} className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50 ${i === 0 ? 'bg-amber-50/50' : ''}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.icon}</span>
                    <span className="font-medium text-gray-700">{s.name}</span>
                    {i === 0 && <span className="badge bg-amber-100 text-amber-700 text-[10px]">最高</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right text-gray-500 text-xs">{s.monthlyPoints.toLocaleString()} pt</td>
                <td className="px-5 py-3.5 text-right font-bold" style={{ color: s.color }}>
                  {s.totalPoints.toLocaleString()} <span className="text-xs font-normal text-gray-400">pt</span>
                </td>
                <td className="px-5 py-3.5 text-right text-emerald-600 font-semibold hidden sm:table-cell">¥{s.jpy.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right text-gray-400 text-xs hidden md:table-cell">{s.returnRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Best per category */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookmarkPlus size={15} className="text-blue-500" />
          <p className="text-sm font-semibold text-gray-800">カテゴリ別おすすめカード</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {bestPerCat.map(({ cat, prog, rate }) => (
            <div key={cat.id} className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-500">{cat.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{prog?.icon}</span>
                <span className="text-xs font-bold" style={{ color: prog?.color }}>{prog?.shortName}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{(rate * 100).toFixed(1)}% 還元</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
