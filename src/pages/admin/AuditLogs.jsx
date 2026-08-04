import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Filter, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { auditLogService } from '../../services/adminService';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 50,
        action: actionFilter,
      };
      const data = await auditLogService.getLogs(params);
      setLogs(data.logs);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const styles = {
      USER_CREATED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      USER_UPDATED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      USER_DELETED: 'bg-red-500/20 text-red-400 border-red-500/30',
      USER_SUSPENDED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      USER_ACTIVATED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      ADMIN_LOGIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      ADMIN_LOGOUT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      AI_MODEL_UPDATED: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      SETTING_UPDATED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    };
    return (
      <span className={`px-3 py-1 border rounded-full text-xs font-medium ${styles[action] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 mt-2">Immutable admin action logs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center gap-4">
          <Filter className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{log.adminName}</p>
                        <p className="text-sm text-slate-400">{log.adminEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {log.target_type && (
                        <span className="text-white">{log.target_type}</span>
                      )}
                      {log.target_id && (
                        <span className="text-slate-500"> #{log.target_id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{log.details || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{log.ip_address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
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
    </div>
  );
};

export default AuditLogs;
