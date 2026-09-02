import { useState, useEffect, useRef } from 'react';
import { api } from '../api/config';
import { useScrambleText } from '../hooks/useScrambleText';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function SubmitFeedback() {
  const { t } = useLanguage();
  const heading = useScrambleText(t.heading, 25);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [stage, setStage] = useState<'analyzing' | 'categorizing'>('analyzing');
  const [errorMsg, setErrorMsg] = useState('');
  const [category, setCategory] = useState('');
  const [aiCategorized, setAiCategorized] = useState(true);
  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (stageTimer.current) clearTimeout(stageTimer.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim().length < 10) {
      setStatus('error');
      setErrorMsg(t.errorMinLength);
      return;
    }

    setStatus('submitting');
    setStage('analyzing');
    setErrorMsg('');

    // Purely visual staging - the real work happens in the single API call below.
    // This just gives the user a sense of what's happening during the wait.
    stageTimer.current = setTimeout(() => setStage('categorizing'), 700);

    try {
      const response = await api.post('/feedback', { message: message.trim() });
      setCategory(response.data.category);
      setAiCategorized(response.data.aiCategorized);
      setStatus('success');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.error || t.errorGeneric);
    } finally {
      if (stageTimer.current) clearTimeout(stageTimer.current);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-signal/10 border border-signal/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-signal font-mono text-sm">OK</span>
          </div>
          <h2 className="font-display text-2xl font-semibold mb-3">{t.successTitle}</h2>
          <p className="text-text-muted mb-1">
            {t.successRouted} <span className="font-mono text-signal">{category}</span>
          </p>
          <p className="font-mono text-xs text-text-muted/70 mb-1">
            {aiCategorized ? t.aiCategorizedNote : t.fallbackNote}
          </p>
          <p className="text-text-muted text-sm mb-8 mt-3">
            {t.successPrivacy}
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="font-mono text-sm px-5 py-2.5 rounded-lg border border-white/10 hover:border-signal/50 hover:bg-surface-hover transition-colors"
          >
            {t.submitAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #2DD4BF 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span className="font-mono text-xs text-text-muted tracking-wider uppercase">
              {t.orgLine}
            </span>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="inline-flex items-center gap-1.5 mb-6 px-2.5 py-1 rounded-full border border-signal/30 bg-signal/5">
          <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
          <span className="font-mono text-[11px] text-signal tracking-wide">{t.aiBadge}</span>
        </div>

        <h1 className="font-display text-4xl font-semibold tracking-tight mb-4 min-h-[3rem]">
          {heading}
        </h1>

        <p className="text-text-muted mb-10 leading-relaxed">
          {t.intro}
        </p>

        <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-lg bg-surface border border-white/5">
          <span className="font-mono text-xs text-signal">0</span>
          <span className="font-mono text-xs text-text-muted">{t.privacyStrip}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.placeholder}
              rows={7}
              maxLength={2000}
              disabled={status === 'submitting'}
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-4 text-text placeholder:text-text-muted/60 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/30 transition-colors resize-none"
            />
            <div className="absolute bottom-3 right-4 font-mono text-xs text-text-muted">
              {message.length}/2000
            </div>
          </div>

          {status === 'error' && (
            <p className="font-mono text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-signal text-bg font-medium rounded-xl px-6 py-4 hover:bg-signal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {status === 'submitting' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-bg animate-pulse" />
                {stage === 'analyzing' ? t.stageAnalyzing : t.stageCategorizing}
              </>
            ) : (
              t.submit
            )}
          </button>
        </form>

        <p className="font-mono text-xs text-text-muted/60 mt-8 text-center">
          {t.footerNote}
        </p>
      </div>
    </div>
  );
}

export default SubmitFeedback;
