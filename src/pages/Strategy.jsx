import { useState } from 'react';
import { ArrowRight, Info, ChevronDown, ChevronUp, Calculator, Trophy, Minus, Plane, CreditCard } from 'lucide-react';
import { POINT_PROGRAMS, EXCHANGE_RATES } from '../data/pointPrograms';

/* ──────────────────────────────
   交換計算機（既存流用）
────────────────────────────── */
const MAX_HOPS = 3;

function findAllPaths(fromId, inputPoints) {
  const results = [];
  function dfs(currentId, currentPoints, pathIds) {
    if (pathIds.length > MAX_HOPS) return;
    for (const ex of EXCHANGE_RATES) {
      if (ex.from !== currentId) continue;
      if (pathIds.includes(ex.to)) continue;
      const nextPoints = Math.floor(currentPoints * ex.rate);
      if (nextPoints <= 0) continue;
      const toProg = POINT_PROGRAMS.find(p => p.id === ex.to);
      if (!toProg) continue;
      const newPath = [...pathIds, ex.to];
      const jpy = nextPoints * toProg.exchangeRateToJpy;
      results.push({ pathIds: newPath, finalProgramId: ex.to, finalPoints: nextPoints, jpy, hops: newPath.length - 1, lastNote: ex.note, totalRate: nextPoints / inputPoints });
      dfs(ex.to, nextPoints, newPath);
    }
  }
  dfs(fromId, inputPoints, [fromId]);
  return results.sort((a, b) => b.jpy - a.jpy);
}

