import { useState, useMemo } from 'react';
import { Globe, ShoppingBag, Calculator, ChevronDown, ChevronUp, ExternalLink, Star, TrendingUp } from 'lucide-react';
import { POINT_SITES, SHOPS, CREDIT_CARDS } from '../data/pointSites';
import { POINT_PROGRAMS } from '../data/pointPrograms';

const TABS = [
  { id: 'sites',    label: 'サービス比較',   icon: Globe },
  { id: 'shops',    label: 'ショップ最適化', icon: ShoppingBag },
  { id: 'calc',     label: '積算計算機',     icon: Calculator },
];

function RateDisclaimer() {
  return (
    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
      ⚠️ 掲載している還元率はあくまで参考値です。各ポイントサイトの還元率は随時変更されます。最新情報は各サービスの公式サイトでご確認ください。
    </p>
  );
}

// ── Tab 1: ポイントサイト一覧 ──────────────────────────────────────────────

function ProgramPill({ programId }) {
  const prog = POINT_PROGRAMS.find((p) => p.id === programId);
  if (!prog) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: prog.color }}
    >
      {prog.icon} {prog.shortName}
    </span>
  );
}

function SiteCard({ site }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* Header accent */}
      <div className="h-1.5" style={{ backgroundColor: site.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
              style={{ backgroundColor: site.color + '20' }}
            >
              {site.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 leading-tight">{site.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                1{site.pointUnit} = {site.pointToJpy >= 1 ? `${site.pointToJpy}円` : `${(site.pointToJpy * 100).toFixed(0)}銭`}
                &ensp;·&ensp;最低交換: {site.minExchange.toLocaleString()}{site.pointUnit}
                {site.since && <>&ensp;·&ensp;<span className="text-blue-500 font-medium">{site.since}年〜</span></>}
              </p>
            </div>
          </div>
          {!site.adBanner && (
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ExternalLink size={15} />
            </a>
          )}
        </div>

        <p className="text-sm text-slate-600 mt-3 leading-relaxed">{site.description}</p>

        {/* Exchange programs */}
        <div className="mt-3">
          <p className="text-xs text-slate-500 font-medium mb-1.5">交換先ポイント</p>
          <div className="flex flex-wrap gap-1.5">
            {site.exchanges.map((ex) => (
              <ProgramPill key={ex} programId={ex} />
            ))}
          </div>
        </div>

        {/* アフィリエイトバナー */}
        {site.adBanner && (
          <div className="mt-3 flex justify-center">
            <a
              href={site.adBanner.href}
              target="_blank"
              rel={`${site.adBanner.rel ?? 'nofollow'} noopener noreferrer`}
              referrerPolicy="no-referrer-when-downgrade"
            >
              <img
                src={site.adBanner.src}
                width={site.adBanner.width}
                height={site.adBanner.height}
                alt={site.adBanner.alt ?? `${site.name} 公式サイト`}
                style={{ border: 0, display: 'block' }}
              />
            </a>
            {site.adBanner.pixel && (
              <img
                src={site.adBanner.pixel}
                width={1}
                height={1}
                alt=""
                style={{ border: 0, display: 'none' }}
              />
            )}
          </div>
        )}

        {/* Expand: top shops for this site */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? '閉じる' : '対応ショップ一覧を見る'}
        </button>

        {expanded && (
          <div className="mt-2 border-t border-slate-100 pt-3 space-y-1.5">
            {SHOPS.filter((s) => s.siteRates[site.id] !== undefined)
              .sort((a, b) => (b.siteRates[site.id] ?? 0) - (a.siteRates[site.id] ?? 0))
              .map((shop) => (
                <div key={shop.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    {shop.icon} {shop.name}
                  </span>
                  <span className="font-semibold" style={{ color: site.color }}>
                    {(shop.siteRates[site.id] * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SitesTab() {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">
        各ポイントサイトの特徴・交換先・対応ショップをまとめました。
      </p>
      <RateDisclaimer />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {POINT_SITES.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: ショップ最適化 ─────────────────────────────────────────────────

function ShopsTab() {
  const categories = useMemo(() => [...new Set(SHOPS.map((s) => s.category))], []);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [selectedShop, setSelectedShop] = useState(SHOPS[0]);

  const filteredShops = useMemo(() =>
    selectedCategory === 'すべて'
      ? SHOPS
      : SHOPS.filter((s) => s.category === selectedCategory),
    [selectedCategory]
  );

  // Ranked list of point sites for the selected shop
  const ranked = useMemo(() => {
    const shop = selectedShop;
    return POINT_SITES
      .filter((site) => shop.siteRates[site.id] !== undefined)
      .map((site) => ({
        site,
        rate: shop.siteRates[site.id],
        jpy: shop.siteRates[site.id] * site.pointToJpy, // effective yen rate
      }))
      .sort((a, b) => b.jpy - a.jpy);
  }, [selectedShop]);

  const best = ranked[0];

  return (
    <div>
      <RateDisclaimer />
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Left: shop selector */}
      <div className="md:col-span-2 space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">カテゴリー</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {['すべて', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ショップ</label>
          <div className="mt-1.5 space-y-1">
            {filteredShops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  selectedShop.id === shop.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className="text-base">{shop.icon}</span>
                <span>{shop.name}</span>
                <span className="ml-auto text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">{shop.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: ranked results */}
      <div className="md:col-span-3">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{selectedShop.icon}</span>
            <div>
              <h3 className="font-bold text-slate-800">{selectedShop.name}</h3>
              {selectedShop.ownPointRate > 0 && (
                <p className="text-xs text-slate-500">
                  店舗ポイント: {selectedShop.ownPointName} {(selectedShop.ownPointRate * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          {ranked.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">このショップのポイントサイト情報はありません</p>
          ) : (
            <div className="space-y-2">
              {ranked.map(({ site, rate, jpy }, i) => (
                <div
                  key={site.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    i === 0
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 flex items-center justify-center text-sm">{site.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {i === 0 && <Star size={12} className="text-amber-500 fill-amber-500" />}
                      <span className="font-semibold text-sm text-slate-800">{site.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      還元ポイント: {(rate * 100).toFixed(1)}% ({site.pointUnit})
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-base" style={{ color: site.color }}>
                      {(jpy * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-slate-400">円換算</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {best && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">
                <TrendingUp size={12} className="inline mr-1" />
                最大積算パターン（1万円購入時）
              </p>
              <div className="text-sm text-blue-800 space-y-0.5">
                <div className="flex justify-between">
                  <span>{best.site.name}経由</span>
                  <span>+{Math.round(10000 * best.rate * best.site.pointToJpy)}円相当</span>
                </div>
                {selectedShop.ownPointRate > 0 && (
                  <div className="flex justify-between">
                    <span>{selectedShop.ownPointName}</span>
                    <span>+{Math.round(10000 * selectedShop.ownPointRate)}円相当</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-blue-200 pt-1 mt-1">
                  <span>合計</span>
                  <span>
                    +{Math.round(10000 * (best.rate * best.site.pointToJpy + selectedShop.ownPointRate))}円相当
                    （{((best.rate * best.site.pointToJpy + selectedShop.ownPointRate) * 100).toFixed(2)}%）
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

// ── Tab 3: 積算計算機 ──────────────────────────────────────────────────────

function StackCalcTab() {
  const [amount, setAmount] = useState('10000');
  const [selectedShopId, setSelectedShopId] = useState('amazon');
  const [selectedSiteId, setSelectedSiteId] = useState('hapitas');
  const [selectedCardId, setSelectedCardId] = useState('rakuten_card');
  const [result, setResult] = useState(null);

  const PRESETS = [1000, 3000, 10000, 30000, 50000];

  const shop = SHOPS.find((s) => s.id === selectedShopId);
  const site = POINT_SITES.find((s) => s.id === selectedSiteId);
  const card = CREDIT_CARDS.find((c) => c.id === selectedCardId);

  function calculate() {
    const amt = parseInt(amount.replace(/,/g, ''), 10);
    if (!amt || amt <= 0 || !shop || !site || !card) return;

    const siteRate = shop.siteRates[site.id] ?? 0;
    const sitePts = Math.floor((amt * siteRate) / site.pointToJpy);
    const siteJpy = Math.floor(sitePts * site.pointToJpy);

    const cardRate = card.onlineRate;
    const cardProg = POINT_PROGRAMS.find((p) => p.id === card.programId);
    const cardJpy = cardProg ? Math.floor(amt * cardRate * cardProg.exchangeRateToJpy) : Math.floor(amt * cardRate);

    const ownRate = shop.ownPointRate;
    const ownJpy = Math.floor(amt * ownRate);

    const totalJpy = siteJpy + cardJpy + ownJpy;
    const totalRate = totalJpy / amt;

    setResult({ amt, siteRate, sitePts, siteJpy, cardRate, cardJpy, cardProg, ownRate, ownJpy, totalJpy, totalRate });
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-slate-500 mb-3">
        ポイントサイト＋クレジットカード＋店舗ポイントを組み合わせた実質還元率を計算します。
      </p>
      <RateDisclaimer />

      {/* Inputs */}
      <div className="card p-4 space-y-4 mb-4">
        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">購入金額</label>
          <input
            type="number"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="例: 10000"
          />
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                ¥{p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">ショップ</label>
          <select
            className="input"
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
          >
            {SHOPS.map((s) => (
              <option key={s.id} value={s.id}>{s.icon} {s.name} ({s.category})</option>
            ))}
          </select>
        </div>

        {/* Point Site */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">ポイントサイト経由</label>
          <select
            className="input"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            {POINT_SITES.map((s) => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
          {shop && site && shop.siteRates[site.id] === undefined && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠ このショップはこのポイントサイトに対応していません（還元率0）
            </p>
          )}
        </div>

        {/* Credit Card */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">クレジットカード</label>
          <select
            className="input"
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            {CREDIT_CARDS.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name} ({(c.onlineRate * 100).toFixed(1)}%)</option>
            ))}
          </select>
        </div>

        <button onClick={calculate} className="btn-primary w-full justify-center">
          <Calculator size={15} />
          積算還元率を計算
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="card p-4 border-2 border-blue-200">
          <h3 className="font-bold text-slate-800 mb-3 text-base">
            ¥{result.amt.toLocaleString()} の購入時の還元内訳
          </h3>

          <div className="space-y-2 mb-4">
            {/* Site row */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold text-sm text-slate-800">
                  {site?.icon} {site?.name}
                </div>
                <div className="text-xs text-slate-500">
                  {(result.siteRate * 100).toFixed(1)}% → {result.sitePts.toLocaleString()}{site?.pointUnit}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">+¥{result.siteJpy.toLocaleString()}</div>
                <div className="text-xs text-slate-400">{(result.siteJpy / result.amt * 100).toFixed(2)}%</div>
              </div>
            </div>

            {/* Card row */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold text-sm text-slate-800">
                  {card?.icon} {card?.name}
                </div>
                <div className="text-xs text-slate-500">
                  {(result.cardRate * 100).toFixed(1)}%
                  {result.cardProg && ` → ${result.cardProg.icon}${result.cardProg.shortName}`}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">+¥{result.cardJpy.toLocaleString()}</div>
                <div className="text-xs text-slate-400">{(result.cardJpy / result.amt * 100).toFixed(2)}%</div>
              </div>
            </div>

            {/* Own points row */}
            {result.ownRate > 0 ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-semibold text-sm text-slate-800">
                    {shop?.icon} {shop?.ownPointName}
                  </div>
                  <div className="text-xs text-slate-500">店舗独自ポイント {(result.ownRate * 100).toFixed(1)}%</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">+¥{result.ownJpy.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">{(result.ownJpy / result.amt * 100).toFixed(2)}%</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl opacity-50">
                <div className="font-semibold text-sm text-slate-500">{shop?.icon} 店舗ポイントなし</div>
                <div className="font-bold text-slate-400">+¥0</div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white">
            <div>
              <div className="text-sm font-semibold opacity-80">合計還元</div>
              <div className="text-2xl font-black">
                {(result.totalRate * 100).toFixed(2)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">¥{result.amt.toLocaleString()} に対して</div>
              <div className="text-2xl font-black">+¥{result.totalJpy.toLocaleString()}</div>
            </div>
          </div>

          {/* Stacking tip */}
          {result.siteJpy > 0 && result.cardJpy > 0 && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              ポイントサイト経由 + カード払いで
              <span className="font-semibold text-blue-600"> 二重取り</span>が成立しています
              {result.ownRate > 0 && '（店舗ポイントも加えて三重取り）'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function PointSites() {
  const [activeTab, setActiveTab] = useState('sites');

  return (
    <div>
      {/* Header */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 shadow-lg">
        <h1 className="page-title text-white">ポイントサイト活用</h1>
        <p className="text-purple-200 text-sm mt-1">
          モッピー・ハピタスなどを経由してポイントを二重・三重に積算しよう
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

      {/* Tab content */}
      {activeTab === 'sites' && <SitesTab />}
      {activeTab === 'shops' && <ShopsTab />}
      {activeTab === 'calc'  && <StackCalcTab />}
    </div>
  );
}
