import { useState, useMemo } from 'react';
import { CreditCard, BarChart2, Lightbulb, Star, Check, ExternalLink } from 'lucide-react';
import { CREDIT_CARDS, CREDIT_CARDS_DETAIL } from '../data/pointSites';
import { POINT_PROGRAMS } from '../data/pointPrograms';

const TABS = [
  { id: 'list',    label: 'カード一覧',       icon: CreditCard },
  { id: 'compare', label: 'カード比較',       icon: BarChart2 },
  { id: 'recommend', label: '用途別おすすめ', icon: Lightbulb },
];

function CardFavicon({ card, size = 28 }) {
  const prog = POINT_PROGRAMS.find(p => p.id === card.programId);
  const domain = prog?.url ? new URL(prog.url).hostname : null;
  if (!domain) return <span style={{ fontSize: size * 0.85 }}>{card.icon}</span>;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={card.name}
      width={size}
      height={size}
      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.insertAdjacentText('afterend', card.icon); }}
    />
  );
}

// カード一覧用に CREDIT_CARDS と CREDIT_CARDS_DETAIL をマージ
function mergedCards() {
  return CREDIT_CARDS
    .filter((c) => c.id !== 'none')
    .map((c) => ({
      ...c,
      ...(CREDIT_CARDS_DETAIL.find((d) => d.id === c.id) ?? {}),
    }));
}

function ProgramBadge({ programId }) {
  const prog = POINT_PROGRAMS.find((p) => p.id === programId);
  if (!prog) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: prog.color }}
    >
      {prog.icon} {prog.shortName}
    </span>
  );
}

// ── Tab 1: カード一覧 ──────────────────────────────────────────────────────

function CardItem({ card }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: card.color }} />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
              style={{ backgroundColor: card.color + '18' }}
            >
              <CardFavicon card={card} size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{card.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{card.annualFeeNote ?? '—'}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black" style={{ color: card.color }}>
              {(card.onlineRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">基本還元率</div>
          </div>
        </div>

        {/* Program + tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <ProgramBadge programId={card.programId} />
          {(card.tags ?? []).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{tag}</span>
          ))}
        </div>

        {/* Best for */}
        {card.bestFor && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.bestFor.map((b) => (
              <span key={b} className="px-2 py-0.5 text-xs rounded-full border border-slate-200 text-slate-600">
                ✓ {b}
              </span>
            ))}
          </div>
        )}

        {/* Expand features */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? '▲ 閉じる' : '▼ 主な特典を見る'}
        </button>

        {expanded && card.features && (
          <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2">
            {card.features.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-sm text-slate-700">
                <Check size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Apply button */}
        {card.applyUrl && card.applyUrl !== '#' && (
          <a
            href={card.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: card.color }}
          >
            <ExternalLink size={13} />
            申し込む
          </a>
        )}
      </div>
    </div>
  );
}