function PathResultCard({ rank, result, fromProg, holdJpy, inputPts, isBest }) {
  const [open, setOpen] = useState(isBest);
  const finalProg = POINT_PROGRAMS.find(p => p.id === result.finalProgramId);
  const gain = result.jpy - holdJpy;
  const gainPct = holdJpy > 0 ? ((gain / holdJpy) * 100).toFixed(1) : '0';
  const isProfit = gain > 0;
  const isSame = gain === 0;
  const pathProgs = result.pathIds.map(id => POINT_PROGRAMS.find(p => p.id === id));

  return (
    <div className={`card overflow-hidden transition-shadow hover:shadow-md ${isBest ? 'ring-2 ring-amber-400' : ''}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 p-4 text-left">
        <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
          {isBest ? (
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
              <Trophy size={13} className="text-white" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">{rank}</span>
            </div>
          )}
          {result.hops > 1 && <span className="text-[9px] text-gray-400 font-medium">{result.hops}段階</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {pathProgs.map((p, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ArrowRight size={11} className="text-gray-300 flex-shrink-0" />}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: p?.color + '18', color: p?.color }}>
                  <span>{p?.icon}</span>{p?.shortName}
                </span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="text-base font-bold" style={{ color: finalProg?.color }}>{result.finalPoints.toLocaleString()}</span>
              <span className="text-xs text-gray-400 ml-1">{finalProg?.shortName} pt</span>
            </div>
            <span className="text-gray-200">=</span>
            <div><span className="text-base font-bold text-gray-800">¥{result.jpy.toLocaleString()}</span></div>
            <span className={`badge text-xs ${isProfit ? 'bg-emerald-50 text-emerald-700' : isSame ? 'bg-gray-50 text-gray-500' : 'bg-red-50 text-red-600'}`}>
              {isProfit ? `+¥${gain.toLocaleString()} (+${gainPct}%)` : isSame ? '保有と同等' : `¥${gain.toLocaleString()} (${gainPct}%)`}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`flex-shrink-0 text-gray-300 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-gray-50 bg-slate-50/50 px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500 mb-2">変換ステップ</p>
          {result.pathIds.slice(0, -1).map((id, idx) => {
            const fromP = POINT_PROGRAMS.find(p => p.id === id);
            const toId  = result.pathIds[idx + 1];
            const toP   = POINT_PROGRAMS.find(p => p.id === toId);
            const ex    = EXCHANGE_RATES.find(e => e.from === id && e.to === toId);
            let pts = inputPts;
            for (let k = 0; k < idx; k++) {
              const e = EXCHANGE_RATES.find(e => e.from === result.pathIds[k] && e.to === result.pathIds[k + 1]);
              if (e) pts = Math.floor(pts * e.rate);
            }
            const ptsAfter = Math.floor(pts * (ex?.rate ?? 0));
            return (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: fromP?.color }}>{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span style={{ color: fromP?.color }} className="font-semibold">{fromP?.shortName}</span>
                    <span className="text-gray-400">{pts.toLocaleString()} pt</span>
                    <ArrowRight size={10} className="text-gray-300" />
                    <span style={{ color: toP?.color }} className="font-semibold">{toP?.shortName}</span>
                    <span className="text-gray-400">{ptsAfter.toLocaleString()} pt</span>
                    <span className="text-gray-300 text-[10px]">(×{ex?.rate})</span>
                  </div>
                  {ex?.note && <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1"><Info size={9} className="flex-shrink-0" />{ex.note}</p>}
                </div>
              </div>
            );
          })}
          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
            <span className="text-gray-400">合計変換率: <span className="font-semibold text-gray-600">{(result.totalRate * 100).toFixed(1)}%</span></span>
            <span className="text-gray-400">¥{holdJpy.toLocaleString()} → <span className={`font-semibold ml-1 ${isProfit ? 'text-emerald-600' : isSame ? 'text-gray-600' : 'text-red-500'}`}>¥{result.jpy.toLocaleString()}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function ExchangeCalculator() {
  const [fromId,     setFromId]     = useState(POINT_PROGRAMS[0].id);
  const [inputStr,   setInputStr]   = useState('10000');
  const [results,    setResults]    = useState(null);
  const [calculated, setCalculated] = useState(false);

  const fromProg = POINT_PROGRAMS.find(p => p.id === fromId);
  const inputPts = Math.max(0, parseInt(inputStr.replace(/,/g, ''), 10) || 0);
  const holdJpy  = inputPts * (fromProg?.exchangeRateToJpy ?? 1);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator size={15} className="text-blue-500" />交換シミュレーション
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">交換元プログラム</label>
            <div className="grid grid-cols-3 gap-1.5">
              {POINT_PROGRAMS.map(p => (
                <button key={p.id} onClick={() => { setFromId(p.id); setResults(null); setCalculated(false); }}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-center transition-all ${fromId === p.id ? 'border-2 shadow-sm' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
                  style={fromId === p.id ? { borderColor: p.color, backgroundColor: p.color + '12', color: p.color } : {}}>
                  <span className="text-lg leading-none">{p.icon}</span>
                  <span className="text-[10px] font-semibold leading-tight">{p.shortName}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">交換するポイント数</label>
              <div className="relative">
                <input type="number" value={inputStr}
                  onChange={e => { setInputStr(e.target.value); setCalculated(false); setResults(null); }}
                  className="input text-xl font-bold pr-12" min="1" placeholder="10000" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">pt</span>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[1000, 5000, 10000, 50000].map(v => (
                  <button key={v} onClick={() => { setInputStr(String(v)); setCalculated(false); setResults(null); }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors">
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">そのまま保有: <span className="font-semibold text-gray-600">¥{holdJpy.toLocaleString()}</span></p>
              <button onClick={() => { setResults(findAllPaths(fromId, inputPts)); setCalculated(true); }}
                disabled={inputPts <= 0}
                className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                <Calculator size={14} />最適パスを計算する
              </button>
            </div>
          </div>
        </div>
      </div>
      {calculated && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              計算結果 <span className="text-gray-400 font-normal text-xs">{fromProg?.icon} {fromProg?.name} {inputPts.toLocaleString()} pt →</span>
            </p>
            <span className="text-xs text-gray-400">{results.length} 件</span>
          </div>
          {results.length === 0 ? (
            <div className="card p-8 text-center space-y-2">
              <Minus size={24} className="text-gray-300 mx-auto" />
              <p className="text-sm text-gray-400">交換可能なルートがありません</p>
            </div>
          ) : (
            results.map((r, i) => (
              <PathResultCard key={i} rank={i + 1} result={r} fromProg={fromProg} holdJpy={holdJpy} inputPts={inputPts} isBest={i === 0} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────
   ANA データ
────────────────────────────── */
const ANA_COLOR = '#003087';

const ANA_ALLIANCE = [
  { name: 'United Airlines',          country: '🇺🇸', program: 'MileagePlus' },
  { name: 'Lufthansa',                country: '🇩🇪', program: 'Miles & More' },
  { name: 'Swiss Int\'l Air Lines',   country: '🇨🇭', program: 'Miles & More' },
  { name: 'Austrian Airlines',        country: '🇦🇹', program: 'Miles & More' },
  { name: 'Brussels Airlines',        country: '🇧🇪', program: 'Miles & More' },
  { name: 'Singapore Airlines',       country: '🇸🇬', program: 'KrisFlyer' },
  { name: 'Thai Airways',             country: '🇹🇭', program: 'Royal Orchid Plus' },
  { name: 'Air Canada',               country: '🇨🇦', program: 'Aeroplan' },
  { name: 'Air China',                country: '🇨🇳', program: 'PhoenixMiles' },
  { name: 'Air New Zealand',          country: '🇳🇿', program: 'Airpoints' },
  { name: 'Asiana Airlines',          country: '🇰🇷', program: 'Asiana Club' },
  { name: 'EVA Air',                  country: '🇹🇼', program: 'Infinity MileageLands' },
  { name: 'TAP Air Portugal',         country: '🇵🇹', program: 'Miles&Go' },
  { name: 'AVIANCA',                  country: '🇨🇴', program: 'LifeMiles' },
  { name: 'Ethiopian Airlines',       country: '🇪🇹', program: 'ShebaMiles' },
];

const ANA_STATUS = [
  { tier: 'ブロンズ',   pp: '30,000',  color: '#cd7f32', perks: ['優先チェックイン', '手荷物1個追加', '国内線ラウンジ（一部）'] },
  { tier: 'シルバー',   pp: '50,000',  color: '#a8a8a8', perks: ['国内線ラウンジ（全国）', '国際線ラウンジ（一部）', '座席アップグレード優先'] },
  { tier: 'プラチナ',   pp: '100,000', color: '#b8860b', perks: ['国内・国際線ラウンジ全利用', 'アップグレードポイント付与', '特典航空券優先予約'] },
  { tier: 'ダイヤモンド', pp: '150,000', color: '#4fc3f7', perks: ['全ラウンジ利用（同伴1名含む）', '専用デスク対応', 'スーパーフライヤーズ会員権資格'] },
];

const ANA_LOUNGES = [
  { airport: '羽田 T2（国内線）',  lounge: 'ANAラウンジ', access: 'プレミアム以上・ビジネス以上' },
  { airport: '羽田 T3（国際線）',  lounge: 'ANAラウンジ / ANAスイートラウンジ', access: 'スイート：ダイヤ・ファースト・ビジネス' },
  { airport: '成田 T1',           lounge: 'ANAラウンジ / ANAスイートラウンジ', access: 'スイート：ダイヤ・ファースト・ビジネス' },
  { airport: '伊丹',              lounge: 'ANAラウンジ', access: 'プレミアム以上' },
  { airport: '関西',              lounge: 'ANAラウンジ', access: 'プレミアム以上' },
  { airport: '新千歳',            lounge: 'ANAラウンジ', access: 'プレミアム以上' },
  { airport: '福岡',              lounge: 'ANAラウンジ', access: 'プレミアム以上' },
  { airport: '那覇',              lounge: 'ANAラウンジ', access: 'プレミアム以上' },
];

const ANA_MILE_TIPS = [
  { label: 'ポイント → マイル交換',  body: '楽天・d・Ponta・Vポイント → 2pt = 1マイル。Oki Dokiポイントは高レート移行あり（10pt = 6マイル）。' },
  { label: 'ANAカード直接積算',      body: 'ANAワイドゴールド：1マイル/100円。ショッピングマイルプレミアム加入で100円 = 2マイルに倍増。' },
  { label: 'ANAマイレージモール',    body: '経由してネット通販するだけで追加マイル。Amazonや楽天など多数対応。フライト搭乗なしで陸マイルを獲得可能。' },
  { label: 'スターアライアンス加盟便', body: '提携23社のフライトでANAマイルが積算可能。United・Lufthansa・シンガポール航空など。' },
];

/* ──────────────────────────────
   JAL データ
────────────────────────────── */
const JAL_COLOR = '#c8102e';

const JAL_ALLIANCE = [
  { name: 'American Airlines',   country: '🇺🇸', program: 'AAdvantage' },
  { name: 'British Airways',     country: '🇬🇧', program: 'Executive Club' },
  { name: 'Cathay Pacific',      country: '🇭🇰', program: 'Asia Miles' },
  { name: 'Qantas',              country: '🇦🇺', program: 'Frequent Flyer' },
  { name: 'Qatar Airways',       country: '🇶🇦', program: 'Privilege Club' },
  { name: 'Finnair',             country: '🇫🇮', program: 'Finnair Plus' },
  { name: 'Iberia',              country: '🇪🇸', program: 'Iberia Plus' },
  { name: 'Malaysia Airlines',   country: '🇲🇾', program: 'Enrich' },
  { name: 'Alaska Airlines',     country: '🇺🇸', program: 'Mileage Plan' },
  { name: 'Royal Air Maroc',     country: '🇲🇦', program: 'Safar Flyer' },
  { name: 'Royal Jordanian',     country: '🇯🇴', program: 'Royal Club' },
  { name: 'SriLankan Airlines',  country: '🇱🇰', program: 'FlySmiLes' },
  { name: 'Oneworld加盟 計13社', country: '🌐', program: 'ステータスマッチあり' },
];

const JAL_STATUS = [
  { tier: 'クリスタル',      pp: '30,000',  color: '#b0c4de', perks: ['優先チェックイン', '専用カウンター利用', '手荷物無料追加'] },
  { tier: 'サファイア/JGC',  pp: '50,000',  color: '#1e88e5', perks: ['国内・国際線サクララウンジ', 'JGC永年資格取得可能', '座席アップグレード優先'] },
  { tier: 'JGCプレミア',     pp: '80,000',  color: '#8e24aa', perks: ['プレミアムエコノミー優先', 'ダイヤモンド一部特典', 'マイル有効期限延長'] },
  { tier: 'ダイヤモンド',    pp: '100,000', color: '#4fc3f7', perks: ['ファーストクラスラウンジ', '同伴者ラウンジ無料', 'JALグローバルクラブ特典'] },
];

const JAL_LOUNGES = [
  { airport: '羽田 T1（国内線）',  lounge: 'JALサクララウンジ / ダイヤモンドプレミアラウンジ', access: 'サファイア以上・ビジネス以上' },
  { airport: '羽田 T3（国際線）',  lounge: 'JALファーストクラスラウンジ / サクララウンジ', access: 'ファースト：ダイヤ・ファーストクラス' },
  { airport: '成田 T2',           lounge: 'JALサクララウンジ / JALファーストクラスラウンジ', access: 'ファースト：ダイヤ・ファーストクラス' },
  { airport: '伊丹',              lounge: 'JALサクララウンジ', access: 'サファイア以上' },
  { airport: '関西',              lounge: 'JALサクララウンジ', access: 'サファイア以上' },
  { airport: '新千歳',            lounge: 'JALサクララウンジ', access: 'サファイア以上' },
  { airport: '福岡',              lounge: 'JALサクララウンジ', access: 'サファイア以上' },
  { airport: '那覇',              lounge: 'JALサクララウンジ', access: 'サファイア以上' },
];

const JAL_MILE_TIPS = [
  { label: 'ポイント → マイル交換',   body: '楽天・d・Ponta・Vポイント → 2pt = 1マイル。WAONポイントも2pt = 1JALマイルに交換可能。' },
  { label: 'JALカード直接積算',       body: 'CLUB-Aゴールド：1マイル/100円。ショッピングマイル・プレミアム入会で100円 = 2マイルに倍増。搭乗ボーナス最大25%。' },
  { label: 'JALショッピングモール',   body: 'JALのネット通販モール経由で追加マイル。フライトなしで陸マイルを積み上げ可能。' },
  { label: 'ワンワールド加盟便',      body: 'BA・キャセイ・カンタス・アメリカン航空など13社のフライトでJALマイル積算。ステータスマッチも活用可能。' },
];

/* ──────────────────────────────
   特典航空券 必要マイル数
────────────────────────────── */
const AWARD_ROUTES = [
  { category: '国内線',       route: '東京 ↔ 大阪',             anaMiles: 4500,  jalMiles: 4500,  anaValue: '¥9,000〜22,500', jalValue: '¥9,000〜22,500' },
  { category: '国内線',       route: '東京 ↔ 札幌・福岡',        anaMiles: 6000,  jalMiles: 6000,  anaValue: '¥12,000〜30,000', jalValue: '¥12,000〜30,000' },
  { category: '国内線',       route: '東京 ↔ 沖縄',             anaMiles: 9000,  jalMiles: 9000,  anaValue: '¥18,000〜45,000', jalValue: '¥18,000〜45,000' },
  { category: '近距離国際線', route: '日本 ↔ 韓国・上海',        anaMiles: 12000, jalMiles: 12000, anaValue: '¥24,000〜60,000', jalValue: '¥24,000〜60,000' },
  { category: '近距離国際線', route: '日本 ↔ 台湾・香港',        anaMiles: 15000, jalMiles: 15000, anaValue: '¥30,000〜75,000', jalValue: '¥30,000〜75,000' },
  { category: '近距離国際線', route: '日本 ↔ タイ・シンガポール', anaMiles: 25000, jalMiles: 25000, anaValue: '¥50,000〜125,000', jalValue: '¥50,000〜125,000' },
  { category: '長距離国際線', route: '日本 ↔ ホノルル',          anaMiles: 35000, jalMiles: 35000, anaValue: '¥70,000〜175,000', jalValue: '¥70,000〜175,000' },
  { category: '長距離国際線', route: '日本 ↔ ヨーロッパ',        anaMiles: 55000, jalMiles: 55000, anaValue: '¥110,000〜550,000+', jalValue: '¥110,000〜550,000+' },
  { category: '長距離国際線', route: '日本 ↔ ニューヨーク',      anaMiles: 55000, jalMiles: 55000, anaValue: '¥110,000〜550,000+', jalValue: '¥110,000〜550,000+' },
];

const CATEGORY_COLORS = { '国内線': '#10b981', '近距離国際線': '#2563eb', '長距離国際線': '#7c3aed' };

/* ──────────────────────────────
   サブコンポーネント
────────────────────────────── */
function AllianceTable({ members, color }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">航空会社</th>
              <th className="text-left px-4 py-2.5 text-gray-400 font-semibold whitespace-nowrap">FFP プログラム</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((m, i) => (
              <tr key={i} className="hover:bg-gray-50/40 transition-colors">
                <td className="px-4 py-2.5 font-medium text-gray-700">
                  <span className="mr-1.5">{m.country}</span>{m.name}
                </td>
                <td className="px-4 py-2.5 text-gray-400">{m.program}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusTable({ tiers, color }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {tiers.map((t, i) => (
        <div key={i} className="card p-4 border-l-4" style={{ borderColor: t.color }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
            <p className="text-sm font-bold text-gray-800">{t.tier}</p>
            <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">{t.pp} PP / 年</span>
          </div>
          <ul className="space-y-1">
            {t.perks.map((perk, j) => (
              <li key={j} className="flex items-start gap-1.5 text-xs text-gray-500">
                <span className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-gray-300" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LoungeTable({ lounges, color }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left px-4 py-2.5 text-gray-400 font-semibold whitespace-nowrap">空港</th>
              <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">ラウンジ名</th>
              <th className="text-left px-4 py-2.5 text-gray-400 font-semibold hidden sm:table-cell">利用条件</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lounges.map((l, i) => (
              <tr key={i} className="hover:bg-gray-50/40 transition-colors">
                <td className="px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">{l.airport}</td>
                <td className="px-4 py-2.5 text-gray-600" style={{ color }}>{l.lounge}</td>
                <td className="px-4 py-2.5 text-gray-400 hidden sm:table-cell">{l.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-300 px-4 py-2 border-t border-gray-50">※ 利用条件はステータス・搭乗クラスにより異なります。最新情報は各社公式サイトでご確認ください。</p>
    </div>
  );
}

function MileTipList({ tips, color }) {
  return (
    <div className="space-y-3">
      {tips.map((t, i) => (
        <div key={i} className="card p-4 flex gap-3">
          <span className="flex-shrink-0 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          <div>
            <p className="text-xs font-semibold text-gray-800 mb-1">{t.label}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{t.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────
   ANAタブコンテンツ
────────────────────────────── */
function AnaTab() {
  const [section, setSection] = useState('alliance');
  const sections = [
    { value: 'alliance', label: 'アライアンス' },
    { value: 'status',   label: 'ステータス' },
    { value: 'lounge',   label: 'ラウンジ' },
    { value: 'earn',     label: 'マイルの貯め方' },
  ];
  return (
    <div className="space-y-4">
      {/* ANA ヒーロー */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #001f5b 0%, #003087 60%, #1a4fa0 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">✈️</div>
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-widest">All Nippon Airways</p>
            <p className="text-lg font-bold">ANA マイレージクラブ</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-blue-200">アライアンス</p>
            <p className="text-sm font-bold text-yellow-300">Star Alliance</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">23</p>
            <p className="text-[10px] text-blue-200">加盟航空会社</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">1,300+</p>
            <p className="text-[10px] text-blue-200">就航都市数</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">36</p>
            <p className="text-[10px] text-blue-200">マイル有効期限（月）</p>
          </div>
        </div>
      </div>

      {/* サブメニュー */}
      <div className="flex gap-1.5 flex-wrap">
        {sections.map(s => (
          <button key={s.value} onClick={() => setSection(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              section === s.value ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={section === s.value ? { backgroundColor: ANA_COLOR } : {}}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'alliance' && (
        <div className="space-y-3">
          <div className="card p-4 border-l-4 border-yellow-400 bg-yellow-50">
            <p className="text-xs font-semibold text-yellow-800 mb-1">Star Alliance とは</p>
            <p className="text-xs text-yellow-700 leading-relaxed">
              世界最大規模の航空アライアンス。ANAマイルは加盟23社のフライトで積算・利用でき、相互にラウンジも利用可能です。提携便の特典航空券はANA公式サイトから予約できます。
            </p>
          </div>
          <AllianceTable members={ANA_ALLIANCE} color={ANA_COLOR} />
        </div>
      )}

      {section === 'status' && (
        <div className="space-y-3">
          <div className="card p-4 border-l-4 bg-blue-50" style={{ borderColor: ANA_COLOR }}>
            <p className="text-xs font-semibold mb-1" style={{ color: ANA_COLOR }}>プレミアムポイント（PP）について</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              ステータスは1月〜12月の1年間に獲得したプレミアムポイント（PP）で決まります。PPはANA便・スターアライアンス加盟便の搭乗で積算されます。スーパーフライヤーズカード（SFC）取得でプラチナ特典を永年保持できます。
            </p>
          </div>
          <StatusTable tiers={ANA_STATUS} color={ANA_COLOR} />
        </div>
      )}

      {section === 'lounge' && (
        <div className="space-y-3">
          <div className="card p-4 border-l-4 bg-slate-50" style={{ borderColor: ANA_COLOR }}>
            <p className="text-xs font-semibold text-gray-700 mb-1">ラウンジ利用について</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              ANAラウンジはプレミアムステータス会員またはビジネスクラス以上の搭乗者が利用可能。ANAスイートラウンジはダイヤモンド会員・ファーストクラス搭乗者向けのプレミアムラウンジです。海外ではスターアライアンス加盟社ラウンジも利用可能です。
            </p>
          </div>
          <LoungeTable lounges={ANA_LOUNGES} color={ANA_COLOR} />
        </div>
      )}

      {section === 'earn' && (
        <div className="space-y-3">
          <MileTipList tips={ANA_MILE_TIPS} color={ANA_COLOR} />
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard size={13} className="text-blue-600" />ANAマイラー向けクレジットカード（参考）
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-400 font-semibold">カード</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold whitespace-nowrap">マイル還元</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold whitespace-nowrap">年会費</th>
                    <th className="text-left py-2 pl-3 text-gray-400 font-semibold hidden sm:table-cell">備考</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: 'ANA スーパーフライヤーズ ゴールド', rate: '1M/100円', fee: '15,400円〜', note: 'SFC会員向け・プラチナ同等特典' },
                    { name: 'ANAワイドゴールドカード',           rate: '1M/100円', fee: '15,400円',   note: 'フライトボーナス25%・ラウンジ可' },
                    { name: 'ANA VISAプラチナ スーパーフライヤーズ', rate: '1M/100円', fee: '88,000円', note: '空港送迎・コンシェルジュ' },
                    { name: 'ANAカード（一般）',                 rate: '0.5M/100円', fee: '2,200円',  note: '初心者向け・入会ボーナス' },
                  ].map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/40">
                      <td className="py-2.5 pr-4 font-medium text-gray-700">{c.name}</td>
                      <td className="py-2.5 px-3 text-right font-bold" style={{ color: ANA_COLOR }}>{c.rate}</td>
                      <td className="py-2.5 px-3 text-right text-gray-500 whitespace-nowrap">{c.fee}</td>
                      <td className="py-2.5 pl-3 text-gray-400 hidden sm:table-cell">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-300 mt-3">※ 還元率・年会費は参考値です。詳細はANA公式サイトでご確認ください。</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────
   JALタブコンテンツ
────────────────────────────── */
function JalTab() {
  const [section, setSection] = useState('alliance');
  const sections = [
    { value: 'alliance', label: 'アライアンス' },
    { value: 'status',   label: 'ステータス' },
    { value: 'lounge',   label: 'ラウンジ' },
    { value: 'earn',     label: 'マイルの貯め方' },
  ];
  return (
    <div className="space-y-4">
      {/* JAL ヒーロー */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #8b0000 0%, #c8102e 60%, #e63950 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🛫</div>
          <div>
            <p className="text-xs text-red-200 uppercase tracking-widest">Japan Airlines</p>
            <p className="text-lg font-bold">JAL マイレージバンク</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-red-200">アライアンス</p>
            <p className="text-sm font-bold text-yellow-300">oneworld</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">13</p>
            <p className="text-[10px] text-red-200">加盟航空会社</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">1,000+</p>
            <p className="text-[10px] text-red-200">就航都市数</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">36</p>
            <p className="text-[10px] text-red-200">マイル有効期限（月）</p>
          </div>
        </div>
      </div>

      {/* サブメニュー */}
      <div className="flex gap-1.5 flex-wrap">
        {sections.map(s => (
          <button key={s.value} onClick={() => setSection(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              section === s.value ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={section === s.value ? { backgroundColor: JAL_COLOR } : {}}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'alliance' && (
        <div className="space-y-3">
          <div className="card p-4 border-l-4 border-yellow-400 bg-yellow-50">
            <p className="text-xs font-semibold text-yellow-800 mb-1">oneworld とは</p>
            <p className="text-xs text-yellow-700 leading-relaxed">
              British Airways・アメリカン航空・キャセイパシフィック・カンタスなど13社が加盟するアライアンス。ヨーロッパ・北米・オセアニアに強く、JALマイルで提携便の特典航空券が予約可能です。ステータスホルダーは加盟社のラウンジを相互利用できます。
            </p>
          </div>
          <AllianceTable members={JAL_ALLIANCE} color={JAL_COLOR} />
        </div>
      )}

      {section === 'status' && (
        <div className="space-y-3">
          <div className="card p-4 border-l-4 bg-red-50" style={{ borderColor: JAL_COLOR }}>
            <p className="text-xs font-semibold mb-1" style={{ color: JAL_COLOR }}>FLY ON ポイント（FOP）について</p>
            <p className="text-xs text-red-700 leading-relaxed">
              ステータスは1月〜12月の1年間に獲得したFLY ONポイントで決まります。サファイア取得者はJALグローバルクラブ（JGC）に入会でき、永年サファイア同等特典を保持できます（JGCカード継続が条件）。
            </p>
          </div>
          <StatusTable tiers={JAL_STATUS} color={JAL_COLOR} />
        </div>
      )}

      {section === 'lounge' && (
        <div className="space-y-3">
          <div className="card p-4 border-l-4 bg-slate-50" style={{ borderColor: JAL_COLOR }}>
            <p className="text-xs font-semibold text-gray-700 mb-1">ラウンジ利用について</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              JALサクララウンジはサファイア以上のステータス会員またはビジネスクラス搭乗者が利用可能。JALファーストクラスラウンジはダイヤモンド会員・ファーストクラス搭乗者のみ。海外ではoneworld加盟社のエメラルドラウンジ（ダイヤ相当）も利用可能です。
            </p>
          </div>
          <LoungeTable lounges={JAL_LOUNGES} color={JAL_COLOR} />
        </div>
      )}

      {section === 'earn' && (
        <div className="space-y-3">
          <MileTipList tips={JAL_MILE_TIPS} color={JAL_COLOR} />
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard size={13} className="text-red-600" />JALマイラー向けクレジットカード（参考）
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-400 font-semibold">カード</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold whitespace-nowrap">マイル還元</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-semibold whitespace-nowrap">年会費</th>
                    <th className="text-left py-2 pl-3 text-gray-400 font-semibold hidden sm:table-cell">備考</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: 'JAL CLUB-Aゴールドカード',    rate: '1M/100円', fee: '17,600円', note: '搭乗ボーナス25%・ショッピングマイル高還元' },
                    { name: 'JAL プラチナ',                rate: '1M/100円', fee: '34,100円', note: 'コンシェルジュ・プライオリティパス' },
                    { name: 'JAL JGCプレミア SAISON GOLD', rate: '1M/100円', fee: '22,000円', note: 'JGC会員向け・サファイア相当特典永年' },
                    { name: 'JALカード（普通）',            rate: '0.5M/100円', fee: '2,200円', note: '初心者向け・搭乗ボーナス10%' },
                  ].map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/40">
                      <td className="py-2.5 pr-4 font-medium text-gray-700">{c.name}</td>
                      <td className="py-2.5 px-3 text-right font-bold" style={{ color: JAL_COLOR }}>{c.rate}</td>
                      <td className="py-2.5 px-3 text-right text-gray-500 whitespace-nowrap">{c.fee}</td>
                      <td className="py-2.5 pl-3 text-gray-400 hidden sm:table-cell">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-300 mt-3">※ 還元率・年会費は参考値です。詳細はJAL公式サイトでご確認ください。</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────
   メインコンポーネント
────────────────────────────── */
export default function Strategy() {
  const [tab, setTab] = useState('ana');

  const TABS = [
    { value: 'ana',        label: 'ANAマイル',    icon: '✈️' },
    { value: 'jal',        label: 'JALマイル',    icon: '🛫' },
    { value: 'routes',     label: '特典航空券',   icon: '🗺️' },
    { value: 'calculator', label: '交換計算機',   icon: '🔢' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="page-title flex items-center gap-2">
          <Plane size={22} className="text-blue-500" />
          マイル交換ガイド
        </h2>
        <p className="page-sub">ANA・JALのマイル経済圏、アライアンス、ラウンジ情報をまとめたマイラー向けガイド</p>
      </div>

      {/* マイル価値バナー */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-2">1マイルの価値の目安</p>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <p className="text-white text-xs font-medium">現金換算</p>
            <p className="text-slate-300 text-sm font-bold">約 ¥2</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="flex flex-col gap-0.5">
            <p className="text-white text-xs font-medium">国内線特典航空券</p>
            <p className="text-emerald-400 text-sm font-bold">約 ¥3〜5</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="flex flex-col gap-0.5">
            <p className="text-white text-xs font-medium">国際線ビジネス</p>
            <p className="text-amber-400 text-sm font-bold">約 ¥5〜10</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="flex flex-col gap-0.5">
            <p className="text-white text-xs font-medium">国際線ファースト</p>
            <p className="text-yellow-300 text-sm font-bold">約 ¥10+</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-100 rounded-xl p-1 gap-1 shadow-sm flex-wrap">
        {TABS.map(({ value, label, icon }) => (
          <button key={value} onClick={() => setTab(value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === value ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
            }`}>
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {tab === 'ana'        && <AnaTab />}
      {tab === 'jal'        && <JalTab />}

      {/* ── Tab: 特典航空券の目安 ── */}
      {tab === 'routes' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            <span className="font-semibold">※ 参考情報：</span>
            必要マイル数はエコノミークラス・ローシーズンの目安です。時期・クラス・路線によって大きく異なります。最新情報はANA/JAL公式サイトでご確認ください。
          </div>
          {['国内線', '近距離国際線', '長距離国際線'].map(category => (
            <div key={category} className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
                style={{ backgroundColor: CATEGORY_COLORS[category] + '10' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
                <p className="text-xs font-semibold" style={{ color: CATEGORY_COLORS[category] }}>{category}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/40">
                      <th className="text-left px-5 py-2 text-xs text-gray-400 font-semibold">路線</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: ANA_COLOR }}>✈️ ANA</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: JAL_COLOR }}>🛫 JAL</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-400 font-semibold hidden sm:table-cell whitespace-nowrap">現金換算目安</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AWARD_ROUTES.filter(r => r.category === category).map(route => (
                      <tr key={route.route} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                        <td className="px-5 py-3 text-xs text-gray-700 font-medium">{route.route}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-bold" style={{ color: ANA_COLOR }}>{route.anaMiles.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 ml-0.5">M</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-bold" style={{ color: JAL_COLOR }}>{route.jalMiles.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 ml-0.5">M</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400 hidden sm:table-cell">{route.anaValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'calculator' && <ExchangeCalculator />}
    </div>
  );
}
