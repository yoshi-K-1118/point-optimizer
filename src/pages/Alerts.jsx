import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { POINT_PROGRAMS } from '../data/pointPrograms';

const SEVERITY = {
  expired: {
    bg: 'bg-red-50', border: 'border-red-200', accent: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700',
    icon: <AlertTriangle size={15} className="text-red-500" />,
    bar: 'bg-red-400',
  },
  urgent: {
    bg: 'bg-orange-50', border: 'border-orange-200', accent: 'border-l-orange-500',
    badge: 'bg-orange-100 text-orange-700',
    icon: <AlertTriangle size={15} className="text-orange-500" />,
    bar: 'bg-orange-400',
  },
  warning: {
    bg: 'bg-amber-50', border: 'border-amber-200', accent: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    icon: <Clock size={15} className="text-amber-500" />,
    bar: 'bg-amber-400',
  },
  normal: {
    bg: 'bg-blue-50', border: 'border-blue-100', accent: 'border-l-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    icon: <Clock size={15} className="text-blue-400" />,
    bar: 'bg-blue-300',
  },
};

function getSeverityKey(daysLeft) {
  if (daysLeft <= 0)  return 'expired';
  if (daysLeft <= 7)  return 'urgent';
  if (daysLeft <= 30) return 'warning';
  return 'normal';
}

function AlertCard({ program, pointData, daysLeft }) {
  const navigate = useNavigate();
  const sev = SEVERITY[getSeverityKey(daysLeft)];
  const prog = POINT_PROGRAMS.find((p) => p.id === pointData.programId);
  const jpyValue = pointData.expiringPoints * (prog?.exchangeRateToJpy ?? 1);
  const isExpired = daysLeft <= 0;
  const barWidth  = Math.max(2, Math.min(100, (daysLeft / 90) * 100));

  return (
    <div className={`rounded-2xl border border-l-4 ${sev.bg} ${sev.border} ${sev.accent} p-4 transition-shadow hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{program.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {sev.icon}
            <span className="text-sm font-semibold text-gray-800">{program.name}</span>
            <span className={`badge text-xs ml-auto ${sev.badge}`}>
              {isExpired ? '期限切れ' : `残り ${daysLeft} 日`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/70 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400 font-medium">期限間近</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{pointData.expiringPoints.toLocaleString()}<span className="text-xs font-normal text-gray-400"> pt</span></p>
            </div>
            <div className="bg-white/70 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400 font-medium">円換算</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">¥{jpyValue.toLocaleString()}</p>
            </div>
            <div className="bg-white/70 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400 font-medium">期限日</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{pointData.expiryDate}</p>
            </div>
          </div>

          {!isExpired && (
            <div className="mt-3 bg-white/50 rounded-full h-1.5 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all ${sev.bar}`} style={{ width: `${barWidth}%` }} />
            </div>
          )}

          {!isExpired && (
            <button onClick={() => navigate('/strategy')}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <TrendingUp size={12} />
              交換戦略を確認する
              <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label, count, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-xs text-gray-400">({count}件)</span>
    </div>
  );
}

export default function Alerts({ points }) {
  const navigate = useNavigate();

  const items = points
    .filter((p) => p.expiryDate && p.expiringPoints > 0)
    .map((p) => {
      const prog = POINT_PROGRAMS.find((pr) => pr.id === p.programId);
      const daysLeft = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return { program: prog, pointData: p, daysLeft };
    })
    .filter((i) => i.program)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const expired  = items.filter((i) => i.daysLeft <= 0);
  const urgent   = items.filter((i) => i.daysLeft > 0 && i.daysLeft <= 7);
  const warning  = items.filter((i) => i.daysLeft > 7 && i.daysLeft <= 30);
  const normal   = items.filter((i) => i.daysLeft > 30);

  const atRiskJpy = [...urgent, ...warning].reduce((sum, item) => {
    const prog = item.program;
    return sum + item.pointData.expiringPoints * (prog?.exchangeRateToJpy ?? 1);
  }, 0);

  const noExpiry = points
    .filter((p) => p.balance > 0 && !p.expiryDate)
    .map((p) => POINT_PROGRAMS.find((pr) => pr.id === p.programId))
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="page-title">期限アラート</h2>
        <p className="page-sub">期限間近のポイントを確認します</p>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '期限切れ',      value: expired.length,  bg: 'from-red-500 to-red-600' },
            { label: '緊急 (7日以内)', value: urgent.length,   bg: 'from-orange-500 to-orange-600' },
            { label: '注意 (30日以内)',value: warning.length,  bg: 'from-amber-500 to-amber-600' },
            { label: '失効リスク',     value: `¥${atRiskJpy.toLocaleString()}`, bg: 'from-slate-700 to-slate-800' },
          ].map(({ label, value, bg }) => (
            <div key={label} className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-white shadow-sm`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs opacity-70 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <CheckCircle size={40} className="text-emerald-400 mx-auto" />
          <div>
            <p className="text-gray-700 font-semibold">期限間近のポイントはありません</p>
            <p className="text-gray-400 text-sm mt-1">「ポイント管理」から有効期限を設定するとアラートが表示されます</p>
          </div>
          <button onClick={() => navigate('/points')} className="btn-primary mx-auto">
            ポイント管理へ
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {expired.length > 0 && (
            <section>
              <SectionHeader label="期限切れ" count={expired.length} color="#ef4444" />
              <div className="space-y-2.5">{expired.map((item, i) => <AlertCard key={i} {...item} />)}</div>
            </section>
          )}
          {urgent.length > 0 && (
            <section>
              <SectionHeader label="緊急 — 7日以内" count={urgent.length} color="#f97316" />
              <div className="space-y-2.5">{urgent.map((item, i) => <AlertCard key={i} {...item} />)}</div>
            </section>
          )}
          {warning.length > 0 && (
            <section>
              <SectionHeader label="注意 — 30日以内" count={warning.length} color="#f59e0b" />
              <div className="space-y-2.5">{warning.map((item, i) => <AlertCard key={i} {...item} />)}</div>
            </section>
          )}
          {normal.length > 0 && (
            <section>
              <SectionHeader label="通常 — 30日超" count={normal.length} color="#93c5fd" />
              <div className="space-y-2.5">{normal.map((item, i) => <AlertCard key={i} {...item} />)}</div>
            </section>
          )}
        </div>
      )}

      {/* No expiry notice */}
      {noExpiry.length > 0 && (
        <div className="card p-4 border-l-4 border-l-gray-300">
          <p className="text-xs font-semibold text-gray-500 mb-2">有効期限が未設定のプログラム（{noExpiry.length}件）</p>
          <div className="flex flex-wrap gap-2">
            {noExpiry.map((prog) => (
              <span key={prog.id} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 rounded-full px-3 py-1 text-gray-600">
                {prog.icon} {prog.shortName}
              </span>
            ))}
          </div>
          <button onClick={() => navigate('/points')}
            className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:underline">
            ポイント管理で設定 <ArrowRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
