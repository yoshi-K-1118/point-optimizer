import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

const CATEGORIES = [
  '使い方について',
  '機能のご要望',
  '不具合・バグ報告',
  '情報の誤りについて',
  'その他',
];

// Formspree のフォームID（formspree.io でフォームを作成後に取得したIDに置き換えてください）
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: CATEGORIES[0],
    message: '',
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          名前: form.name,
          メールアドレス: form.email,
          種別: form.category,
          内容: form.message,
        }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', category: CATEGORIES[0], message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const isValid = form.name.trim() && form.email.trim() && form.message.trim();

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
        <h1 className="page-title text-white">お問い合わせ</h1>
        <p className="text-slate-300 text-sm mt-1 flex items-center gap-1.5">
          <Mail size={14} />
          ご意見・ご要望・不具合などをお気軽にお送りください
        </p>
      </div>

      {status === 'success' ? (
        /* 送信完了 */
        <div className="card p-8 text-center space-y-3">
          <CheckCircle2 size={40} className="text-green-500 mx-auto" />
          <h2 className="font-bold text-slate-800 text-lg">送信が完了しました</h2>
          <p className="text-sm text-slate-500">
            お問い合わせありがとうございます。<br />
            内容を確認の上、ご返信いたします。
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="btn-primary mx-auto mt-2"
          >
            新しいお問い合わせ
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">

          {/* 名前 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              お名前 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="山田 太郎"
              required
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              メールアドレス <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input"
              placeholder="example@email.com"
              required
            />
          </div>

          {/* 種別 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              お問い合わせ種別
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 内容 */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              お問い合わせ内容 <span className="text-red-400">*</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="input resize-none"
              rows={6}
              placeholder="お問い合わせ内容を入力してください"
              required
              style={{ height: 'auto' }}
            />
          </div>

          {/* エラー */}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={15} className="flex-shrink-0" />
              送信に失敗しました。時間をおいて再度お試しください。
            </div>
          )}

          {/* 注意書き */}
          <p className="text-xs text-slate-400">
            ご返信にはお時間をいただく場合があります。また、お問い合わせ内容によってはご返信できない場合があります。
          </p>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={!isValid || status === 'sending'}
            className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            {status === 'sending' ? '送信中...' : '送信する'}
          </button>
        </form>
      )}
    </div>
  );
}
