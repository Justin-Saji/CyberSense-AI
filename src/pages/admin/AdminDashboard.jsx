import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Shield, 
  ScanLine, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { dashboardService } from '../../services/adminService';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, chartsData] = await Promise.all([
        dashboardService.getStats().catch(() => ({
          totalUsers: 0,
          activeToday: 0,
          totalScans: 0,
          highRiskUsers: 0,
          newUsersWeek: 0,
          smsScans: 0,
          emailScans: 0,
          urlScans: 0,
          mediumRiskUsers: 0,
          lowRiskUsers: 0,
          avgRiskScore: 0,
          activeUsers: 0,
          unreadNotifications: 0,
        })),
        dashboardService.getCharts().catch(() => ({
          registrationTrend: [],
          dailyPredictions: [],
          riskDistribution: [],
          moduleUsage: [],
        })),
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set default data on error
      setStats({
        totalUsers: 0,
        activeToday: 0,
        totalScans: 0,
        highRiskUsers: 0,
        newUsersWeek: 0,
        smsScans: 0,
        emailScans: 0,
        urlScans: 0,
        mediumRiskUsers: 0,
        lowRiskUsers: 0,
        avgRiskScore: 0,
        activeUsers: 0,
        unreadNotifications: 0,
      });
      setCharts({
        registrationTrend: [],
        dailyPredictions: [],
        riskDistribution: [],
        moduleUsage: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Overview of your cybersecurity platform</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="cyan"
          trend="+12%"
        />
        <StatCard
          title="Active Today"
          value={stats?.activeToday || 0}
          icon={Activity}
          color="emerald"
          trend="+8%"
        />
        <StatCard
          title="Total Scans"
          value={stats?.totalScans || 0}
          icon={ScanLine}
          color="purple"
          trend="+23%"
        />
        <StatCard
          title="High Risk Users"
          value={stats?.highRiskUsers || 0}
          icon={AlertTriangle}
          color="red"
          trend="-5%"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="New This Week"
          value={stats?.newUsersWeek || 0}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="SMS Scans"
          value={stats?.smsScans || 0}
          icon={Shield}
          color="green"
        />
        <StatCard
          title="Email Scans"
          value={stats?.emailScans || 0}
          icon={Shield}
          color="yellow"
        />
        <StatCard
          title="URL Scans"
          value={stats?.urlScans || 0}
          icon={Shield}
          color="pink"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trend */}
        <ChartCard title="User Registration Trend (30 Days)" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts?.registrationTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Daily AI Predictions */}
        <ChartCard title="Daily AI Predictions (7 Days)" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts?.dailyPredictions || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Distribution */}
        <ChartCard title="Risk Distribution" icon={PieChart}>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={charts?.riskDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(charts?.riskDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Module Usage */}
        <ChartCard title="Module Usage" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts?.moduleUsage || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">High Risk</span>
              <span className="text-red-400 font-semibold">{stats?.highRiskUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Medium Risk</span>
              <span className="text-amber-400 font-semibold">{stats?.mediumRiskUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Low Risk</span>
              <span className="text-emerald-400 font-semibold">{stats?.lowRiskUsers || 0}</span>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Risk Score</span>
                <span className="text-cyan-400 font-semibold">{stats?.avgRiskScore?.toFixed(1) || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Users</span>
              <span className="text-emerald-400 font-semibold">{stats?.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Users</span>
              <span className="text-cyan-400 font-semibold">{stats?.totalUsers || 0}</span>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Unread Notifications</span>
                <span className="text-amber-400 font-semibold">{stats?.unreadNotifications || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full py-2 px-4 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-left">
              View All Users
            </button>
            <button className="w-full py-2 px-4 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-left">
              Manage AI Models
            </button>
            <button className="w-full py-2 px-4 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-left">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    red: 'text-red-400 bg-red-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-green-400 bg-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    pink: 'text-pink-400 bg-pink-500/20',
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.cyan}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, icon: Icon, children }) => (
  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="text-cyan-400" size={24} />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

export default AdminDashboard;
