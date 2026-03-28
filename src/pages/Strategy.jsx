import { useState, useMemo } from 'react';
import { ArrowRight, Star, Info, ChevronDown, ChevronUp, Calculator, Trophy, Minus } from 'lucide-react';
import { POINT_PROGRAMS, EXCHANGE_RATES } from '../data/pointPrograms';

/* ── Path-finding algorithm ──
   DFS で fromId から到達できる全経路を探索（最大 MAX_HOPS ホップ）
   各経路の最終的な JPY 価値で降順ソートして返す。
*/
const MAX_HOPS = 3;

function findAllPaths(fromId, inputPoints) {
  const results = [];

  function dfs(currentId, currentPoints, pathIds) {
    if (pathIds.length > MAX_HOPS) return;

    for (const ex of EXCHANGE_RATES) {
      if (ex.from !== currentId) continue;
      if (pathIds.includes(ex.to)) continue; // ループ防止

      const nextPoints = Math.floor(currentPoints * ex.rate);
      if (nextPoints <= 0) continue;

      const toProg = POINT_PROGRAMS.find((p) => p.id === ex.to);
      if (!toProg) continue;

      const newPath = [...pathIds, ex.to];
      const jpy = nextPoints * toProg.exchangeRateToJpy;

      results.push({
        pathIds: newPath,          // fromId を含む全ノード
        finalProgramId: ex.to,
        finalPoints: nextPoints,
        jpy,
        hops: newPath.length - 1, // fromId 除いたステップ数
        lastNote: ex.note,
        totalRate: nextPoints / inputPoints,
      });

      dfs(ex.to, nextPoints, newPath);
    }
  }

  dfs(fromId, inputPoints, [fromId]);
  return results.sort((a, b) => b.jpy - a.jpy);
}

