import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminLogin() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/login', { username, password });
      login(response.data.token, response.data.admin);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #2DD4BF 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-sm w-full">
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span className="font-mono text-xs text-text-muted tracking-wider uppercase">
              {t.adminAccess}
            </span>
          </div>
          <LanguageSwitcher />
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight mb-2 text-center">
          {t.reviewerLogin}
        </h1>
        <p className="text-text-muted text-sm mb-8 text-center">
          {t.orgSubline}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-surface border border-white/5 rounded-xl p-6">
          <div>
            <label className="font-mono text-xs text-text-muted block mb-1.5">{t.username}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full bg-bg border border-white/10 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/30 transition-colors"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-text-muted block mb-1.5">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-bg border border-white/10 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/30 transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="font-mono text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal text-bg font-medium rounded-lg px-6 py-3 hover:bg-signal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;