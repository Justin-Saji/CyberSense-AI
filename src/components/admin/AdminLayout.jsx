import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileText, 
  Settings, 
  Database, 
  Bell, 
  LogOut,
  Menu,
  X,
  Cpu,
  AlertTriangle,
  ClipboardList,
  MessageSquare,
  User
} from 'lucide-react';
import { adminAuthService } from '../../services/adminService';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const adminUser = adminAuthService.getCurrentAdmin();

  const handleLogout = async () => {
    await adminAuthService.logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/ai-models', icon: Cpu, label: 'AI Modules' },
    { path: '/admin/risk-users', icon: AlertTriangle, label: 'Risk Management' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/security-logs', icon: Shield, label: 'Security Logs' },
    { path: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
    { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/database', icon: Database, label: 'Database' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400">CyberSense AI Admin</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 pt-16 lg:pt-0`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
              <h1 className="text-2xl font-bold text-cyan-400">CyberSense AI</h1>
              <p className="text-sm text-slate-400 mt-1">Admin Panel</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User info & logout */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={adminUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${adminUser?.email}`}
                  alt="Admin"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{adminUser?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{adminUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-slate-300 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0 pt-16 lg:pt-0">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
