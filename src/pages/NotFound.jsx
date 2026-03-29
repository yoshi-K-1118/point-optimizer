import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-5">
      <div className="text-7xl font-black text-slate-200 tracking-tighter select-none">404</div>
      <div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">ページが見つかりません</h1>
        <p className="text-sm text-slate-500">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={15} />
          前のページへ
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          <Home size={15} />
          ダッシュボードへ
        </button>
      </div>
    </div>
  );
}
