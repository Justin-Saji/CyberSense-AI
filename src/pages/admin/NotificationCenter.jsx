import { useState, useEffect } from 'react';
import { 
  Bell, 
  Filter, 
  Check, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { notificationService } from '../../services/adminService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page, priorityFilter, typeFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 20,
        priority: priorityFilter,
        type: typeFilter,
      };
      const data = await notificationService.getNotifications(params);
      setNotifications(data.notifications);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationService.delete(notificationId);
        loadNotifications();
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return (
      <span className={`px-3 py-1 border rounded-full text-xs font-medium uppercase ${styles[priority] || styles.low}`}>
        {priority || 'low'}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      security: 'bg-red-500/20 text-red-400 border-red-500/30',
      system: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      user: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      ai: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return (
      <span className={`px-3 py-1 border rounded-full text-xs font-medium uppercase ${styles[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {type || 'general'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notification Center</h1>
          <p className="text-slate-400 mt-2">Admin alerts and system notifications</p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          <CheckCircle size={20} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4">
            <Filter className="text-slate-400" size={20} />
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Types</option>
              <option value="security">Security</option>
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="ai">AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading notifications...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No notifications found
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => (
                  <tr key={notif.id} className={`hover:bg-slate-700/50 transition-colors ${!notif.is_read ? 'bg-cyan-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        )}
                        <p className="font-medium text-white">{notif.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{notif.message}</td>
                    <td className="px-6 py-4">{getTypeBadge(notif.type)}</td>
                    <td className="px-6 py-4">{getPriorityBadge(notif.priority)}</td>
                    <td className="px-6 py-4">
                      {notif.is_read ? (
                        <span className="px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full text-xs font-medium">Read</span>
                      ) : (
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-medium">Unread</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-2 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                            title="Mark as Read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
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

      {/* Notification Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-cyan-400" size={24} />
            <h3 className="text-lg font-semibold text-cyan-400">Unread</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {notifications.filter(n => !n.is_read).length}
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-red-400" size={24} />
            <h3 className="text-lg font-semibold text-red-400">High Priority</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {notifications.filter(n => n.priority === 'high').length}
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-purple-400" size={24} />
            <h3 className="text-lg font-semibold text-purple-400">Security</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {notifications.filter(n => n.type === 'security').length}
          </p>
        </div>
        <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-400">Total</h3>
          </div>
          <p className="text-3xl font-bold text-white">{notifications.length}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
