import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  AlertTriangle, TrendingUp, Star, Clock, ArrowRight, Wallet,
  Calculator, Monitor, HardDrive, LogIn, Plane,
} from 'lucide-react';
import { POINT_PROGRAMS } from '../data/pointPrograms';
import CAMPAIGNS from '../data/campaigns.json';

/* ── Sub-components ── */

function StatCard({ title, value, sub, icon: Icon, accentColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`card p-4 text-left w-full ${onClick ? 'card-hover cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="stat-label">{title}</p>
          <p className="stat-value mt-1">{value}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
        </div>
        <div className="rounded-xl p-2 flex-shrink-0" style={{ backgroundColor: accentColor + '18' }}>
          <Icon size={17} style={{ color: accentColor }} />
        </div>
      </div>
      <div className="mt-3 h-0.5 rounded-full" style={{ backgroundColor: accentColor + '25' }}>
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
      className="rounded-2xl p-4 text-left text-white hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md"
      style={{ background: `linear-gradient(135deg, ${from}, ${gradTo})` }}
    >
      <Icon size={18} className="mb-2.5 opacity-90" />
      <p className="text-sm font-semibold leading-tight">{label}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </button>
  );
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700">
      <p className="font-semibold">{d.name}</p>
      <p className="text-slate-300 mt-0.5">{d.value.toLocaleString()} pt</p>
      <p className="text-slate-400">¥{(d.value * (d.payload.rate ?? 1)).toLocaleString()}</p>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700">
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

      {/* ── Hero ── */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <div
          className="px-6 pt-6 pb-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">合計ポイント資産</p>
          <p className="text-4xl font-black text-white tracking-tight">
            ¥{totalJpy.toLocaleString()}
          </p>
          <p className="text-slate-400 text-sm mt-1.5">
            {totalPoints.toLocaleString()} pt
            <span className="mx-2 text-slate-700">·</span>
            {activeProgramCount} プログラム利用中
          </p>
        </div>
        {/* Accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
      </div>

      {/* ── SNS Share ── */}
      {totalJpy > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>シェアする:</span>
          {[
            {
              label: 'X (Twitter)',
              href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`ポイント資産が¥${totalJpy.toLocaleString()}に達しました！#ポイント活用 #ポイ活`)}&url=${encodeURIComponent('https://point-optimizer-one.vercel.app')}`,
              bg: '#000000',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
            },
            {
              label: 'LINE',
              href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://point-optimizer-one.vercel.app')}&text=${encodeURIComponent(`ポイント資産¥${totalJpy.toLocaleString()}を管理中！ポイント最適化アプリ`)}`,
              bg: '#06C755',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>,
            },
            {
              label: 'Facebook',
              href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://point-optimizer-one.vercel.app')}`,
              bg: '#1877F2',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
            },
            {
              label: 'Instagram',
              href: `https://www.instagram.com/explore/tags/ポイ活/`,
              bg: '#E1306C',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
            },
            {
              label: 'TikTok',
              href: `https://www.tiktok.com/tag/ポイ活`,
              bg: '#010101',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
            },
            {
              label: 'YouTube',
              href: `https://www.youtube.com/results?search_query=ポイ活`,
              bg: '#FF0000',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
            },
          ].map(({ label, href, bg, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className="flex items-center justify-center w-8 h-8 rounded-xl text-white hover:opacity-75 transition-opacity"
              style={{ backgroundColor: bg }}
            >
              {icon}
            </a>
          ))}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="総合価値"           value={`¥${totalJpy.toLocaleString()}`}       sub="円換算合計"                   icon={TrendingUp}    accentColor="#2563eb" onClick={() => navigate('/strategy')} />
        <StatCard title="利用中プログラム"   value={`${activeProgramCount} 種`}             sub={`全 ${POINT_PROGRAMS.length} 中`} icon={Star}        accentColor="#10b981" onClick={() => navigate('/points')} />
        <StatCard title="期限間近"           value={`${expiringCount} 件`}                  sub="30日以内"                     icon={Clock}         accentColor={expiringCount > 0 ? '#f59e0b' : '#10b981'} onClick={() => navigate('/alerts')} />
        <StatCard title="開催中キャンペーン" value={`${upcomingCampaigns.length} 件`}       sub="お得な特典あり"               icon={AlertTriangle} accentColor="#ef4444" onClick={() => navigate('/campaigns')} />
      </div>

      {/* ── App Notice ── */}
      <div
        className="rounded-2xl px-4 py-3.5 border"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.07), rgba(99,102,241,0.05))',
          borderColor: 'rgba(99,102,241,0.18)',
        }}
      >
        <p className="text-xs font-semibold text-blue-400 mb-2.5 flex items-center gap-1.5">
          <HardDrive size={12} />
          このアプリについて
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Monitor,   title: '1端末・1ブラウザで利用',   body: 'スマホ・PCなど端末ごとにデータは独立しています。別の端末では同じデータは表示されません。' },
            { icon: HardDrive, title: 'ローカルに保存',           body: 'データはこのブラウザのローカルストレージに保存されます。サーバーには送信されません。' },
            { icon: LogIn,     title: 'ログイン不要',             body: 'アカウント登録なしですぐ使えます。ブラウザのキャッシュ削除でデータが消えるためご注意ください。' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-2">
              <Icon size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-300">{title}</p>
                <p className="text-xs text-blue-400/70 mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction label="ポイントを更新" sub="残高を入力"              to="/points"   icon={Wallet}      from="#1d4ed8" gradTo="#3b82f6" />
        <QuickAction label="マイル交換"     sub="マイル換算・特典航空券"  to="/strategy" icon={Plane}       from="#047857" gradTo="#10b981" />
        <QuickAction label="期限を確認"     sub="アラート一覧"            to="/alerts"   icon={Clock}       from="#b45309" gradTo="#f59e0b" />
        <QuickAction label="シミュレート"   sub="将来を予測"              to="/simulator" icon={Calculator} from="#6d28d9" gradTo="#8b5cf6" />
      </div>

      {/* ── Charts ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Donut */}
        <div className="card p-5">
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>ポイント内訳</p>
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
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t divider">
                {pieData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    {d.name}
                    <span style={{ color: 'var(--color-card-border)' }}>·</span>
                    {d.value.toLocaleString()}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                   style={{ background: 'var(--color-badge-bg)' }}>💳</div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ポイントを登録してください</p>
              <button onClick={() => navigate('/points')} className="btn-primary text-xs py-1.5 px-3">
                登録する →
              </button>
            </div>
          )}
        </div>

        {/* Trend / Bar */}
        <div className="card p-5">
          {trendData.length >= 2 ? (
            <>
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>合計残高の推移</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<LineTooltip />} />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>残高ランキング</p>
              {pieData.length > 0 ? (
                <div className="space-y-2.5">
                  {[...pieData].sort((a, b) => b.value - a.value).slice(0, 6).map((d, i) => {
                    const max = pieData.reduce((m, x) => Math.max(m, x.value), 0);
                    const pct = Math.max(4, (d.value / max) * 100);
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <span className="text-xs w-10 text-right flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                          {d.name}
                        </span>
                        <div className="flex-1 rounded-full h-5 overflow-hidden" style={{ background: 'var(--color-badge-bg)' }}>
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
                <div className="h-[200px] flex items-center justify-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  データなし
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Campaigns */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>開催中キャンペーン</p>
            <button onClick={() => navigate('/campaigns')} className="btn-ghost text-xs">
              全て見る <ArrowRight size={12} />
            </button>
          </div>
          {upcomingCampaigns.length > 0 ? (
            <div className="space-y-2">
              {upcomingCampaigns.map((c) => {
                const prog = POINT_PROGRAMS.find((p) => p.id === c.programId);
                const daysLeft = Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate('/campaigns')}
                    className="flex gap-3 p-3 rounded-xl w-full text-left transition-colors duration-150"
                    style={{ background: 'var(--color-badge-bg)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-table-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-badge-bg)'}
                  >
                    <span className="text-xl flex-shrink-0">{prog?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{c.title}</span>
                        <span className="badge text-white text-[10px]" style={{ backgroundColor: prog?.color }}>
                          最大{c.multiplier}倍
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{c.description}</p>
                      <p className="text-xs text-amber-500 font-medium mt-1">残り {daysLeft} 日</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              現在開催中のキャンペーンはありません
            </p>
          )}
        </div>

        {/* Recent Updates */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>最近の更新</p>
            <button onClick={() => navigate('/points')} className="btn-ghost text-xs">
              全て見る <ArrowRight size={12} />
            </button>
          </div>
          {recentUpdates.length > 0 ? (
            <div className="space-y-0.5">
              {recentUpdates.map(({ prog, balance, updatedAt }, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b last:border-0 divider"
                  style={{ borderColor: 'var(--color-divider)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{prog?.icon}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{prog?.shortName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{updatedAt}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: prog?.color }}>
                    {balance.toLocaleString()} <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>pt</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="text-4xl">🎯</div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>まずはポイントを登録しましょう</p>
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
