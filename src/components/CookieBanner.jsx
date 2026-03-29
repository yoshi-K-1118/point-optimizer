import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

const STORAGE_KEY = 'cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-700">
        <div className="flex items-start gap-3">
          <Cookie size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm mb-1">Cookieの使用について</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              本サービスはGoogle AdSenseおよびアフィリエイトプログラムのために
              Cookieを使用しています。詳しくは
              <a href="/privacy" className="text-blue-400 underline mx-0.5">プライバシーポリシー</a>
              をご確認ください。
            </p>
          </div>
          <button onClick={decline} className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={decline}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-slate-600 rounded-lg transition-colors"
          >
            拒否する
          </button>
          <button
            onClick={accept}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            <Check size={12} />
            同意する
          </button>
        </div>
      </div>
    </div>
  );
}
