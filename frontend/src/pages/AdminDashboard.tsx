import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/config';
import { useAuth } from '../context/AuthContext';

interface FeedbackItem {
  _id: string;
  message: string;
  category: 'HR' | 'Facilities' | 'IT' | 'Management' | 'Other';
  status: 'new' | 'in-review' | 'resolved';
  aiCategorized: boolean;
  createdAt: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  HR: 'text-warm border-warm/30 bg-warm/10',
  IT: 'text-signal border-signal/30 bg-signal/10',
  Facilities: 'text-blue-300 border-blue-400/30 bg-blue-400/10',
  Management: 'text-purple-300 border-purple-400/30 bg-purple-400/10',
  Other: 'text-text-muted border-white/10 bg-white/5',
};

const STATUS_STYLES: Record<string, string> = {
  new: 'text-signal border-signal/30 bg-signal/10',
  'in-review': 'text-warm border-warm/30 bg-warm/10',
  resolved: 'text-text-muted border-white/10 bg-white/5',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminDashboard() {
  const { token, admin, logout } = useAuth();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate('/admin/login');
        return;
      }
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const previous = feedback;
    setFeedback((prev) =>
      prev.map((f) => (f._id === id ? { ...f, status: newStatus as FeedbackItem['status'] } : f))
    );
    try {
      await api.patch(
        `/feedback/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setFeedback(previous);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const filtered = feedback.filter((f) => {
    const categoryMatch = categoryFilter === 'All' || f.category === categoryFilter;
    const statusMatch = statusFilter === 'All' || f.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const categories = ['All', 'HR', 'Facilities', 'IT', 'Management', 'Other'];
  const statuses = ['All', 'new', 'in-review', 'resolved'];

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-white/5 sticky top-0 bg-bg/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs text-text-muted uppercase tracking-wider">
              Ethiopian Statistics Service
            </p>
            <h1 className="font-display text-lg font-semibold">Feedback Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-text-muted hidden sm:inline">
              {admin?.username}
            </span>
            <button
              onClick={handleLogout}
              className="font-mono text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-red-400/50 hover:text-red-400 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-signal/50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-signal/50"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </option>
            ))}
          </select>

          <div className="ml-auto font-mono text-xs text-text-muted self-center">
            {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-text-muted font-mono text-sm">Loading…</div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400 font-mono text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-text-muted font-mono text-sm">
            No submissions match these filters.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-surface border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`font-mono text-xs px-2 py-1 rounded-full border ${CATEGORY_STYLES[item.category]}`}
                >
                  {item.category}
                </span>
                <span
                  className={`font-mono text-xs px-2 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}
                >
                  {item.status}
                </span>
                {!item.aiCategorized && (
                  <span className="font-mono text-xs px-2 py-1 rounded-full border border-white/10 text-text-muted">
                    keyword fallback
                  </span>
                )}
                <span className="font-mono text-xs text-text-muted ml-auto">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              <p className="text-text leading-relaxed mb-4">{item.message}</p>

              <div className="flex flex-wrap gap-2">
                {statuses.slice(1).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(item._id, s)}
                    disabled={item.status === s}
                    className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      item.status === s
                        ? 'border-signal/50 text-signal cursor-default'
                        : 'border-white/10 text-text-muted hover:border-white/30 hover:text-text'
                    }`}
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
