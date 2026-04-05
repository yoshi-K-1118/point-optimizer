import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { BookOpen, TrendingUp, TrendingDown, Wallet, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SPENDING_CATEGORIES = [
  { id: 'convenience', label: 'コンビニ',   icon: '🏪', color: '#f59e0b' },
  { id: 'supermarket', label: 'スーパー',   icon: '🛒', color: '#10b981' },
  { id: 'restaurant',  label: '飲食店',     icon: '🍽️', color: '#ef4444' },
  { id: 'online',      label: 'ネット通販', icon: '💻', color: '#3b82f6' },
  { id: 'travel',      label: '旅行・交通', icon: '🚅', color: '#8b5cf6' },
  { id: 'gas',         label: 'ガソリン',   icon: '⛽', color: '#f97316' },
  { id: 'utility',     label: '公共料金',   icon: '💡', color: '#64748b' },
];

const INCOME_CATEGORIES = [
  { id: 'salary',  label: '給与・賞与',   icon: '💼' },
  { id: 'side',    label: '副収入',       icon: '💹' },
  { id: 'other',   label: 'その他収入',   icon: '📦' },
];

const SPENDING_DEFAULTS = Object.fromEntries(
  SPENDING_CATEGORIES.map(c => [c.id, 0])
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p style={{ color: payload[0].payload.color ?? '#fff' }} className="font-bold">{payload[0].name}</p>
      <p className="text-slate-200">¥{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export default function Kakeibo() {
  const navigate = useNavigate();

  const [spending] = useLocalStorage('simulator-spending', SPENDING_DEFAULTS);
  const [monthlyPoints] = useLocalStorage('simulator-monthly-points', 0);
  const [incomes, setIncomes] = useLocalStorage('kakeibo-income', [
    { id: 1, categoryId: 'salary', label: '給与', amount: 300000 },
  ]);
  // 数値入力中の文字列を別管理（タイピング中にリセットされないよう）
  const [amountStrs, setAmountStrs] = useState(
    () => Object.fromEntries(incomes.map(i => [i.id, String(i.amount)]))
  );

  const totalExpense = useMemo(
    () => SPENDING_CATEGORIES.reduce((s, c) => s + Number(spending[c.id] || 0), 0),
    [spending]
  );
  const totalIncome = useMemo(
    () => incomes.reduce((s, i) => s + Number(i.amount || 0), 0),
    [incomes]
  );
  const pointJpy = Number(monthlyPoints) || 0;
  const balance = totalIncome + pointJpy - totalExpense;

  const pieData = SPENDING_CATEGORIES
    .map(c => ({ name: c.label, value: Number(spending[c.id] || 0), color: c.color, icon: c.icon }))
    .filter(d => d.value > 0);

  const barData = [
    { name: '収入', value: totalIncome, fill: '#10b981' },
    { name: 'ポイント還元', value: pointJpy, fill: '#3b82f6' },
    { name: '支出', value: totalExpense, fill: '#ef4444' },
  ];

  function addIncome() {
    const newId = Date.now();
    setIncomes([...incomes, { id: newId, categoryId: 'salary', label: '', amount: 0 }]);
    setAmountStrs(prev => ({ ...prev, [newId]: '' }));
  }

  function updateIncomeField(id, field, value) {
    setIncomes(incomes.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function handleAmountChange(id, str) {
    setAmountStrs(prev => ({ ...prev, [id]: str }));
  }

  function handleAmountBlur(id, str) {
    const num = Math.max(0, parseInt(str) || 0);
    setAmountStrs(prev => ({ ...prev, [id]: String(num) }));
    setIncomes(incomes.map(i => i.id === id ? { ...i, amount: num } : i));
  }

  function removeIncome(id) {
    setIncomes(incomes.filter(i => i.id !== id));
    setAmountStrs(prev => { const s = { ...prev }; delete s[id]; return s; });
  }

  return (
    <div className="space-y-5">

      {/* ヘッダー */}
      <div className="rounded-2xl px-6 py-5 shadow-lg relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)' }}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <h1 className="page-title text-white flex items-center gap-2">
          <BookOpen size={22} /> ポイ活家計簿
        </h1>
        <p className="text-white/70 text-sm mt-1">
          シミュレーターの支出データを反映した月次収支管理
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '収入合計',       value: totalIncome,            color: '#10b981', icon: <TrendingUp size={16} />,  prefix: '¥' },
          { label: 'ポイント還元',   value: pointJpy,               color: '#3b82f6', icon: <Wallet size={16} />,      prefix: '+¥' },
          { label: '支出合計',       value: totalExpense,           color: '#ef4444', icon: <TrendingDown size={16} />, prefix: '¥' },
          { label: '収支バランス',   value: balance,                color: balance >= 0 ? '#10b981' : '#ef4444', icon: <Wallet size={16} />, prefix: balance >= 0 ? '+¥' : '¥' },
        ].map(({ label, value, color, icon, prefix }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-2" style={{ color }}>
              {icon}
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            </div>
            <p className="text-xl font-black tracking-tight" style={{ color }}>
              {prefix}{Math.abs(value).toLocaleString()}
              <span className="text-xs font-normal ml-1">円</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* 収入入力 */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="section-title">収入を入力</p>
            <button onClick={addIncome} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 font-medium">
              <Plus size={13} /> 追加
            </button>
          </div>
          <div className="space-y-3">
            {incomes.map(income => (
              <div key={income.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <select
                    value={income.categoryId}
                    onChange={e => updateIncomeField(income.id, 'categoryId', e.target.value)}
                    className="input text-xs py-1.5 flex-shrink-0 w-28"
                  >
                    {INCOME_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="内容"
                    value={income.label}
                    onChange={e => updateIncomeField(income.id, 'label', e.target.value)}
                    className="input text-xs py-1.5 flex-1 min-w-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amountStrs[income.id] ?? ''}
                      onChange={e => handleAmountChange(income.id, e.target.value)}
                      onBlur={e => handleAmountBlur(income.id, e.target.value)}
                      className="input text-xs py-1.5 pr-6 w-full"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>円</span>
                  </div>
                  <button onClick={() => removeIncome(income.id)} className="text-slate-400 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ポイント還元 */}
          <div className="rounded-xl p-3 flex items-center justify-between border border-blue-200/30 bg-blue-500/5">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-blue-400" />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                ポイント還元（シミュレーターより）
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-400">+¥{pointJpy.toLocaleString()}</span>
              <button
                onClick={() => navigate('/simulator')}
                className="text-[10px] text-blue-500 hover:text-blue-400 flex items-center gap-0.5"
              >
                編集 <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* 支出内訳（シミュレーターより） */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="section-title">支出内訳（シミュレーターより）</p>
            <button
              onClick={() => navigate('/simulator')}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 font-medium"
            >
              編集 <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {SPENDING_CATEGORIES.map(cat => {
              const amount = Number(spending[cat.id] || 0);
              const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
              return (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="text-base flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span style={{ color: 'var(--color-text-primary)' }} className="font-medium">{cat.label}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>¥{amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-badge-bg)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                  <span className="text-[10px] w-8 text-right flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* 支出円グラフ */}
        <div className="card p-5">
          <p className="section-title mb-4">支出カテゴリ内訳</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                     dataKey="value" nameKey="name" paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm py-10" style={{ color: 'var(--color-text-muted)' }}>
              シミュレーターで支出を入力してください
            </p>
          )}
        </div>

        {/* 収支棒グラフ */}
        <div className="card p-5">
          <p className="section-title mb-4">月次収支サマリー</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => v >= 10000 ? `${(v/10000).toFixed(0)}万` : v} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip formatter={(v) => [`¥${v.toLocaleString()}`, '']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* 収支メッセージ */}
          <div className={`mt-3 rounded-xl px-4 py-3 text-center text-sm font-bold ${
            balance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {balance >= 0
              ? `月 +¥${balance.toLocaleString()} の黒字です 🎉`
              : `月 ¥${Math.abs(balance).toLocaleString()} の赤字です ⚠️`
            }
          </div>
        </div>
      </div>
    </div>
  );
}
