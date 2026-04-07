import { ExternalLink, ClipboardList } from 'lucide-react';

const SURVEY_SITES = [
  {
    name: 'マクロミル',
    url: 'https://monitor.macromill.com/',
    affiliateUrl: 'https://px.a8.net/svt/ejp?a8mat=4B1FHO+CI4HE+2WL0+BWVTE',
    affiliatePixel: 'https://www10.a8.net/0.gif?a8mat=4B1FHO+CI4HE+2WL0+BWVTE',
    icon: '📊',
    color: '#e74c3c',
    since: 2000,
    operator: '株式会社マクロミル',
    reward: 'マクロミルポイント（1pt = 1円相当）',
    minExchange: '500pt〜',
    description: '国内最大級のオンラインリサーチパネル。日常的なアンケートに回答してポイントを貯め、現金・ギフト券・他ポイントへ交換できる。パネル登録者数が多く、毎日届くアンケートの量が豊富。',
    features: ['毎日アンケート届く', '現金振込対応', 'ポイント有効期限1年'],
  },
  {
    name: '楽天インサイト',
    url: 'https://insight.rakuten.co.jp/',
    icon: '🛍️',
    color: '#bf0000',
    since: 2001,
    operator: '楽天インサイト株式会社',
    reward: '楽天ポイント（1pt = 1円相当）',
    minExchange: '500pt〜',
    description: '楽天グループ運営のリサーチパネル。回答ポイントはそのまま楽天ポイントとして利用可能。楽天市場・楽天カードユーザーにとってポイントを一元管理しやすい。',
    features: ['楽天ポイントに直接交換', '楽天ID連携', '生活者パネル参加可'],
  },
  {
    name: 'infoQ',
    url: 'https://www.infoq.ne.jp/',
    icon: '💡',
    color: '#f39c12',
    since: 2002,
    operator: 'GMOリサーチ＆AI株式会社',
    reward: 'infoQポイント（1pt = 1円相当）',
    minExchange: '300pt〜',
    description: 'GMOグループ運営の老舗アンケートサイト。最低交換額が低めで初心者にも使いやすい。Amazonギフト券・PayPay・他ポイントへの交換に対応。',
    features: ['低額から交換可能', 'Amazon Gift対応', 'PayPay交換対応'],
  },
  {
    name: 'リサーチパネル',
    url: 'https://www.researchpanel.jp/',
    icon: '🔍',
    color: '#2980b9',
    since: 2002,
    operator: '株式会社クロス・マーケティング',
    reward: 'リサーチパネルポイント（1pt = 0.1円相当）',
    minExchange: '3,000pt〜',
    description: 'クロス・マーケティンググループ運営。企業の本格的なリサーチに参加できるため、1件あたりの報酬が比較的高め。様々なジャンルのアンケートが届く。',
    features: ['高単価案件あり', '複数交換先対応', 'モニター調査参加可'],
  },
  {
    name: 'MyVoice',
    url: 'https://research.myvoice.co.jp/',
    icon: '🎤',
    color: '#8e44ad',
    since: 1999,
    operator: 'マイボイスコム株式会社',
    reward: 'MyVoiceポイント（1pt = 1円相当）',
    minExchange: '500pt〜',
    description: '1999年開始の国内最古参アンケートサイトの一つ。毎月定期アンケートが配信され、長期間安定して運営されている信頼性の高いサービス。',
    features: ['1999年開始の老舗', '毎月定期配信', '現金振込対応'],
  },
  {
    name: 'D style web',
    url: 'https://www.d-style-web.net/',
    icon: '📱',
    color: '#d63031',
    since: 2006,
    operator: '株式会社ディーツー コミュニケーションズ',
    reward: 'dポイント / 現金 / ギフト券',
    minExchange: '500pt〜',
    description: 'dポイントへの交換に対応したアンケートサイト。ドコモユーザーはもちろん、dポイントカードを持っていれば誰でも効率よくポイントを貯められる。',
    features: ['dポイント直接交換', 'ドコモ連携', '高還元率案件あり'],
  },
  {
    name: 'ネットマイル',
    url: 'https://www.netmile.co.jp/',
    icon: '✈️',
    color: '#0984e3',
    since: 2000,
    operator: '株式会社ネットマイル',
    reward: 'ネットマイル（1マイル ≈ 0.5〜1円相当）',
    minExchange: '1,500マイル〜',
    description: '2000年創業のアンケート・ポイントサイト。ANAマイル・各種ポイントへの交換ルートが豊富で、マイル派の方に特に人気。ショッピング経由でもマイルが貯まる。',
    features: ['ANAマイル交換対応', '多彩な交換先', 'ショッピングでも貯まる'],
  },
  {
    name: 'キューモニター',
    url: 'https://www.qmonitor.jp/',
    icon: '📋',
    color: '#00b894',
    since: 2005,
    operator: 'NTTコム オンライン・マーケティング・ソリューション株式会社',
    reward: 'Quoカード / Amazon Gift / 現金',
    minExchange: '1,000pt〜',
    description: 'NTTコムオンライン運営の信頼性の高いアンケートサービス。企業・官公庁向け調査への参加機会が多く、QUOカードなどの実用的な商品への交換が充実している。',
    features: ['NTT系列の信頼性', 'QUOカード対応', '官公庁系調査あり'],
  },
  {
    name: 'アンケートclub',
    url: 'https://www.enquete-club.com/',
    icon: '🤝',
    color: '#6c5ce7',
    since: 2009,
    operator: '株式会社クロス・マーケティング',
    reward: 'アンケートclubポイント（1pt = 1円相当）',
    minExchange: '500pt〜',
    description: 'クロス・マーケティンググループ運営のアンケートサイト。定期的な生活者調査から企業リサーチまで幅広い案件に参加でき、ポイントは複数のサービスへ交換可能。',
    features: ['幅広い案件', 'ポイント有効期限なし', '複数交換先対応'],
  },
  {
    name: 'Fastask',
    url: 'https://www.fast-ask.com/',
    icon: '⚡',
    color: '#fdcb6e',
    since: 2010,
    operator: 'NTTコム オンライン・マーケティング・ソリューション株式会社',
    reward: 'Fastaskポイント（1pt = 1円相当）',
    minExchange: '500pt〜',
    description: 'NTTコムオンライン運営のスマートフォン対応アンケートサービス。短時間で回答できる簡潔なアンケートが多く、隙間時間を活用したポイント収集に向いている。',
    features: ['スマホ最適化', '短時間回答が多い', 'NTT系列の安心感'],
  },
];

