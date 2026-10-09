import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Filter, 
  Check, 
  Archive, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Mail,
  User,
  Clock
} from 'lucide-react';
import { feedbackService } from '../../services/adminService';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      setFeedback(data.feedback || []);
      setTotalPages(data.pages || 1);
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
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback(prev => prev ? { ...prev, is_read: true, isRead: true } : null);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleArchive = async (feedbackId) => {
    try {
      await feedbackService.archive(feedbackId);
      loadFeedback();
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback(prev => prev ? { ...prev, is_archived: true, isArchived: true } : null);
      }
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (confirm('Are you sure you want to delete this feedback item?')) {
      try {
        await feedbackService.delete(feedbackId);
        if (showDetailModal && selectedFeedback?.id === feedbackId) {
          setShowDetailModal(false);
        }
        loadFeedback();
      } catch (error) {
        console.error('Failed to delete feedback:', error);
      }
    }
  };

  const openDetailModal = (fb) => {
    setSelectedFeedback(fb);
    setShowDetailModal(true);
    if (!(fb.isRead ?? fb.is_read)) {
      handleMarkAsRead(fb.id);
    }
  };

  const getStatusBadge = (fb) => {
    const isArchived = fb.isArchived ?? fb.is_archived;
    const isRead = fb.isRead ?? fb.is_read;

    if (isArchived) return <span className="px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full text-xs font-medium">Archived</span>;
    if (isRead) return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">Read</span>;
    return <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-medium">Unread</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-cyan-400" size={30} />
            Feedback & User Support Management
          </h1>
          <p className="text-slate-400 mt-1">Review feedback, support requests, and user suggestions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="text-slate-400" size={18} />
          <span className="text-sm font-medium text-slate-300">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="text-sm text-slate-400">
          Showing {feedback.length} submissions
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
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Message Preview</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading user submissions...
                  </td>
                </tr>
              ) : feedback.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-white font-semibold">No feedback records found</p>
                      <p className="text-xs text-slate-500">Submissions from users via the platform feedback form will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                feedback.map((fb) => {
                  const isRead = fb.isRead ?? fb.is_read;
                  const isArchived = fb.isArchived ?? fb.is_archived;
                  const dateStr = fb.createdAt || fb.created_at;

                  return (
                    <tr 
                      key={fb.id} 
                      className={`hover:bg-slate-700/50 transition-colors cursor-pointer ${
                        !isRead ? 'bg-cyan-950/20 font-medium' : ''
                      }`}
                      onClick={() => openDetailModal(fb)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{fb.name || 'Anonymous User'}</p>
                          <p className="text-xs text-slate-400">{fb.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{fb.subject}</td>
                      <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">{fb.message}</td>
                      <td className="px-6 py-4">{getStatusBadge(fb)}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                        {formatDate(dateStr)}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailModal(fb)}
                            className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {!isRead && (
                            <button
                              onClick={() => handleMarkAsRead(fb.id)}
                              className="p-2 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                              title="Mark as Read"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          {!isArchived && (
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900/40">
            <p className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-xl border border-slate-700 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedFeedback.subject}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedFeedback)}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(selectedFeedback.createdAt || selectedFeedback.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <User size={14} className="text-cyan-400" />
                <span className="text-slate-400 font-medium">Submitted By:</span>
                <span className="text-white font-semibold">{selectedFeedback.name || 'Anonymous'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={14} className="text-cyan-400" />
                <span className="text-slate-400 font-medium">Contact Email:</span>
                <a href={`mailto:${selectedFeedback.email}`} className="text-cyan-400 hover:underline">
                  {selectedFeedback.email || 'N/A'}
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Feedback Content:
              </label>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedFeedback.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <div className="flex gap-2">
                {!(selectedFeedback.isArchived ?? selectedFeedback.is_archived) && (
                  <button
                    onClick={() => handleArchive(selectedFeedback.id)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Archive size={14} />
                    <span>Archive</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(selectedFeedback.id)}
                className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete Submission</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