function ListTab() {
  const cards = useMemo(() => mergedCards().sort((a, b) => b.onlineRate - a.onlineRate), []);
  const [filterProgram, setFilterProgram] = useState('all');

  const programs = useMemo(() => {
    const ids = [...new Set(cards.map((c) => c.programId).filter(Boolean))];
    return ids.map((id) => POINT_PROGRAMS.find((p) => p.id === id)).filter(Boolean);
  }, [cards]);

  const filtered = filterProgram === 'all'
    ? cards
    : cards.filter((c) => c.programId === filterProgram);

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterProgram('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterProgram === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          すべて
        </button>
        {programs.map((prog) => (
          <button
            key={prog.id}
            onClick={() => setFilterProgram(prog.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterProgram === prog.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={filterProgram === prog.id ? { backgroundColor: prog.color } : {}}
          >
            {prog.icon} {prog.shortName}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: カード比較 ──────────────────────────────────────────────────────

function CompareTab() {
  const cards = useMemo(() => mergedCards(), []);
  const [selected, setSelected] = useState(['rakuten_card', 'recruit_card', 'smbc_vpoint']);

  const MAX = 3;

  function toggle(id) {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < MAX) {
      setSelected([...selected, id]);
    }
  }

  const compareCards = selected.map((id) => cards.find((c) => c.id === id)).filter(Boolean);

  const ROWS = [
    { label: '基本還元率',  render: (c) => <span className="font-bold text-lg" style={{ color: c.color }}>{(c.onlineRate * 100).toFixed(1)}%</span> },
    { label: '年会費',      render: (c) => <span className={c.annualFee === 0 ? 'text-green-600 font-semibold' : 'text-slate-700'}>{c.annualFeeNote ?? '—'}</span> },
    { label: 'ポイント種別', render: (c) => <ProgramBadge programId={c.programId} /> },
    { label: 'おすすめ用途', render: (c) => (
      <div className="flex flex-wrap gap-1">
        {(c.bestFor ?? []).map((b) => <span key={b} className="text-xs px-1.5 py-0.5 bg-slate-100 rounded-full text-slate-600">{b}</span>)}
      </div>
    )},
    { label: '主な特典',    render: (c) => (
      <ul className="space-y-1 text-left">
        {(c.features ?? []).map((f) => (
          <li key={f} className="flex items-start gap-1 text-xs text-slate-700">
            <Check size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    )},
  ];

  return (
    <div>
      {/* Card selector */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          比較するカードを最大3枚選択
        </p>
        <div className="flex flex-wrap gap-2">
          {cards.map((card) => {
            const active = selected.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => toggle(card.id)}
                disabled={!active && selected.length >= MAX}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  active
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
                style={active ? { backgroundColor: card.color, borderColor: card.color } : {}}
              >
                {card.icon} {card.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      {compareCards.length >= 2 ? (
        <div className="card overflow-hidden">
          {/* Card header row */}
          <div className={`grid gap-0 border-b border-slate-100`} style={{ gridTemplateColumns: `140px repeat(${compareCards.length}, 1fr)` }}>
            <div className="p-3 bg-slate-50" />
            {compareCards.map((card) => (
              <div key={card.id} className="p-3 text-center border-l border-slate-100">
                <div className="flex justify-center mb-1"><CardFavicon card={card} size={28} /></div>
                <div className="font-bold text-sm text-slate-800 leading-tight">{card.name}</div>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className="grid gap-0 border-b border-slate-50 last:border-0"
              style={{ gridTemplateColumns: `140px repeat(${compareCards.length}, 1fr)` }}
            >
              <div className={`p-3 text-xs font-semibold text-slate-500 flex items-center ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                {row.label}
              </div>
              {compareCards.map((card) => (
                <div key={card.id} className={`p-3 text-center border-l border-slate-100 flex items-center justify-center ${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                  {row.render(card)}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-slate-400">
          <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">2枚以上選択すると比較表が表示されます</p>
        </div>
      )}
    </div>
  );
}

// ── Tab 3: 用途別おすすめ ──────────────────────────────────────────────────

const USECASES = [
  {
    label: 'ネット通販',
    icon: '🛒',
    description: 'Amazon・楽天市場などのネットショッピング',
    picks: ['rakuten_card', 'recruit_card', 'jcb_card_w'],
    reason: {
      rakuten_card: '楽天市場で最大3%、ポイントサイト経由でさらに積算可',
      recruit_card: '基本1.2%と高還元。Ponta変換でローソン等でも使える',
      jcb_card_w:   'Amazon等で最大10.5%還元。39歳以下なら年会費無料',
    },
  },
  {
    label: 'コンビニ・飲食',
    icon: '🏪',
    description: 'セブン・ローソン・ファミマなどの日常利用',
    picks: ['smbc_vpoint', 'dcard', 'seven_card'],
    reason: {
      smbc_vpoint: '対象コンビニ・飲食店でタッチ決済すると最大7%還元',
      dcard:       'ローソンで3%還元。ドコモユーザーならさらにお得',
      seven_card:  'セブン-イレブンでnanacoポイント1.5%。nanaco一体型で便利',
    },
  },
  {
    label: '旅行・出張',
    icon: '✈️',
    description: 'フライト・ホテル・旅行予約',
    picks: ['ana_card', 'jal_card', 'epos_card'],
    reason: {
      ana_card:  'ANA搭乗でボーナスマイル。マイル特典航空券の価値は高い',
      jal_card:  'JAL搭乗でボーナスマイル。国内線特典に使いやすい',
      epos_card: '年会費無料で海外旅行保険が自動付帯。サブカードに最適',
    },
  },
  {
    label: '普段使い（汎用）',
    icon: '💳',
    description: 'まず1枚持つなら',
    picks: ['rakuten_card', 'recruit_card', 'orico_card'],
    reason: {
      rakuten_card: '年会費無料で還元率1%。楽天経済圏との相性も抜群',
      recruit_card: '基本1.2%で業界最高水準。どこで使っても損しない',
      orico_card:   '年会費無料で基本1%。入会後6ヶ月は2%とお得な入会特典',
    },
  },
  {
    label: 'ゴールドカード',
    icon: '🥇',
    description: '特典・保険・ラウンジなど上位サービスを求める方',
    picks: ['smbc_gold', 'dcard_gold', 'rakuten_gold'],
    reason: {
      smbc_gold:    '年間100万円利用で翌年以降永年無料。コンビニ最大7%は据え置き',
      dcard_gold:   'ドコモ料金が10%還元。月8,000円以上使うなら年会費を回収できる',
      rakuten_gold: '年会費2,200円で楽天市場が+2倍。楽天経済圏ならコスパ良好',
    },
  },
  {
    label: 'マイル最大化',
    icon: '✈️',
    description: 'ANAマイル・JALマイルを効率よく貯めたい',
    picks: ['ana_card_gold', 'jal_card_gold', 'amex_green'],
    reason: {
      ana_card_gold: 'ショッピングマイル1%（通常の2倍）。SFC修行にも有効',
      jal_card_gold: 'ショッピングマイル1%。プレミアクラス搭乗機会が増える方に',
      amex_green:    '複数航空会社のマイルに柔軟に交換可能。国際マイル収集向き',
    },
  },
];

function RecommendTab() {
  const cards = useMemo(() => mergedCards(), []);
  const [activeUsecase, setActiveUsecase] = useState(USECASES[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Left: use case selector */}
      <div className="md:col-span-1 space-y-1">
        {USECASES.map((uc) => (
          <button
            key={uc.label}
            onClick={() => setActiveUsecase(uc)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left font-medium transition-colors border ${
              activeUsecase.label === uc.label
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-slate-700 hover:bg-slate-50 border-transparent'
            }`}
          >
            <span className="text-base">{uc.icon}</span>
            {uc.label}
          </button>
        ))}
      </div>

      {/* Right: picks */}
      <div className="md:col-span-3">
        <div className="mb-3">
          <h3 className="font-bold text-slate-800">{activeUsecase.icon} {activeUsecase.label}</h3>
          <p className="text-sm text-slate-500">{activeUsecase.description}</p>
        </div>

        <div className="space-y-3">
          {activeUsecase.picks.map((id, i) => {
            const card = cards.find((c) => c.id === id);
            if (!card) return null;
            return (
              <div
                key={id}
                className="card p-4 flex items-start gap-4"
              >
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden"
                    style={{ backgroundColor: card.color + '18' }}
                  >
                    <CardFavicon card={card} size={26} />
                  </div>
                  {i === 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star size={11} className="fill-amber-500" />
                      No.1
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-800">{card.name}</span>
                    <span className="font-black text-lg flex-shrink-0" style={{ color: card.color }}>
                      {(card.onlineRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <ProgramBadge programId={card.programId} />
                    <span className={`text-xs font-medium ${card.annualFee === 0 ? 'text-green-600' : 'text-slate-500'}`}>
                      {card.annualFeeNote}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{activeUsecase.reason[id]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function CreditCards() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div>
      {/* Header */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 shadow-lg">
        <h1 className="page-title text-white">クレジットカード</h1>
        <p className="text-emerald-200 text-sm mt-1">
          還元率・年会費・用途から最適なカードを見つけよう
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'list'      && <ListTab />}
      {activeTab === 'compare'   && <CompareTab />}
      {activeTab === 'recommend' && <RecommendTab />}
    </div>
  );
}
