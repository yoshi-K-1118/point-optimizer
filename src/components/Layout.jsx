import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, TrendingUp, Bell, Calculator, Menu, X, BookOpen, Globe, CreditCard, BarChart2, ShieldCheck, FileText,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'ダッシュボード', icon: LayoutDashboard },
  { to: '/points',     label: 'ポイント管理',   icon: Wallet },
  { to: '/strategy',  label: '最適化戦略',     icon: TrendingUp },
  { to: '/alerts',    label: '期限アラート',   icon: Bell },
  { to: '/simulator',  label: 'シミュレーター',    icon: Calculator },
  { to: '/pointsites', label: 'ポイントサイト活用', icon: Globe },
  { to: '/cards',      label: 'クレジットカード',   icon: CreditCard },
  { to: '/invest',     label: 'ポイント運用',       icon: BarChart2 },
];

const LEGAL_ITEMS = [
  { to: '/disclaimer', label: '免責事項',           icon: FileText },
  { to: '/privacy',    label: 'プライバシーポリシー', icon: ShieldCheck },
];

const HELP_ITEMS = [
  { to: '/guide', label: '使い方ガイド', icon: BookOpen },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 shadow-xl flex-shrink-0">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black">P</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">ポイント</p>
              <p className="text-blue-400 text-xs font-semibold leading-tight">最適化</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="section-title px-3 pb-2 text-slate-500">メニュー</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Legal nav */}
        <div className="px-3 pb-1 border-t border-slate-700/50 pt-3 space-y-0.5">
          <p className="section-title px-3 pb-2 text-slate-500">法的情報</p>
          {LEGAL_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Help nav */}
        <div className="px-3 pb-3 border-t border-slate-700/50 pt-3 space-y-0.5">
          <p className="section-title px-3 pb-2 text-slate-500">ヘルプ</p>
          {HELP_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700/50">
          <p className="text-slate-500 text-xs text-center">データはローカルに保存</p>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 shadow-md z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">P</span>
            </div>
            <span className="text-white text-sm font-bold">
              ポイント<span className="text-blue-400">最適化</span>
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="md:hidden bg-slate-900 px-3 py-2 space-y-0.5 shadow-md z-10">
            {[...NAV_ITEMS, ...LEGAL_ITEMS, ...HELP_ITEMS].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
