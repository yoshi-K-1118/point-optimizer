import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { AlertTriangle, TrendingUp, Star, Clock, ArrowRight, Wallet, Calculator, Monitor, HardDrive, LogIn, Share2 } from 'lucide-react';
import { POINT_PROGRAMS, CAMPAIGNS } from '../data/pointPrograms';

/* ── Sub-components ── */

function StatCard({ title, value, sub, icon: Icon, accentColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left w-full transition-all duration-200 ${onClick ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="rounded-xl p-2 flex-shrink-0" style={{ backgroundColor: accentColor + '18' }}>
          <Icon size={17} style={{ color: accentColor }} />
        </div>
      </div>
      <div className="mt-3 h-0.5 rounded-full" style={{ backgroundColor: accentColor + '30' }}>
        <div className="h-0.5 rounded-full w-1/2" style={{ backgroundColor: accentColor }} />
      </div>
    </button>
  );
}

function QuickAction({ label, sub, to, icon: Icon, from, gradTo }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="rounded-2xl p-4 text-left text-white hover:opacity-90 active:scale-95 transition-all duration-150 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${from}, ${gradTo})` }}
    >
      <Icon size={18} className="mb-2 opacity-90" />
      <p className="text-sm font-semibold leading-tight">{label}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </button>
  );
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-semibold">{d.name}</p>
      <p className="text-slate-300 mt-0.5">{d.value.toLocaleString()} pt</p>
      <p className="text-slate-400">¥{(d.value * (d.payload.rate ?? 1)).toLocaleString()}</p>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold">{p.value.toLocaleString()} pt</p>
      ))}
    </div>
  );
};

/* ── Main ── */

