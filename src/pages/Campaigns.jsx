import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ExternalLink, Clock, Tag } from 'lucide-react';
import { POINT_PROGRAMS } from '../data/pointPrograms';
import CAMPAIGNS from '../data/campaigns.json';

export default function Campaigns() {
  const navigate = useNavigate();
  const now = new Date();

  const active = useMemo(
    () => CAMPAIGNS.filter((c) => new Date(c.endDate) >= now)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate)),
    []
  );

  const expired = useMemo(
    () => CAMPAIGNS.filter((c) => new Date(c.endDate) < now)
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate)),
    []
  );

  function daysLeft(endDate) {
    return Math.ceil((new Date(endDate) - now) / (1000 * 60 * 60 * 24));
  }

  function CampaignCard({ c, isExpired }) {
    const prog = POINT_PROGRAMS.find((p) => p.id === c.programId);
    const days = isExpired ? 0 : daysLeft(c.endDate);
    const urgent = !isExpired && days <= 7;

    return (
      <div className={`card p-4 flex gap-4 ${isExpired ? 'opacity-50' : ''}`}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: (prog?.color ?? '#94a3b8') + '18' }}
        >
          {prog?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {c.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {c.description}
              </p>
            </div>
            <span
              className="badge text-white text-[10px] flex-shrink-0"
              style={{ backgroundColor: prog?.color ?? '#94a3b8' }}
            >
              <Tag size={9} className="mr-0.5" />
              最大{c.multiplier}倍
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`flex items-center gap-1 text-xs font-medium ${
              isExpired ? 'text-gray-400' :
              urgent ? 'text-red-500' : 'text-amber-500'
            }`}>
              <Clock size={11} />
              {isExpired
                ? `終了 (${c.endDate})`
                : urgent
                  ? `残り ${days} 日 — お急ぎください`
                  : `残り ${days} 日 (${c.endDate}まで)`
              }
            </span>
            {c.url && c.url !== '#' && (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                詳細を見る <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Bell size={22} className="text-blue-500" />
          キャンペーン一覧
        </h1>
        <p className="page-sub">各ポイントプログラムの開催中・終了キャンペーン情報</p>
      </div>

      {/* Notice */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        キャンペーン情報は参考情報です。最新の条件・期間は各ポイントプログラムの公式サイトでご確認ください。
      </div>

      {/* Active campaigns */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            開催中 ({active.length} 件)
          </p>
        </div>
        {active.length > 0 ? (
          <div className="space-y-3">
            {active.map((c) => <CampaignCard key={c.id} c={c} isExpired={false} />)}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>現在開催中のキャンペーンはありません</p>
          </div>
        )}
      </section>

      {/* Expired campaigns */}
      {expired.length > 0 && (
        <section>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
            終了したキャンペーン ({expired.length} 件)
          </p>
          <div className="space-y-3">
            {expired.map((c) => <CampaignCard key={c.id} c={c} isExpired={true} />)}
          </div>
        </section>
      )}
    </div>
  );
}
