import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, ShieldCheck, LogOut, Camera, X, Download, 
  Settings, Bell, Lock, Eye, EyeOff, AlertTriangle, CheckCircle,
  TrendingUp, Award, Activity, Sparkles, ChevronRight, Edit2,
  Save, RefreshCw, Trash2, Moon, Sun, Monitor
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { checkPasswordStrength } from '../utils/validators';
import { profileService, settingsService } from '../services/authService';

export const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [profileUser, setProfileUser] = useState(user);

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Settings states
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    securityAlerts: true,
    phishingAlerts: true,
    passwordExpiry: true,
    accountActivity: true,
    aiNotifications: true,
  });
  const [privacy, setPrivacy] = useState({
    emailNotifications: true,
    securityAlerts: true,
    aiRecommendations: true,
    marketingEmails: false,
    accountVisibility: true,
    anonymousAnalytics: true,
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Delete account states
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState({});

  useEffect(() => {
    setProfileUser(user);
    setEditName(user?.name || '');
    setAvatarPreview(user?.avatar || '');

    const fetchUserSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        if (data && data.settings) {
          const s = data.settings;
          setNotifications({
            securityAlerts: s.security_alerts ?? s.securityAlerts ?? true,
            phishingAlerts: s.phishing_alerts ?? s.phishingAlerts ?? true,
            passwordExpiry: s.password_expiry_alerts ?? s.passwordExpiry ?? true,
            accountActivity: s.account_activity ?? s.accountActivity ?? true,
            aiNotifications: s.ai_notifications ?? s.aiNotifications ?? true,
          });
          setPrivacy({
            emailNotifications: s.email_notifications ?? s.emailNotifications ?? true,
            securityAlerts: s.security_alerts ?? s.securityAlerts ?? true,
            aiRecommendations: s.ai_recommendations ?? s.aiRecommendations ?? true,
            marketingEmails: s.marketing_emails ?? s.marketingEmails ?? false,
            accountVisibility: s.account_visibility ?? s.accountVisibility ?? true,
            anonymousAnalytics: s.anonymous_analytics ?? s.anonymousAnalytics ?? true,
          });
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
      }
    };

    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const dbSettingKeyMap = {
    securityAlerts: 'security_alerts',
    phishingAlerts: 'phishing_alerts',
    passwordExpiry: 'password_expiry_alerts',
    accountActivity: 'account_activity',
    aiNotifications: 'ai_notifications',
    emailNotifications: 'email_notifications',
    aiRecommendations: 'ai_recommendations',
    marketingEmails: 'marketing_emails',
    accountVisibility: 'account_visibility',
    anonymousAnalytics: 'anonymous_analytics',
  };

  const handleToggleSetting = async (category, key) => {
    const dbKey = dbSettingKeyMap[key] || key;
    if (updatingSettings[key]) return; // Prevent rapid multi-clicking

    const currentVal = category === 'notifications' ? notifications[key] : privacy[key];
    const newVal = !currentVal;

    // 1. Show loading state & optimistic UI update
    setUpdatingSettings((prev) => ({ ...prev, [key]: true }));

    if (category === 'notifications') {
      setNotifications((prev) => ({ ...prev, [key]: newVal }));
      if (key === 'securityAlerts') {
        setPrivacy((prev) => ({ ...prev, securityAlerts: newVal }));
      }
    } else {
      setPrivacy((prev) => ({ ...prev, [key]: newVal }));
      if (key === 'securityAlerts') {
        setNotifications((prev) => ({ ...prev, securityAlerts: newVal }));
      }
    }

    try {
      // 2. API Request
      const res = await settingsService.updateSetting(dbKey, newVal);

      if (res && res.success) {
        const s = res.settings;
        setNotifications({
          securityAlerts: s.security_alerts ?? true,
          phishingAlerts: s.phishing_alerts ?? true,
          passwordExpiry: s.password_expiry_alerts ?? true,
          accountActivity: s.account_activity ?? true,
          aiNotifications: s.ai_notifications ?? true,
        });
        setPrivacy({
          emailNotifications: s.email_notifications ?? true,
          securityAlerts: s.security_alerts ?? true,
          aiRecommendations: s.ai_recommendations ?? true,
          marketingEmails: s.marketing_emails ?? false,
          accountVisibility: s.account_visibility ?? true,
          anonymousAnalytics: s.anonymous_analytics ?? true,
        });

        const msg = res.message || `${key} ${newVal ? 'enabled' : 'disabled'}.`;
        addToast(msg, 'success', 'Setting Updated');
      } else {
        throw new Error(res.message || 'Failed to update setting');
      }
    } catch (error) {
      // Revert optimistic update on error
      if (category === 'notifications') {
        setNotifications((prev) => ({ ...prev, [key]: currentVal }));
        if (key === 'securityAlerts') {
          setPrivacy((prev) => ({ ...prev, securityAlerts: currentVal }));
        }
      } else {
        setPrivacy((prev) => ({ ...prev, [key]: currentVal }));
        if (key === 'securityAlerts') {
          setNotifications((prev) => ({ ...prev, securityAlerts: currentVal }));
        }
      }
      const errMessage = error.response?.data?.message || error.message || 'Failed to save setting';
      addToast(errMessage, 'danger', 'Update Failed');
    } finally {
      setUpdatingSettings((prev) => ({ ...prev, [key]: false }));
    }
  };

  const securityData = {
    securityScore: profileUser?.google_id ? 82 : 78,
    securityLevel: profileUser?.google_id ? 'High' : 'Medium',
    riskScore: profileUser?.google_id ? 18 : 22,
    passwordStrength: profileUser?.password_hash ? 'Strong' : 'Needs setup',
    googleConnected: !!profileUser?.google_id,
    lastPasswordChanged: profileUser?.created_at ? new Date(profileUser.created_at).toLocaleDateString() : 'Not set',
    lastLogin: new Date().toLocaleString(),
    accountStatus: profileUser?.email ? 'Active' : 'Pending',
  };

  const recentActivities = [
    { icon: CheckCircle, color: 'text-emerald-400', activity: 'Successful Login', date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() },
    { icon: ShieldCheck, color: 'text-cyan-400', activity: 'Password Updated', date: new Date().toLocaleDateString(), time: '14:30' },
    { icon: User, color: 'text-purple-400', activity: 'Profile Updated', date: new Date().toLocaleDateString(), time: '09:15' },
    { icon: Camera, color: 'text-pink-400', activity: 'Avatar Updated', date: new Date().toLocaleDateString(), time: '16:45' },
  ];

  const aiRecommendations = [
    { icon: ShieldCheck, title: 'Enable two-factor authentication for your account', priority: 'high' },
    { icon: Lock, title: 'Review your current password strength and update it if needed', priority: 'medium' },
    { icon: AlertTriangle, title: 'Avoid clicking suspicious SMS links and unexpected attachments', priority: 'high' },
    { icon: Award, title: 'Complete phishing awareness training to keep your habits sharp', priority: 'low' },
    { icon: Sparkles, title: 'Keep your security profile current with the latest checks', priority: 'medium' },
  ];

  const achievements = [
    { icon: ShieldCheck, name: 'Cyber Beginner', unlocked: true, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { icon: Lock, name: 'Strong Password User', unlocked: !!profileUser?.password_hash, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { icon: CheckCircle, name: 'Google Verified', unlocked: !!profileUser?.google_id, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { icon: Award, name: 'Password Updated', unlocked: true, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { icon: Activity, name: 'Safe Login Streak', unlocked: false, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    { icon: AlertTriangle, name: 'Phishing Aware', unlocked: false, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  ];

  const riskTrendData = [
    { week: 'Week 1', score: 30 },
    { week: 'Week 2', score: 28 },
    { week: 'Week 3', score: 25 },
    { week: 'Week 4', score: 25 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        addToast('Unsupported file format. Please select a PNG, JPG, JPEG, WEBP, or GIF image.', 'danger', 'Invalid File Type');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast('Avatar image must be less than 5MB', 'danger', 'File Too Large');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    try {
      const data = await profileService.removeAvatar();
      if (data && data.user) {
        if (updateUser) updateUser(data.user);
        setProfileUser(data.user);
        setAvatarPreview('');
        setAvatarFile(null);
        addToast('Avatar removed successfully', 'success', 'Avatar Removed');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove avatar';
      addToast(msg, 'danger', 'Remove Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      addToast('Name is required', 'danger', 'Validation Error');
      return;
    }
    setLoading(true);
    try {
      let updatedUser = profileUser;

      // 1. Upload avatar file if a new file was selected
      if (avatarFile) {
        const avatarRes = await profileService.uploadAvatar(avatarFile);
        if (avatarRes && avatarRes.user) {
          updatedUser = avatarRes.user;
        }
      }

      // 2. Update name if edited
      if (editName.trim() !== profileUser?.name) {
        const profileRes = await profileService.updateProfile({ name: editName.trim() });
        if (profileRes && profileRes.user) {
          updatedUser = profileRes.user;
        }
      }

      // 3. Update global AuthContext user state & local states
      if (updateUser) {
        updateUser(updatedUser);
      }
      setProfileUser(updatedUser);
      setAvatarPreview(updatedUser?.avatar || '');
      setAvatarFile(null);
      addToast('Profile updated successfully', 'success', 'Profile Updated');
      setIsEditing(false);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      addToast(msg, 'danger', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(profileUser?.name || '');
    setAvatarPreview(profileUser?.avatar || '');
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.current = 'Current password is required';
    }
    
    const strength = checkPasswordStrength(passwordData.newPassword);
    if (strength.score < 3) {
      errors.new = 'Password is too weak';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirm = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      addToast('Password changed successfully', 'success', 'Password Updated');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password';
      const field = error.response?.data?.field;
      if (field) {
        setPasswordErrors((prev) => ({ ...prev, [field === 'newPassword' ? 'new' : 'current']: msg }));
      }
      addToast(msg, 'danger', 'Change Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      addToast('Please type DELETE to confirm', 'danger', 'Confirmation Required');
      return;
    }
    if (!deletePassword) {
      addToast('Please enter your password to delete your account', 'danger', 'Password Required');
      return;
    }
    setLoading(true);
    try {
      await profileService.deleteAccount(deletePassword);
      addToast('Account deleted successfully', 'success', 'Account Deleted');
      logout();
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete account';
      addToast(msg, 'danger', 'Deletion Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setLoading(true);
    try {
      const userData = await profileService.downloadUserData();
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cybersense-data-${profileUser?.email}.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('Your data has been downloaded', 'success', 'Data Downloaded');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to download your data';
      addToast(msg, 'danger', 'Download Failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 py-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">User Profile</h1>
        <p className="text-xs text-slate-400">Manage your account & security settings</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-cyan-400" />
              )}
            </div>
            {isEditing && (
              <div className="absolute -bottom-2 -right-2 flex space-x-1">
                <label className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-400 transition-colors shadow-md" title="Upload Photo">
                  <Camera className="w-4 h-4 text-slate-950" />
                  <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp, image/gif" onChange={handleAvatarChange} className="hidden" />
                </label>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-400 transition-colors shadow-md"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-bold text-white bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
              />
            ) : (
              <h2 className="text-xl font-bold text-white">{profileUser?.name || 'User'}</h2>
            )}
            <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{profileUser?.email || 'user@example.com'}</span>
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${securityData.googleConnected ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}`}>
                {securityData.googleConnected ? 'Google Connected' : 'Google Not Connected'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                {securityData.accountStatus}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-semibold text-xs hover:text-white transition-all flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-semibold text-xs hover:text-white transition-all flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs transition-all flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-2 shadow-xl">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl col-span-full"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Security Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border ${
                      rec.priority === 'high'
                        ? 'bg-rose-500/10 border-rose-500/20'
                        : rec.priority === 'medium'
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <rec.icon className={`w-4 h-4 mt-0.5 ${
                        rec.priority === 'high' ? 'text-rose-400' : rec.priority === 'medium' ? 'text-amber-400' : 'text-slate-400'
                      }`} />
                      <p className="text-xs text-slate-300">{rec.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Account Info</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Member Since</span>
                  <span className="text-xs text-white font-semibold">{profileUser?.created_at ? new Date(profileUser.created_at).getFullYear() : '2026'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Last Login</span>
                  <span className="text-xs text-white font-semibold">{securityData.lastLogin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Password Strength</span>
                  <span className="text-xs text-emerald-400 font-semibold">{securityData.passwordStrength}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Profile Completion</span>
                  <span className="text-xs text-cyan-400 font-semibold">85%</span>
                </div>
              </div>
            </motion.div>

            {/* Download Data */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Download className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Your Data</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Download all your account data in JSON format.</p>
              <button
                onClick={handleDownloadData}
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download My Data</span>
              </button>
            </motion.div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Change Password</h3>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.current && <p className="text-[11px] text-rose-400">{passwordErrors.current}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.new && <p className="text-[11px] text-rose-400">{passwordErrors.new}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirm && <p className="text-[11px] text-rose-400">{passwordErrors.confirm}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </motion.div>

            {/* Delete Account */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a]/90 border border-rose-500/20 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-rose-400">Delete Account</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              {!showDeleteModal ? (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-xs hover:bg-rose-500/20 transition-all"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                  />
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your account password"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold text-xs hover:bg-rose-400 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmation('');
                        setDeletePassword('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-semibold text-xs hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full bg-slate-800 p-2 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.activity}</p>
                        <p className="text-[11px] text-slate-400">{item.date} • {item.time}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-cyan-400">Logged</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Award className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Achievements</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${achievement.color} ${!achievement.unlocked ? 'opacity-50' : ''} text-center space-y-2`}
                >
                  <achievement.icon className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-semibold text-white">{achievement.name}</p>
                  {achievement.unlocked && (
                    <CheckCircle className="w-4 h-4 mx-auto text-emerald-400" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Notifications</h3>
              </div>
              <div className="space-y-3">
                {Object.entries({
                  securityAlerts: 'Security Alerts',
                  phishingAlerts: 'Phishing Alerts',
                  passwordExpiry: 'Password Expiry Alerts',
                  accountActivity: 'Account Activity',
                  aiNotifications: 'AI Notifications',
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">{label}</span>
                    <button
                      onClick={() => handleToggleSetting('notifications', key)}
                      disabled={!!updatingSettings[key]}
                      className={`w-10 h-5 rounded-full transition-all ${
                        notifications[key] ? 'bg-cyan-500' : 'bg-slate-700'
                      } ${updatingSettings[key] ? 'opacity-60 cursor-wait' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all ${
                          notifications[key] ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl col-span-full lg:col-span-2"
            >
              <div className="flex items-center space-x-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Privacy</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  emailNotifications: 'Email Notifications',
                  securityAlerts: 'Security Alerts',
                  aiRecommendations: 'AI Recommendations',
                  marketingEmails: 'Marketing Emails',
                  accountVisibility: 'Account Visibility',
                  anonymousAnalytics: 'Anonymous Analytics',
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-xs text-slate-300">{label}</span>
                    <button
                      onClick={() => handleToggleSetting('privacy', key)}
                      disabled={!!updatingSettings[key]}
                      className={`w-10 h-5 rounded-full transition-all ${
                        privacy[key] ? 'bg-cyan-500' : 'bg-slate-700'
                      } ${updatingSettings[key] ? 'opacity-60 cursor-wait' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all ${
                          privacy[key] ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
