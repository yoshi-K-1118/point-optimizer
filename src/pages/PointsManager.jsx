import { useState, useMemo } from 'react';
import { Edit3, Check, X, ArrowUpDown, SlidersHorizontal, Download, Upload } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { POINT_PROGRAMS } from '../data/pointPrograms';

function Sparkline({ history, color }) {
  if (!history || history.length < 2) return null;
  const data = history.slice(-10).map((h) => ({ v: h.balance }));
  return (
    <ResponsiveContainer width={64} height={24}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          formatter={(v) => [`${v.toLocaleString()} pt`]}
          contentStyle={{ fontSize: 11, background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', padding: '4px 8px' }}
          itemStyle={{ color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function PointCard({ program, pointData, onSave }) {
  const [editing, setEditing] = useState(false);
  const [balance,    setBalance]    = useState(pointData.balance);
  const [expiring,   setExpiring]   = useState(pointData.expiringPoints);
  const [expiryDate, setExpiryDate] = useState(pointData.expiryDate ?? '');

  const handleSave = () => {
    onSave(program.id, balance, expiring, expiryDate || null);
    setEditing(false);
  };
  const handleCancel = () => {
    setBalance(pointData.balance);
    setExpiring(pointData.expiringPoints);
    setExpiryDate(pointData.expiryDate ?? '');
    setEditing(false);
  };

  const daysToExpiry = expiryDate
    ? Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const expiryBadge =
    daysToExpiry === null       ? null
    : daysToExpiry <= 0         ? { label: '期限切れ',         cls: 'bg-red-100 text-red-600' }
    : daysToExpiry <= 7         ? { label: `残り ${daysToExpiry}日`, cls: 'bg-red-100 text-red-600 font-bold' }
    : daysToExpiry <= 30        ? { label: `残り ${daysToExpiry}日`, cls: 'bg-amber-100 text-amber-700' }
    :                             { label: `残り ${daysToExpiry}日`, cls: 'bg-gray-100 text-gray-500' };

  const lastUpdated = pointData.lastUpdated
    ? (() => {
        const d = new Date(pointData.lastUpdated);
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
      })()
    : null;

  const hasBalance = pointData.balance > 0;

  return (
    <div className={`card overflow-hidden transition-all duration-200 hover:shadow-md ${!hasBalance && !editing ? 'opacity-60' : ''}`}>
      {/* Color accent top bar */}
      <div className="h-1 w-full" style={{ backgroundColor: program.color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none">{program.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{program.name}</p>
              <p className="text-xs text-gray-400">{program.description}</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>

        {editing ? (
          /* ── Edit form ── */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1 block">残高 (pt)</label>
                <input type="number" value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="input" placeholder="0" min="0" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1 block">期限間近 (pt)</label>
                <input type="number" value={expiring}
                  onChange={(e) => setExpiring(e.target.value)}
                  className="input" placeholder="0" min="0" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">有効期限</label>
              <input type="date" value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} className="btn-primary text-xs py-1.5 px-3">
                <Check size={12} /> 保存
              </button>
              <button onClick={handleCancel} className="btn-secondary text-xs py-1.5 px-3">
                <X size={12} /> キャンセル
              </button>
            </div>
          </div>
        ) : (
          /* ── Display ── */
          <>
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-3xl font-bold tracking-tight" style={{ color: program.color }}>
                  {pointData.balance.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 ml-1">pt</span>
                {pointData.expiringPoints > 0 && (
                  <p className="text-xs text-amber-500 mt-0.5">
                    期限間近: {pointData.expiringPoints.toLocaleString()} pt
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Sparkline history={pointData.history} color={program.color} />
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    ¥{(pointData.balance * program.exchangeRateToJpy).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
              {expiryBadge ? (
                <span className={`badge text-xs px-2 py-0.5 ${expiryBadge.cls}`}>
                  {expiryBadge.label}
                </span>
              ) : (
                <span className="text-xs text-gray-300">期限未設定</span>
              )}
              {lastUpdated && (
                <span className="text-xs text-gray-300">{lastUpdated}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'balance_desc', label: '残高多い順' },
  { value: 'balance_asc',  label: '残高少ない順' },
  { value: 'expiry_asc',   label: '期限近い順' },
  { value: 'name_asc',     label: '名前順' },
];

export default function PointsManager({ points, onUpdateBalance }) {
  const [sort,   setSort]   = useState('balance_desc');
  const [filter, setFilter] = useState('all');

  const total       = points.reduce((s, p) => s + p.balance * (POINT_PROGRAMS.find((pr) => pr.id === p.programId)?.exchangeRateToJpy ?? 1), 0);
  const totalPoints = points.reduce((s, p) => s + p.balance, 0);
  const activeCount = points.filter((p) => p.balance > 0).length;

  const sorted = useMemo(() => {
    let list = POINT_PROGRAMS.map((prog) => ({
      prog,
      data: points.find((p) => p.programId === prog.id) ?? { balance: 0, expiringPoints: 0, expiryDate: null, history: [] },
    }));
    if (filter === 'active')   list = list.filter(({ data }) => data.balance > 0);
    if (filter === 'expiring') list = list.filter(({ data }) => {
      if (!data.expiryDate || !data.expiringPoints) return false;
      return (new Date(data.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
    });
    return [...list].sort((a, b) => {
      if (sort === 'balance_desc') return b.data.balance - a.data.balance;
      if (sort === 'balance_asc')  return a.data.balance - b.data.balance;
      if (sort === 'expiry_asc') {
        const da = a.data.expiryDate ? new Date(a.data.expiryDate) : Infinity;
        const db = b.data.expiryDate ? new Date(b.data.expiryDate) : Infinity;
        return da - db;
      }
      return a.prog.name.localeCompare(b.prog.name, 'ja');
    });
  }, [points, sort, filter]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h2 className="page-title">ポイント管理</h2>
        <p className="page-sub">各ポイントの残高を入力・管理します</p>
      </div>

      {/* Summary banner */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 pt-5 pb-4">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">合計資産価値</p>
          <p className="text-4xl font-bold text-white mt-1.5 tracking-tight">¥{total.toLocaleString()}</p>
          <p className="text-blue-300 text-sm mt-1">
            {totalPoints.toLocaleString()} pt · {activeCount} プログラム有効
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-1" />
      </div>

      {/* Export / Import */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            const data = JSON.stringify(points, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `point-optimizer-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-100 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download size={13} />
          データをエクスポート
        </button>
        <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-100 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload size={13} />
          データをインポート
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const parsed = JSON.parse(ev.target.result);
                  if (Array.isArray(parsed) && parsed[0]?.programId !== undefined) {
                    parsed.forEach((p) => {
                      if (p.programId && p.balance !== undefined) {
                        onUpdateBalance(p.programId, p.balance, p.expiringPoints ?? 0, p.expiryDate ?? null);
                      }
                    });
                    alert('インポートが完了しました');
                  } else {
                    alert('ファイルの形式が正しくありません');
                  }
                } catch {
                  alert('ファイルの読み込みに失敗しました');
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </label>
        <p className="text-xs text-slate-400 ml-1">
          ※ キャッシュ削除前にバックアップを推奨
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white border border-gray-100 rounded-xl p-1 gap-1 shadow-sm">
          {[
            { value: 'all',      label: 'すべて' },
            { value: 'active',   label: '保有中' },
            { value: 'expiring', label: '期限間近' },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
          <ArrowUpDown size={12} className="text-gray-400" />
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="text-xs text-gray-600 bg-transparent focus:outline-none cursor-pointer">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <div className="text-4xl">🔍</div>
          <p className="text-gray-400 text-sm">条件に合うプログラムがありません</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map(({ prog, data }) => (
            <PointCard key={prog.id} program={prog} pointData={data} onSave={onUpdateBalance} />
          ))}
        </div>
      )}
    </div>
  );
}
