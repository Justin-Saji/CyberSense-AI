import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Filter, 
  Check, 
  Archive, 
  Trash2, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { feedbackService } from '../../services/adminService';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadFeedback();
  }, [page, statusFilter]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 20,
        status: statusFilter,
      };
      const data = await feedbackService.getFeedback(params);
      setFeedback(data.feedback);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (feedbackId) => {
    try {
      await feedbackService.markAsRead(feedbackId);
      loadFeedback();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleArchive = async (feedbackId) => {
    try {
      await feedbackService.archive(feedbackId);
      loadFeedback();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackService.delete(feedbackId);
        loadFeedback();
      } catch (error) {
        console.error('Failed to delete feedback:', error);
      }
    }
  };

  const getStatusBadge = (fb) => {
    if (fb.is_archived) return <span className="px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full text-xs font-medium">Archived</span>;
    if (fb.is_read) return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">Read</span>;
    return <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-medium">Unread</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Feedback Management</h1>
          <p className="text-slate-400 mt-2">User feedback and support requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-4">
          <Filter className="text-slate-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">From</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading feedback...
                  </td>
                </tr>
              ) : feedback.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No feedback found
                  </td>
                </tr>
              ) : (
                feedback.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{fb.name || 'Anonymous'}</p>
                        <p className="text-sm text-slate-400">{fb.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{fb.subject}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{fb.message}</td>
                    <td className="px-6 py-4">{getStatusBadge(fb)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!fb.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(fb.id)}
                            className="p-2 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                            title="Mark as Read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {!fb.is_archived && (
                          <button
                            onClick={() => handleArchive(fb.id)}
                            className="p-2 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(fb.id)}
                          className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-cyan-400" size={24} />
            <h3 className="text-lg font-semibold text-cyan-400">Unread</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {feedback.filter(f => !f.is_read && !f.is_archived).length}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Check className="text-emerald-400" size={24} />
            <h3 className="text-lg font-semibold text-emerald-400">Read</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {feedback.filter(f => f.is_read && !f.is_archived).length}
          </p>
        </div>
        <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Archive className="text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-400">Archived</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {feedback.filter(f => f.is_archived).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
