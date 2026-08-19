import { useState } from 'react';
import { api } from '../api/config';
import { useScrambleText } from '../hooks/useScrambleText';

function SubmitFeedback() {
    const heading = useScrambleText('Employee Suggestion Box', 25);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (message.trim().length < 10) {
            setStatus('error');
            setErrorMsg('Please enter at least 10 characters.');
            return;
        }

        setStatus('submitting');
        setErrorMsg('');

        try {
            const response = await api.post('/feedback', { message: message.trim() });
            setCategory(response.data.category);
            setStatus('success');
            setMessage('');
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg px-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-12 h-12 rounded-full bg-signal/10 border border-signal/30 flex items-center justify-center mx-auto mb-6">
                        <span className="text-signal font-mono text-sm">OK</span>
                    </div>
                    <h2 className="font-display text-2xl font-semibold mb-3">Submission received</h2>
                    <p className="text-text-muted mb-1">
                        Routed to <span className="font-mono text-signal">{category}</span>
                    </p>
                    <p className="text-text-muted text-sm mb-8">
                        No identifying information was stored with this submission.
                    </p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="font-mono text-sm px-5 py-2.5 rounded-lg border border-white/10 hover:border-signal/50 hover:bg-surface-hover transition-colors"
                    >
                        Submit another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg relative overflow-hidden">
            {/* Ambient dot-grid background */}
            <div
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #2DD4BF 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            <div className="relative max-w-xl mx-auto px-6 py-20">
                <div className="flex items-center gap-2 mb-8">
                    <span className="w-2 h-2 rounded-full bg-signal" />
                    <span className="font-mono text-xs text-text-muted tracking-wider uppercase">
                        Ethiopian Statistics Service
                    </span>
                </div>

                <h1 className="font-display text-4xl font-semibold tracking-tight mb-4 min-h-[3rem]">
                    {heading}
                </h1>

                <p className="text-text-muted mb-10 leading-relaxed">
                    Share a concern, an idea, or a problem worth fixing. Nothing here is linked back to you.
                </p>

                <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-lg bg-surface border border-white/5">
                    <span className="font-mono text-xs text-signal">0</span>
                    <span className="font-mono text-xs text-text-muted">identifiers stored with this submission</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What's on your mind?"
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
                        className="w-full bg-signal text-bg font-medium rounded-xl px-6 py-4 hover:bg-signal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {status === 'submitting' ? 'Submitting…' : 'Submit feedback'}
                    </button>
                </form>

                <p className="font-mono text-xs text-text-muted/60 mt-8 text-center">
                    Submissions are categorized automatically and reviewed by administrative staff.
                </p>
            </div>
        </div>
    );
}

export default SubmitFeedback;