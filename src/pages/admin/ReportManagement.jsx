import { useState, useEffect } from 'react';
import { 
  FileText, 
  Filter, 
  Trash2, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { reportService } from '../../services/adminService';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [threatFilter, setThreatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReports();
  }, [page, moduleFilter, threatFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 20,
        module: moduleFilter,
        threat_level: threatFilter,
      };
      const data = await reportService.getReports(params);
      setReports(data.reports);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await reportService.deleteReport(reportId);
        loadReports();
      } catch (error) {
        console.error('Failed to delete report:', error);
        alert('Failed to delete report');
      }
    }
  };

  const getModuleBadge = (module) => {
    const styles = {
      sms: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      email: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      url: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return (
      <span className={`px-3 py-1 border rounded-full text-xs font-medium uppercase ${styles[module] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {module || 'Unknown'}
      </span>
    );
  };

  const getThreatBadge = (threatLevel) => {
    const styles = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      safe: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return (
      <span className={`px-3 py-1 border rounded-full text-xs font-medium uppercase ${styles[threatLevel?.toLowerCase()] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {threatLevel || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Report Management</h1>
          <p className="text-slate-400 mt-2">View and manage scan reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4">
            <Filter className="text-slate-400" size={20} />
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Modules</option>
              <option value="sms">SMS Phishing</option>
              <option value="email">Email Phishing</option>
              <option value="url">URL Scanner</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={threatFilter}
              onChange={(e) => {
                setThreatFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Threat Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="safe">Safe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Report</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Threat Level</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <FileText className="text-cyan-400" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{report.input?.substring(0, 50)}...</p>
                          <p className="text-sm text-slate-400">ID: {report.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{report.userName}</p>
                        <p className="text-sm text-slate-400">{report.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getModuleBadge(report.module)}</td>
                    <td className="px-6 py-4">{getThreatBadge(report.threat_level)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 size={18} />
                      </button>
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

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Total Reports</h3>
          <p className="text-3xl font-bold text-white">{reports.length}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-sm font-medium text-red-400 mb-2">High Threat</h3>
          <p className="text-3xl font-bold text-white">
            {reports.filter(r => r.threat_level?.toLowerCase() === 'high').length}
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <h3 className="text-sm font-medium text-amber-400 mb-2">Medium Threat</h3>
          <p className="text-3xl font-bold text-white">
            {reports.filter(r => r.threat_level?.toLowerCase() === 'medium').length}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <h3 className="text-sm font-medium text-emerald-400 mb-2">Safe</h3>
          <p className="text-3xl font-bold text-white">
            {reports.filter(r => r.threat_level?.toLowerCase() === 'safe').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
