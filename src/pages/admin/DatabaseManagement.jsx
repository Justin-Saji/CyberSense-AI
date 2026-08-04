import { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { databaseService } from '../../services/adminService';

const DatabaseManagement = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleanupDays, setCleanupDays] = useState(90);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await databaseService.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load database status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm(`Are you sure you want to delete logs older than ${cleanupDays} days? This action cannot be undone.`)) {
      return;
    }

    setCleaning(true);
    try {
      const data = await databaseService.cleanup(cleanupDays);
      alert(`Cleanup completed. Deleted ${data.deletedRecords} records.`);
      loadStatus();
    } catch (error) {
      console.error('Failed to cleanup database:', error);
      alert('Failed to cleanup database');
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Database Management</h1>
          <p className="text-slate-400 mt-2">Monitor and maintain database health</p>
        </div>
        <button
          onClick={loadStatus}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Database Status */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : status ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Records"
            value={status.totalRecords?.toLocaleString()}
            icon={Database}
            color="cyan"
          />
          <StatCard
            title="Users"
            value={status.users?.toLocaleString()}
            icon={Database}
            color="emerald"
          />
          <StatCard
            title="Scans"
            value={status.scans?.toLocaleString()}
            icon={Database}
            color="purple"
          />
          <StatCard
            title="Logs"
            value={(status.logs + status.auditLogs)?.toLocaleString()}
            icon={Database}
            color="amber"
          />
        </div>
      ) : null}

      {/* Cleanup Section */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-amber-500/20 rounded-lg">
            <AlertTriangle className="text-amber-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Database Cleanup</h2>
            <p className="text-slate-400">
              Delete old system logs to free up database space. This action is irreversible.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-slate-300">Delete logs older than:</label>
          <input
            type="number"
            min="1"
            max="365"
            value={cleanupDays}
            onChange={(e) => setCleanupDays(parseInt(e.target.value))}
            className="w-24 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <span className="text-sm text-slate-400">days</span>
        </div>

        <button
          onClick={handleCleanup}
          disabled={cleaning}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={20} />
          <span>{cleaning ? 'Cleaning...' : 'Run Cleanup'}</span>
        </button>
      </div>

      {/* Health Status */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Database Health</h2>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 font-medium">Healthy</span>
        </div>
        <p className="text-slate-400 mt-2 text-sm">
          Database connection is stable and responding normally.
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.cyan}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement;
