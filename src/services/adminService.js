import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with admin-specific headers
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin Authentication
export const adminAuthService = {
  login: async (email, password) => {
    const response = await adminApi.post('/api/admin/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await adminApi.post('/api/admin/logout');
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  },

  verify: async () => {
    const response = await adminApi.get('/api/admin/verify');
    return response.data;
  },

  getCurrentAdmin: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },
};

// Dashboard Statistics
export const dashboardService = {
  getStats: async () => {
    const response = await adminApi.get('/api/admin/dashboard/stats');
    return response.data;
  },

  getCharts: async () => {
    const response = await adminApi.get('/api/admin/dashboard/charts');
    return response.data;
  },
};

// User Management
export const userService = {
  getUsers: async (params = {}) => {
    const response = await adminApi.get('/api/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await adminApi.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await adminApi.put(`/api/admin/users/${userId}`, data);
    return response.data;
  },

  suspendUser: async (userId) => {
    const response = await adminApi.post(`/api/admin/users/${userId}/suspend`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await adminApi.post(`/api/admin/users/${userId}/activate`);
    return response.data;
  },

  resetPassword: async (userId, password) => {
    const response = await adminApi.post(`/api/admin/users/${userId}/reset-password`, { password });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await adminApi.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
};

// AI Module Management
export const aiModelService = {
  getModels: async () => {
    const response = await adminApi.get('/api/admin/ai-models');
    return response.data;
  },

  updateModel: async (modelId, data) => {
    const response = await adminApi.put(`/api/admin/ai-models/${modelId}`, data);
    return response.data;
  },

  toggleModel: async (modelId) => {
    const response = await adminApi.post(`/api/admin/ai-models/${modelId}/toggle`);
    return response.data;
  },
};

// Risk Management
export const riskService = {
  getRiskUsers: async (params = {}) => {
    const response = await adminApi.get('/api/admin/risk-users', { params });
    return response.data;
  },
};

// Report Management
export const reportService = {
  getReports: async (params = {}) => {
    const response = await adminApi.get('/api/admin/reports', { params });
    return response.data;
  },

  deleteReport: async (reportId) => {
    const response = await adminApi.delete(`/api/admin/reports/${reportId}`);
    return response.data;
  },
};

// Security Logs
export const securityLogService = {
  getLogs: async (params = {}) => {
    const response = await adminApi.get('/api/admin/security-logs', { params });
    return response.data;
  },

  createLog: async (data) => {
    const response = await adminApi.post('/api/admin/security-logs', data);
    return response.data;
  },
};

// Audit Logs
export const auditLogService = {
  getLogs: async (params = {}) => {
    const response = await adminApi.get('/api/admin/audit-logs', { params });
    return response.data;
  },
};

// Feedback Management
export const feedbackService = {
  getFeedback: async (params = {}) => {
    const response = await adminApi.get('/api/admin/feedback', { params });
    return response.data;
  },

  markAsRead: async (feedbackId) => {
    const response = await adminApi.post(`/api/admin/feedback/${feedbackId}/read`);
    return response.data;
  },

  archive: async (feedbackId) => {
    const response = await adminApi.post(`/api/admin/feedback/${feedbackId}/archive`);
    return response.data;
  },

  delete: async (feedbackId) => {
    const response = await adminApi.delete(`/api/admin/feedback/${feedbackId}`);
    return response.data;
  },
};

// System Settings
export const settingsService = {
  getSettings: async (params = {}) => {
    const response = await adminApi.get('/api/admin/settings', { params });
    return response.data;
  },

  createSetting: async (data) => {
    const response = await adminApi.post('/api/admin/settings', data);
    return response.data;
  },

  updateSetting: async (settingId, data) => {
    const response = await adminApi.put(`/api/admin/settings/${settingId}`, data);
    return response.data;
  },
};

// Database Management
export const databaseService = {
  getStatus: async () => {
    const response = await adminApi.get('/api/admin/database/status');
    return response.data;
  },

  cleanup: async (daysOld = 90) => {
    const response = await adminApi.post('/api/admin/database/cleanup', { days_old: daysOld });
    return response.data;
  },
};

// Notification Center
export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await adminApi.get('/api/admin/notifications', { params });
    return response.data;
  },

  createNotification: async (data) => {
    const response = await adminApi.post('/api/admin/notifications', data);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await adminApi.post(`/api/admin/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await adminApi.post('/api/admin/notifications/mark-all-read');
    return response.data;
  },

  delete: async (notificationId) => {
    const response = await adminApi.delete(`/api/admin/notifications/${notificationId}`);
    return response.data;
  },
};

export default adminApi;