/* ── Calculator component ── */
function ExchangeCalculator() {
  const [fromId,      setFromId]      = useState(POINT_PROGRAMS[0].id);
  const [inputStr,    setInputStr]    = useState('10000');
  const [results,     setResults]     = useState(null);
  const [calculated,  setCalculated]  = useState(false);

  const fromProg = POINT_PROGRAMS.find((p) => p.id === fromId);
  const inputPts = Math.max(0, parseInt(inputStr.replace(/,/g, ''), 10) || 0);
  const holdJpy  = inputPts * (fromProg?.exchangeRateToJpy ?? 1);

  const handleCalc = () => {
    const paths = findAllPaths(fromId, inputPts);
    setResults(paths);
    setCalculated(true);
  };

  const handleFromChange = (id) => {
    setFromId(id);
    setResults(null);
    setCalculated(false);
  };

  return (
    <div className="space-y-5">
      {/* Input panel */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator size={15} className="text-blue-500" />
          交換シミュレーション
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* From program */}
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">交換元プログラム</label>
            <div className="grid grid-cols-3 gap-1.5">
              {POINT_PROGRAMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleFromChange(p.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-center transition-all ${
                    fromId === p.id
                      ? 'border-2 shadow-sm'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-500'
                  }`}
                  style={fromId === p.id ? { borderColor: p.color, backgroundColor: p.color + '12', color: p.color } : {}}
                >
                  <span className="text-lg leading-none">{p.icon}</span>
                  <span className="text-[10px] font-semibold leading-tight">{p.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="flex flex-col justify-between">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">
                交換するポイント数
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputStr}
                  onChange={(e) => { setInputStr(e.target.value); setCalculated(false); setResults(null); }}
                  className="input text-xl font-bold pr-12"
                  min="1"
                  placeholder="10000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">pt</span>
              </div>
              {/* Preset amounts */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[1000, 5000, 10000, 50000].map((v) => (
                  <button key={v} onClick={() => { setInputStr(String(v)); setCalculated(false); setResults(null); }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors">
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Hold value + calc button */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">
                そのまま保有: <span className="font-semibold text-gray-600">¥{holdJpy.toLocaleString()}</span>
                <span className="text-gray-300 ml-1">（1pt = ¥{fromProg?.exchangeRateToJpy}）</span>
              </p>
              <button
                onClick={handleCalc}
                disabled={inputPts <= 0}
                className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Calculator size={14} />
                最適パスを計算する
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {calculated && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              計算結果
              <span className="text-gray-400 font-normal ml-2 text-xs">
                {fromProg?.icon} {fromProg?.name} {inputPts.toLocaleString()} pt →
              </span>
            </p>
            <span className="text-xs text-gray-400">{results.length} 件のルート</span>
          </div>

          {results.length === 0 ? (
            <div className="card p-8 text-center space-y-2">
              <Minus size={24} className="text-gray-300 mx-auto" />
              <p className="text-sm text-gray-400">交換可能なルートがありません</p>
              <p className="text-xs text-gray-300">このプログラムからの交換レートが設定されていません</p>
            </div>
          ) : (
            results.map((r, i) => (
              <PathResultCard
                key={i}
                rank={i + 1}
                result={r}
                fromProg={fromProg}
                holdJpy={holdJpy}
                inputPts={inputPts}
                isBest={i === 0}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Path result card ── */
function PathResultCard({ rank, result, fromProg, holdJpy, inputPts, isBest }) {
  const [open, setOpen] = useState(isBest); // ベストは初期展開
  const finalProg = POINT_PROGRAMS.find((p) => p.id === result.finalProgramId);
  const gain    = result.jpy - holdJpy;
  const gainPct = holdJpy > 0 ? ((gain / holdJpy) * 100).toFixed(1) : '0';
  const isProfit = gain > 0;
  const isSame   = gain === 0;

  // パスを「楽天 → ANA → ...」形式で表示
  const pathProgs = result.pathIds.map((id) => POINT_PROGRAMS.find((p) => p.id === id));

  return (
    <div className={`card overflow-hidden transition-shadow hover:shadow-md ${isBest ? 'ring-2 ring-amber-400' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        {/* Rank */}
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
          {result.hops > 1 && (
            <span className="text-[9px] text-gray-400 font-medium">{result.hops}段階</span>
          )}
        </div>

        {/* Path display */}
        <div className="flex-1 min-w-0">
          {/* Nodes with arrows */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {pathProgs.map((p, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ArrowRight size={11} className="text-gray-300 flex-shrink-0" />}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: p?.color + '18', color: p?.color }}>
                  <span>{p?.icon}</span>
                  {p?.shortName}
                </span>
              </span>
            ))}
          </div>

          {/* Numbers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="text-base font-bold" style={{ color: finalProg?.color }}>
                {result.finalPoints.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 ml-1">{finalProg?.shortName} pt</span>
            </div>
            <span className="text-gray-200">=</span>
            <div>
              <span className="text-base font-bold text-gray-800">¥{result.jpy.toLocaleString()}</span>
            </div>
            {/* vs hold */}
            <span className={`badge text-xs ${
              isProfit ? 'bg-emerald-50 text-emerald-700'
              : isSame  ? 'bg-gray-50 text-gray-500'
              :           'bg-red-50 text-red-600'
            }`}>
              {isProfit ? `+¥${gain.toLocaleString()} (+${gainPct}%)` :
               isSame   ? '保有と同等' :
                          `¥${gain.toLocaleString()} (${gainPct}%)`}
            </span>
          </div>
        </div>

        <ChevronDown size={14} className={`flex-shrink-0 text-gray-300 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-gray-50 bg-slate-50/50 px-4 py-3 space-y-2">
          {/* Step-by-step breakdown */}
          <p className="text-xs font-semibold text-gray-500 mb-2">変換ステップ</p>
          {result.pathIds.slice(0, -1).map((id, idx) => {
            const fromP  = POINT_PROGRAMS.find((p) => p.id === id);
            const toId   = result.pathIds[idx + 1];
            const toP    = POINT_PROGRAMS.find((p) => p.id === toId);
            const ex     = EXCHANGE_RATES.find((e) => e.from === id && e.to === toId);
            // points at this step
            const ptsBefore = idx === 0
              ? inputPts
              : (() => {
                  let pts = inputPts;
                  for (let k = 0; k < idx; k++) {
                    const e = EXCHANGE_RATES.find((e) => e.from === result.pathIds[k] && e.to === result.pathIds[k + 1]);
                    if (e) pts = Math.floor(pts * e.rate);
                  }
                  return pts;
                })();
            const ptsAfter = Math.floor(ptsBefore * (ex?.rate ?? 0));

            return (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: fromP?.color }}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span style={{ color: fromP?.color }} className="font-semibold">{fromP?.shortName}</span>
                    <span className="text-gray-400">{ptsBefore.toLocaleString()} pt</span>
                    <ArrowRight size={10} className="text-gray-300" />
                    <span style={{ color: toP?.color }} className="font-semibold">{toP?.shortName}</span>
                    <span className="text-gray-400">{ptsAfter.toLocaleString()} pt</span>
                    <span className="text-gray-300 text-[10px]">(×{ex?.rate})</span>
                  </div>
                  {ex?.note && (
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Info size={9} className="flex-shrink-0" />{ex.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
            <span className="text-gray-400">
              合計変換率: <span className="font-semibold text-gray-600">{(result.totalRate * 100).toFixed(1)}%</span>
            </span>
            <span className="text-gray-400">
              保有価値 ¥{holdJpy.toLocaleString()} →
              <span className={`font-semibold ml-1 ${isProfit ? 'text-emerald-600' : isSame ? 'text-gray-600' : 'text-red-500'}`}>
                ¥{result.jpy.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Exchange Card ── */
function ExchangeCard({ rank, from, to, originalPoints, convertedPoints, jpyValue, currentJpy, gain, note }) {
  const [open, setOpen] = useState(false);
  const gainPct   = currentJpy > 0 ? ((gain / currentJpy) * 100).toFixed(1) : 0;
  const rankColors = ['#f59e0b', '#94a3b8', '#cd7c3a'];

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <span className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: rankColors[rank - 1] ?? '#d1d5db' }}>
            {rank}
          </span>

          <div className="flex-1 min-w-0">
            {/* Programs */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-base">{from.icon}</span>
              <span className="text-sm font-semibold text-gray-800">{from.name}</span>
              <ArrowRight size={13} className="text-gray-300 flex-shrink-0" />
              <span className="text-base">{to.icon}</span>
              <span className="text-sm font-semibold" style={{ color: to.color }}>{to.name}</span>
              {gain > 0 && (
                <span className="badge bg-emerald-50 text-emerald-700">+{gainPct}%</span>
              )}
              {gain < 0 && (
                <span className="badge bg-red-50 text-red-600">{gainPct}%</span>
              )}
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-gray-400 font-medium">変換元</p>
                <p className="text-sm font-bold text-gray-700 mt-0.5">{originalPoints.toLocaleString()}<span className="text-xs font-normal"> pt</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-gray-400 font-medium">変換後</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: to.color }}>{convertedPoints.toLocaleString()}<span className="text-xs font-normal"> pt</span></p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: '#10b98110' }}>
                <p className="text-[10px] text-emerald-600 font-medium">推定価値</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">¥{jpyValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <button onClick={() => setOpen(!open)}
            className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-600 transition-colors mt-0.5">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-50 bg-slate-50 px-4 py-3">
          <div className="flex gap-1.5">
            <Info size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500">{note}</p>
          </div>
          <div className="mt-2.5 flex gap-6 text-xs">
            <div>
              <p className="text-slate-400">損益</p>
              <p className={`font-semibold mt-0.5 ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {gain >= 0 ? '+' : ''}¥{gain.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-400">変換レート</p>
              <p className="text-slate-700 font-medium mt-0.5">1 {from.shortName} → {to.shortName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Usage Card ── */
function UsageCard({ program }) {
  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1 w-full" style={{ backgroundColor: program.color }} />
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-2xl">{program.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{program.name}</p>
            <p className="text-xs font-medium" style={{ color: program.color }}>{program.bestFor}</p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {program.usages.map((u, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: program.color + '80' }} />
              {u}
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-2.5 border-t border-gray-50 flex justify-between text-xs text-gray-300">
          <span>1pt = ¥{program.exchangeRateToJpy}</span>
          <span>有効期限 {program.expiryMonths}ヶ月</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Strategy({ points }) {
  const [filterFrom, setFilterFrom] = useState('all');
  const [tab, setTab] = useState('exchange');

  const hasPoints = points.some((p) => p.balance > 0);

  const strategies = useMemo(() => {
    const results = [];
    EXCHANGE_RATES.forEach((ex) => {
      const fromData = points.find((p) => p.programId === ex.from);
      if (!fromData || fromData.balance <= 0) return;
      const fromProg = POINT_PROGRAMS.find((p) => p.id === ex.from);
      const toProg   = POINT_PROGRAMS.find((p) => p.id === ex.to);
      if (!fromProg || !toProg) return;
      const convertedPoints = Math.floor(fromData.balance * ex.rate);
      const jpyValue   = convertedPoints * toProg.exchangeRateToJpy;
      const currentJpy = fromData.balance * fromProg.exchangeRateToJpy;
      results.push({ from: fromProg, to: toProg, originalPoints: fromData.balance, convertedPoints, jpyValue, currentJpy, gain: jpyValue - currentJpy, note: ex.note, rate: ex.rate });
    });
    return results.sort((a, b) => b.gain - a.gain);
  }, [points]);

  const filtered = useMemo(
    () => filterFrom === 'all' ? strategies : strategies.filter((s) => s.from.id === filterFrom),
    [strategies, filterFrom]
  );

  const activePrograms = POINT_PROGRAMS.filter((p) =>
    points.some((pt) => pt.programId === p.id && pt.balance > 0)
  );

  const TABS = [
    { value: 'exchange',   label: '交換戦略' },
    { value: 'calculator', label: '交換計算機' },
    { value: 'usage',      label: 'おすすめ利用先' },
    { value: 'matrix',     label: '残高一覧' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="page-title">最適化戦略</h2>
        <p className="page-sub">ポイントの最適な利用・交換方法を提案します</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-100 rounded-xl p-1 gap-1 w-fit shadow-sm">
        {TABS.map(({ value, label }) => (
          <button key={value} onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === value ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Exchange ── */}
      {tab === 'exchange' && (
        <div className="space-y-4">
          {!hasPoints ? (
            <div className="card p-12 text-center space-y-3">
              <div className="text-4xl">📊</div>
              <p className="text-gray-400 text-sm">ポイント残高を登録すると交換戦略が表示されます</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <Star size={15} className="text-amber-400" />
                <span className="text-sm font-semibold text-gray-700">おすすめ交換ルート</span>
                {activePrograms.length > 0 && (
                  <select value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
                    className="ml-auto border border-gray-100 bg-white rounded-xl px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm">
                    <option value="all">全プログラム</option>
                    {activePrograms.map((p) => <option key={p.id} value={p.id}>{p.shortName}</option>)}
                  </select>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm text-gray-400">該当する交換ルートがありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((s, i) => <ExchangeCard key={i} rank={i + 1} {...s} />)}
                </div>
              )}

              <div className="card p-4 border-l-4 border-blue-400 bg-blue-50">
                <p className="text-xs font-semibold text-blue-700">ヒント</p>
                <p className="text-xs text-blue-600 mt-1">
                  マイルに交換して特典航空券として利用すると、1マイル≒2〜3円以上の価値になります。現金購入よりも大幅にお得になるケースがあります。
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Calculator ── */}
      {tab === 'calculator' && <ExchangeCalculator />}

      {/* ── Usage ── */}
      {tab === 'usage' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            {hasPoints ? '保有中のプログラムのおすすめ利用先です' : '全プログラムのおすすめ利用先です'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(hasPoints
              ? POINT_PROGRAMS.filter((p) => points.some((pt) => pt.programId === p.id && pt.balance > 0))
              : POINT_PROGRAMS
            ).map((prog) => <UsageCard key={prog.id} program={prog} />)}
          </div>
        </div>
      )}

      {/* ── Matrix ── */}
      {tab === 'matrix' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">プログラム</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">残高</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">円換算</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden sm:table-cell">レート</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden md:table-cell">有効期限</th>
              </tr>
            </thead>
            <tbody>
              {POINT_PROGRAMS.map((prog, idx) => {
                const data = points.find((p) => p.programId === prog.id);
                const balance = data?.balance ?? 0;
                const jpy = balance * prog.exchangeRateToJpy;
                const daysLeft = data?.expiryDate
                  ? Math.ceil((new Date(data.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                  : null;
                return (
                  <tr key={prog.id} className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 ${balance === 0 ? 'opacity-40' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: prog.color }} />
                        <span className="text-base">{prog.icon}</span>
                        <span className="font-medium text-gray-700">{prog.shortName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold text-gray-700">{balance.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">pt</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold text-emerald-600">{balance > 0 ? `¥${jpy.toLocaleString()}` : '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-gray-400 hidden sm:table-cell">
                      1pt = ¥{prog.exchangeRateToJpy}
                    </td>
                    <td className="px-5 py-3.5 text-right hidden md:table-cell">
                      {daysLeft !== null ? (
                        <span className={`badge text-xs ${daysLeft <= 30 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                          残り {daysLeft} 日
                        </span>
                      ) : (
                        <span className="text-xs text-gray-200">未設定</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-100">
                <td className="px-5 py-3 text-xs font-bold text-gray-600">合計</td>
                <td className="px-5 py-3 text-right text-xs font-bold text-gray-600">
                  {points.reduce((s, p) => s + p.balance, 0).toLocaleString()} pt
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">
                  ¥{points.reduce((s, p) => {
                    const prog = POINT_PROGRAMS.find((pr) => pr.id === p.programId);
                    return s + p.balance * (prog?.exchangeRateToJpy ?? 1);
                  }, 0).toLocaleString()}
                </td>
                <td className="hidden sm:table-cell" />
                <td className="hidden md:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
