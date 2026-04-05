import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Bell, Calculator, Menu, X, BookOpen, Globe,
  CreditCard, BarChart2, ShieldCheck, FileText, Mail, Sun, Moon, Gift, Plane, LineChart,
} from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'ダッシュボード',     icon: LayoutDashboard },
  { to: '/points',     label: 'ポイント管理',       icon: Wallet },
  { to: '/alerts',     label: '期限アラート',       icon: Bell },
  { to: '/simulator',  label: 'シミュレーター',     icon: Calculator },
  { to: '/campaigns',  label: 'キャンペーン情報',   icon: Gift, note: '運営者が不定期で情報を更新' },
  { to: '/pointsites', label: 'ポイントサイト活用', icon: Globe },
  { to: '/cards',      label: 'クレジットカード',   icon: CreditCard },
  { to: '/invest',     label: 'ポイント運用',           icon: BarChart2 },
  { to: '/invest-sim', label: '運用シミュレーター', icon: LineChart },
  { to: '/strategy',   label: 'マイル交換',           icon: Plane },
];

const LEGAL_ITEMS = [
  { to: '/terms',      label: '利用規約',             icon: FileText },
  { to: '/disclaimer', label: '免責事項',             icon: FileText },
  { to: '/privacy',    label: 'プライバシーポリシー', icon: ShieldCheck },
];

const HELP_ITEMS = [
  { to: '/guide',   label: '使い方ガイド', icon: BookOpen },
  { to: '/contact', label: 'お問い合わせ', icon: Mail },
];

function NavGroup({ title, items, onClose }) {
  return (
    <div className="px-3 py-2">
      <p className="section-title px-2 pb-1.5">{title}</p>
      <div className="space-y-0.5">
        {items.map(({ to, label, icon: Icon, note }) => (
          <div key={to}>
            <NavLink
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-full" />
                  )}
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? 'text-blue-400'
                        : 'text-slate-500 group-hover:text-slate-300 transition-colors'
                    }
                  />
                  {label}
                </>
              )}
            </NavLink>
            {note && (
              <p className="px-3 pb-1 text-[10px] text-slate-600 leading-tight">※{note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-slate-950 border-r border-slate-800/60">

        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-blue-500 opacity-20 blur-sm" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
                <span className="text-white text-sm font-black tracking-tight">P</span>
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight tracking-tight">ポイント最適化</p>
              <p className="text-blue-400/70 text-[11px] leading-tight mt-0.5">Point Optimizer</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-1">
          <NavGroup title="メニュー" items={NAV_ITEMS} />
        </nav>

        {/* Legal + Help */}
        <div className="border-t border-slate-800/60 space-y-1 pb-1">
          <NavGroup title="法的情報" items={LEGAL_ITEMS} />
          <NavGroup title="ヘルプ"   items={HELP_ITEMS}  />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between">
          <p className="text-slate-600 text-[11px]">ローカル保存</p>
          <button
            onClick={() => setDark(!dark)}
            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all duration-150"
            title={dark ? 'ライトモード' : 'ダークモード'}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800/60 z-20">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-black">P</span>
            </div>
            <span className="text-white text-sm font-bold tracking-tight">
              ポイント<span className="text-blue-400">最適化</span>
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800/60 z-10">
            <NavGroup title="メニュー"   items={NAV_ITEMS}   onClose={() => setMenuOpen(false)} />
            <NavGroup title="法的情報"   items={LEGAL_ITEMS} onClose={() => setMenuOpen(false)} />
            <NavGroup title="ヘルプ"     items={HELP_ITEMS}  onClose={() => setMenuOpen(false)} />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 page-enter">
            {children}
          </div>

          {/* My Apps */}
          <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8">
            <div className="border-t border-slate-200/10 pt-5">
              <p className="text-[11px] text-slate-500 mb-3">管理者作成アプリ</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'SubsManager', url: 'https://apps.apple.com/jp/app/subsmanager/id6760018915',           icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/55/fd/76/55fd7601-254e-16f5-a723-5a4d8d8deb39/AppIcon-0-0-1x_U007epad-0-1-85-220.png/100x100bb.jpg' },
                  { name: 'FaceNote',    url: 'https://apps.apple.com/jp/app/facenote/id6760473491',             icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b4/98/5d/b4985dd0-7c8d-6358-9232-5b255a3622b9/AppIcon-0-0-1x_U007epad-0-1-85-220.png/100x100bb.jpg' },
                  { name: '禁煙くん',    url: 'https://apps.apple.com/jp/app/%E7%A6%81%E7%85%99%E3%81%8F%E3%82%93/id6760255111', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/36/6e/63/366e63c4-8735-e6b4-269a-92a3592afb19/AppIcon-0-0-1x_U007epad-0-1-85-220.png/100x100bb.jpg' },
                  { name: 'Gomidashi',   url: 'https://apps.apple.com/jp/app/gomidashi/id6760887454',            icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/6d/24/1e/6d241e6b-5acf-7e86-8366-b1b17981f81c/AppIcon-0-0-1x_U007epad-0-1-85-220.png/100x100bb.jpg' },
                ].map(({ name, url, icon }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/40 hover:border-slate-500/60 hover:bg-slate-800/30 transition-all duration-150 group"
                  >
                    <img
                      src={icon}
                      alt={name}
                      width={28}
                      height={28}
                      className="rounded-lg flex-shrink-0"
                    />
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors leading-tight font-medium truncate">
                      {name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