export default function SurveySites() {
  return (
    <div className="space-y-5">

      {/* ヘッダー */}
      <div className="rounded-2xl px-6 py-5 shadow-lg relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, white, transparent)' }} />
        <h1 className="page-title flex items-center gap-2" style={{ color: 'white' }}>
          <ClipboardList size={22} /> アンケートポイントサイト
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          15年以上の運営実績を持つ信頼性の高いアンケートサイト一覧
        </p>
      </div>

      {/* 免責 */}
      <div className="rounded-xl px-4 py-3 text-xs border border-amber-200/40 bg-amber-500/5 text-amber-600 dark:text-amber-400">
        ⚠️ 掲載情報（運営開始年・交換レート・最低交換額など）は参考値です。最新情報は各サービスの公式サイトでご確認ください。
      </div>

      {/* サイト一覧 */}
      <div className="grid md:grid-cols-2 gap-4">
        {SURVEY_SITES.map(site => (
          <div key={site.name} className="card overflow-hidden">
            {/* カラーバー */}
            <div className="h-1.5" style={{ backgroundColor: site.color }} />

            <div className="p-4 space-y-3">
              {/* ヘッダー行 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
                    style={{ backgroundColor: site.color + '20' }}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`}
                      alt={site.name}
                      width={28}
                      height={28}
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = site.icon; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                      {site.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="font-medium" style={{ color: site.color }}>{site.since}年〜</span>
                      &ensp;·&ensp;最低交換: {site.minExchange}
                    </p>
                  </div>
                </div>
                <a
                  href={site.affiliateUrl ?? site.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = site.color; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                  <ExternalLink size={15} />
                </a>
              </div>

              {/* 説明 */}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {site.description}
              </p>

              {/* 報酬 */}
              <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--color-badge-bg)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>報酬: </span>
                <span style={{ color: 'var(--color-text-primary)' }}>{site.reward}</span>
              </div>

              {/* 特徴タグ */}
              <div className="flex flex-wrap gap-1.5">
                {site.features.map(f => (
                  <span
                    key={f}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: site.color + '18',
                      color: site.color,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* 運営会社 */}
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                運営: {site.operator}
              </p>
              {/* アフィリエイトトラッキングピクセル */}
              {site.affiliatePixel && (
                <img border="0" width="1" height="1" src={site.affiliatePixel} alt="" style={{ display: 'none' }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
