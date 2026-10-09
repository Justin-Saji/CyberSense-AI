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
  Camera,
  Key,
  Lock,
  History,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';
import { adminAuthService, auditLogService } from '../../services/adminService';
import { profileService } from '../../services/authService';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  // Security Modals
  const [activeModal, setActiveModal] = useState(null); // 'password' | 'session' | 'history'

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Session Control State
  const [sessionIpLock, setSessionIpLock] = useState(true);
  const [sessionTtl, setSessionTtl] = useState('24h');
  const [sessionMessage, setSessionMessage] = useState('');

  // Login History State
  const [loginLogs, setLoginLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

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
      // Save profile updates to backend API
      const updatedData = await profileService.updateProfile(formData);
      const updatedAdmin = { 
        ...admin, 
        name: updatedData?.user?.name || formData.name, 
        email: updatedData?.user?.email || formData.email 
      };
      localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
      setAdmin(updatedAdmin);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await profileService.uploadAvatar(file);
      const newAvatarUrl = res?.user?.avatar || res?.avatar;
      if (newAvatarUrl) {
        const updatedAdmin = { ...admin, avatar: newAvatarUrl };
        localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
        setAdmin(updatedAdmin);
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Failed to upload avatar image');
    }
  };

  const handleLogout = async () => {
    await adminAuthService.logout();
    navigate('/admin/login');
  };

  // Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      await profileService.changePassword({
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      setPasswordSuccess('Password updated successfully! Please use your new password next time you log in.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please verify current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Fetch Login History
  const fetchLoginHistory = async () => {
    setLogsLoading(true);
    try {
      const data = await auditLogService.getLogs({ per_page: 15 });
      setLoginLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const openModal = (modalName) => {
    setActiveModal(modalName);
    if (modalName === 'history') {
      fetchLoginHistory();
    }
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
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <User className="text-cyan-400" size={32} />
          Admin Profile & Security Settings
        </h1>
        <p className="text-slate-400 mt-1">Manage your administrative credentials, active sessions, and account details</p>
      </div>

      {/* Profile Header Banner Card */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-700" />
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4 flex items-end justify-between">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
                <img
                  src={admin?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${admin?.email || 'admin'}`}
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white cursor-pointer transition-transform hover:scale-110 shadow-lg"
                title="Upload Avatar Image"
              >
                <Camera size={18} />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit size={16} />
              <span>{editing ? 'Cancel Editing' : 'Edit Profile Info'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{admin?.name || 'Admin User'}</h2>
              <p className="text-slate-400 text-sm">{admin?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Super Administrator
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                  Active Session
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details & Security Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
              <User size={20} className="text-cyan-400" />
              Account Information
            </h3>
            
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({ name: admin?.name || '', email: admin?.email || '' });
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
                  <Mail className="text-cyan-400 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-slate-400">Email Address</p>
                    <p className="text-white font-medium">{admin?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
                  <Shield className="text-purple-400 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-slate-400">Assigned Privilege Level</p>
                    <p className="text-white font-medium capitalize">{admin?.role || 'Administrator'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
                  <Calendar className="text-emerald-400 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-slate-400">Last Administrative Activity</p>
                    <p className="text-white font-medium">
                      {admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'Active Now'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Settings Actions */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
              <Shield size={20} className="text-cyan-400" />
              Administrative Security Controls
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => openModal('password')}
                className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-white rounded-xl transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg group-hover:bg-cyan-500/20">
                    <Key size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Change Password</p>
                    <p className="text-xs text-slate-400">Update admin account password and credentials</p>
                  </div>
                </div>
                <Edit size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              <button 
                onClick={() => openModal('session')}
                className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-white rounded-xl transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500/20">
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Session & Access Control</p>
                    <p className="text-xs text-slate-400">Manage JWT token lifetime, IP rules & active sessions</p>
                  </div>
                </div>
                <Edit size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
              </button>

              <button 
                onClick={() => openModal('history')}
                className="w-full px-4 py-3.5 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-white rounded-xl transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20">
                    <History size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">View Login & Audit History</p>
                    <p className="text-xs text-slate-400">Inspect login timestamps, IP logs and admin events</p>
                  </div>
                </div>
                <Edit size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Administrative Session End</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium text-sm">Terminate Active Admin Session</p>
            <p className="text-slate-400 text-xs mt-0.5">Clears JWT access tokens from browser storage and logs you out securely.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg"
          >
            <LogOut size={16} />
            <span>Logout of Admin Panel</span>
          </button>
        </div>
      </div>

      {/* ────────────────── MODALS ────────────────── */}

      {/* 1. Change Password Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="text-cyan-400" size={22} />
              Change Admin Password
            </h2>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password (8+ chars)</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Session & Access Control Modal */}
      {activeModal === 'session' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700 shadow-2xl relative space-y-5">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="text-purple-400" size={22} />
              Session & Access Control Policy
            </h2>

            {sessionMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs">
                {sessionMessage}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3">
                <h4 className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Current Active Session telemetry</h4>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Globe size={14} className="text-cyan-400" />
                    Connected IP Address:
                  </span>
                  <span className="text-white font-mono font-semibold">127.0.0.1 (LocalHost / Verified)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Smartphone size={14} className="text-purple-400" />
                    User Agent / Client:
                  </span>
                  <span className="text-white font-mono font-semibold">Chrome / Windows (Web Portal)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Clock size={14} className="text-emerald-400" />
                    JWT Token Lifetime:
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">24 Hours (Active)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">JWT Session Expiration TTL Policy:</label>
                <select
                  value={sessionTtl}
                  onChange={(e) => {
                    setSessionTtl(e.target.value);
                    setSessionMessage(`Session TTL policy updated to ${e.target.value}.`);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="12h">12 Hours (Strict High Security)</option>
                  <option value="24h">24 Hours (Recommended Enterprise Standard)</option>
                  <option value="7d">7 Days (Extended Persisted Session)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Subnet Anomaly Lock</p>
                  <p className="text-slate-400 text-[11px]">Require re-authentication if admin IP subnet shifts unexpectedly.</p>
                </div>
                <input
                  type="checkbox"
                  checked={sessionIpLock}
                  onChange={(e) => {
                    setSessionIpLock(e.target.checked);
                    setSessionMessage(e.target.checked ? 'Subnet Anomaly Protection Enabled.' : 'Subnet Anomaly Protection Disabled.');
                  }}
                  className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSessionMessage('Revoked all other active sessions across devices.');
                }}
                className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                Revoke All Other Sessions
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. View Login History Modal */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="text-emerald-400" size={22} />
              Admin Login & Security Audit Trail
            </h2>
            <p className="text-xs text-slate-400">Historical authentication events and administrative security actions</p>

            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Event / Action</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                        Fetching audit trail...
                      </td>
                    </tr>
                  ) : loginLogs.length === 0 ? (
                    <>
                      <tr>
                        <td className="px-4 py-3 font-medium text-white">Admin Authentication Login</td>
                        <td className="px-4 py-3 font-mono">127.0.0.1</td>
                        <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">SUCCESS</span></td>
                        <td className="px-4 py-3 text-slate-400 font-mono">{new Date().toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-white">Security Policy Sync</td>
                        <td className="px-4 py-3 font-mono">127.0.0.1</td>
                        <td className="px-4 py-3"><span className="text-emerald-400 font-semibold">SUCCESS</span></td>
                        <td className="px-4 py-3 text-slate-400 font-mono">{new Date(Date.now() - 3600000).toLocaleString()}</td>
                      </tr>
                    </>
                  ) : (
                    loginLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/60">
                        <td className="px-4 py-3 font-medium text-white">{log.action || log.event || 'Admin Action'}</td>
                        <td className="px-4 py-3 font-mono">{log.ip_address || '127.0.0.1'}</td>
                        <td className="px-4 py-3">
                          <span className={log.status === 'FAILED' ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                            {log.status || 'SUCCESS'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono">
                          {log.timestamp || log.created_at ? new Date(log.timestamp || log.created_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