export default function Dashboard({ points }) {
  const navigate = useNavigate();

  const totalJpy = useMemo(
    () => points.reduce((sum, p) => {
      const prog = POINT_PROGRAMS.find((pr) => pr.id === p.programId);
      return sum + p.balance * (prog?.exchangeRateToJpy ?? 1);
    }, 0),
    [points]
  );

  const totalPoints = useMemo(
    () => points.reduce((s, p) => s + p.balance, 0),
    [points]
  );

  const pieData = useMemo(
    () => points
      .filter((p) => p.balance > 0)
      .map((p) => {
        const prog = POINT_PROGRAMS.find((pr) => pr.id === p.programId);
        return { name: prog?.shortName, value: p.balance, color: prog?.color, rate: prog?.exchangeRateToJpy ?? 1 };
      }),
    [points]
  );

  const trendData = useMemo(() => {
    const all = points
      .filter((p) => p.history?.length >= 2)
      .flatMap((p) => p.history.map((h) => ({ date: h.date.slice(0, 10), value: h.balance })));
    if (all.length < 2) return [];
    const byDate = {};
    all.forEach(({ date, value }) => { byDate[date] = (byDate[date] ?? 0) + value; });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, total]) => ({ date: date.slice(5), total }));
  }, [points]);

  const expiringCount = points.filter((p) => {
    if (!p.expiryDate || !p.expiringPoints) return false;
    const days = (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 30 && days >= 0;
  }).length;

  const activeProgramCount = points.filter((p) => p.balance > 0).length;
  const upcomingCampaigns  = CAMPAIGNS.filter((c) => new Date(c.endDate) >= new Date());

  const recentUpdates = useMemo(
    () => points
      .filter((p) => p.balance > 0 && p.lastUpdated)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 5)
      .map((p) => {
        const prog = POINT_PROGRAMS.find((pr) => pr.id === p.programId);
        const d = new Date(p.lastUpdated);
        return {
          prog,
          balance: p.balance,
          updatedAt: `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`,
        };
      }),
    [points]
  );

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-5">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">合計ポイント資産</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">
            ¥{totalJpy.toLocaleString()}
          </p>
          <p className="text-slate-400 text-sm mt-1">{totalPoints.toLocaleString()} pt · {activeProgramCount} プログラム利用中</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1" />
      </div>

      {/* SNS Share */}
      {totalJpy > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium">シェアする:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`ポイント資産が¥${totalJpy.toLocaleString()}に達しました！#ポイント活用 #ポイ活`)}&url=${encodeURIComponent('https://point-optimizer-yoshi.vercel.app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black text-white rounded-xl hover:opacity-80 transition-opacity"
          >
            <Share2 size={12} />
            X (Twitter)
          </a>
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://point-optimizer-yoshi.vercel.app')}&text=${encodeURIComponent(`ポイント資産¥${totalJpy.toLocaleString()}を管理中！ポイント最適化アプリ`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#06C755] text-white rounded-xl hover:opacity-80 transition-opacity"
          >
            <Share2 size={12} />
            LINE
          </a>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="総合価値"           value={`¥${totalJpy.toLocaleString()}`}        sub="円換算合計"            icon={TrendingUp} accentColor="#2563eb" onClick={() => navigate('/strategy')} />
        <StatCard title="利用中プログラム"   value={`${activeProgramCount} 種`}              sub={`全 ${POINT_PROGRAMS.length} 中`} icon={Star}      accentColor="#10b981" onClick={() => navigate('/points')} />
        <StatCard title="期限間近"           value={`${expiringCount} 件`}                  sub="30日以内"              icon={Clock}      accentColor={expiringCount > 0 ? '#f59e0b' : '#10b981'} onClick={() => navigate('/alerts')} />
        <StatCard title="開催中キャンペーン" value={`${upcomingCampaigns.length} 件`}        sub="お得な特典あり"        icon={AlertTriangle} accentColor="#ef4444" onClick={() => navigate('/campaigns')} />
      </div>

      {/* Data storage notice */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5">
        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
          <HardDrive size={13} />
          このアプリについて
        </p>
        <div className="grid sm:grid-cols-3 gap-2.5">
          <div className="flex items-start gap-2">
            <Monitor size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800">1端末・1ブラウザで利用</p>
              <p className="text-xs text-blue-600 mt-0.5">スマホ・PCなど端末ごとにデータは独立しています。別の端末では同じデータは表示されません。</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HardDrive size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800">ローカルに保存</p>
              <p className="text-xs text-blue-600 mt-0.5">データはこのブラウザのローカルストレージに保存されます。サーバーには送信されません。</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <LogIn size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-800">ログイン不要</p>
              <p className="text-xs text-blue-600 mt-0.5">アカウント登録なしですぐ使えます。ブラウザのキャッシュ削除でデータが消えるためご注意ください。</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction label="ポイントを更新" sub="残高を入力"    to="/points"    icon={Wallet}      from="#2563eb" gradTo="#3b82f6" />
        <QuickAction label="交換戦略を見る" sub="おすすめルート" to="/strategy" icon={TrendingUp}   from="#059669" gradTo="#10b981" />
        <QuickAction label="期限を確認"     sub="アラート一覧"  to="/alerts"   icon={Clock}        from="#d97706" gradTo="#f59e0b" />
        <QuickAction label="シミュレート"   sub="将来を予測"    to="/simulator" icon={Calculator}  from="#7c3aed" gradTo="#8b5cf6" />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Donut */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">ポイント内訳</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 border-t border-gray-50 pt-3">
                {pieData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    {d.name}
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400">{d.value.toLocaleString()}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-4xl">💳</div>
              <p className="text-sm text-gray-400">ポイントを登録してください</p>
              <button onClick={() => navigate('/points')} className="btn-primary text-xs py-1.5 px-3">
                登録する →
              </button>
            </div>
          )}
        </div>

        {/* Trend or Horizontal bar */}
        <div className="card p-5">
          {trendData.length >= 2 ? (
            <>
              <p className="text-sm font-semibold text-gray-800 mb-4">合計残高の推移</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<LineTooltip />} />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800 mb-4">残高ランキング</p>
              {pieData.length > 0 ? (
                <div className="space-y-2.5">
                  {[...pieData].sort((a, b) => b.value - a.value).slice(0, 6).map((d, i) => {
                    const max = pieData.reduce((m, x) => Math.max(m, x.value), 0);
                    const pct = Math.max(4, (d.value / max) * 100);
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{d.name}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: d.color }}
                          >
                            <span className="text-white text-[10px] font-bold whitespace-nowrap">
                              {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">
                  データなし
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Campaigns */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-800">開催中キャンペーン</p>
            <button onClick={() => navigate('/campaigns')} className="btn-ghost text-xs">
              全て見る <ArrowRight size={12} />
            </button>
          </div>
          {upcomingCampaigns.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingCampaigns.map((c) => {
                const prog = POINT_PROGRAMS.find((p) => p.id === c.programId);
                const daysLeft = Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <button key={c.id} onClick={() => navigate('/campaigns')} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors w-full text-left">
                    <span className="text-xl flex-shrink-0">{prog?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">{c.title}</span>
                        <span className="badge text-white text-[10px]" style={{ backgroundColor: prog?.color }}>
                          最大{c.multiplier}倍
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{c.description}</p>
                      <p className="text-xs text-amber-500 font-medium mt-1">残り {daysLeft} 日</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-300 py-8 text-center">現在開催中のキャンペーンはありません</p>
          )}
        </div>

        {/* Recent updates */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-800">最近の更新</p>
            <button onClick={() => navigate('/points')} className="btn-ghost text-xs">
              全て見る <ArrowRight size={12} />
            </button>
          </div>
          {recentUpdates.length > 0 ? (
            <div className="space-y-1">
              {recentUpdates.map(({ prog, balance, updatedAt }, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{prog?.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{prog?.shortName}</p>
                      <p className="text-xs text-gray-300">{updatedAt}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: prog?.color }}>
                    {balance.toLocaleString()} <span className="text-xs font-normal text-gray-400">pt</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="text-4xl">🎯</div>
              <p className="text-sm text-gray-400">まずはポイントを登録しましょう</p>
              <button onClick={() => navigate('/points')} className="btn-primary">
                ポイントを登録する
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
