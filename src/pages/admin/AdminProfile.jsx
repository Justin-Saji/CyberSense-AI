import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Edit,
  Save,
  LogOut,
  Camera
} from 'lucide-react';
import { adminAuthService } from '../../services/adminService';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = () => {
    const adminData = adminAuthService.getCurrentAdmin();
    setAdmin(adminData);
    setFormData({ name: adminData?.name || '', email: adminData?.email || '' });
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, you would call an API to update the profile
      // For now, we'll just update the local storage
      const updatedAdmin = { ...admin, ...formData };
      localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
      setAdmin(updatedAdmin);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await adminAuthService.logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Profile</h1>
        <p className="text-slate-400 mt-2">Manage your admin account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-cyan-500 to-purple-500" />
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-700 overflow-hidden">
              <img
                src={admin?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${admin?.email}`}
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white transition-colors">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{admin?.name}</h2>
              <p className="text-slate-400">{admin?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium">
                  Admin
                </span>
                {admin?.is_active && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-medium">
                    Active
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <Edit size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-cyan-400" />
            Account Information
          </h3>
          
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({ name: admin?.name || '', email: admin?.email || '' });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-slate-400" size={18} />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white">{admin?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-slate-400" size={18} />
                <div>
                  <p className="text-sm text-slate-400">Role</p>
                  <p className="text-white capitalize">{admin?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-slate-400" size={18} />
                <div>
                  <p className="text-sm text-slate-400">Last Login</p>
                  <p className="text-white">{admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Settings */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-cyan-④00" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left flex items-center justify-between">
              <span>Change Password</span>
              <Edit size={18} className="text-slate-400" />
            </button>
            <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left flex items-center justify-between">
              <span>Enable 2FA</span>
              <Edit size={18} className="text-slate-400" />
            </button>
            <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left flex items-center justify-between">
              <span>View Login History</span>
              <Edit size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Logout from Admin Panel</p>
            <p className="text-slate-400 text-sm mt-1">You will need to login again to access the admin panel.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
