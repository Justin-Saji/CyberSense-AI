import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('cybersense_token', response.data.token);
      localStorage.setItem('cybersense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('cybersense_token', response.data.token);
      localStorage.setItem('cybersense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  async googleLogin(credential) {
    const response = await api.post('/auth/google', { credential });
    if (response.data?.token) {
      localStorage.setItem('cybersense_token', response.data.token);
      localStorage.setItem('cybersense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async fetchCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        localStorage.setItem('cybersense_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      this.logout();
      return null;
    }
  },

  logout() {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch (e) {
      // ignore network errors on logout
    }
    localStorage.removeItem('cybersense_token');
    localStorage.removeItem('cybersense_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('cybersense_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('cybersense_token');
  }
};

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/profile', data);
    if (response.data?.user) {
      localStorage.setItem('cybersense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async uploadAvatar(avatarUrl) {
    const response = await api.post('/profile/avatar', { avatar: avatarUrl });
    if (response.data?.user) {
      localStorage.setItem('cybersense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async removeAvatar() {
    const response = await api.delete('/profile/avatar');
    if (response.data?.user) {
      localStorage.setItem('cybersense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.post('/profile/password', passwordData);
    return response.data;
  },

  async deleteAccount(password) {
    const response = await api.delete('/profile/account', { data: { password } });
    return response.data;
  },

  async getActivity() {
    const response = await api.get('/profile/activity');
    return response.data;
  },

  async getSecurityScore() {
    const response = await api.get('/profile/security-score');
    return response.data;
  },

  async downloadUserData() {
    const response = await api.get('/profile/download');
    return response.data;
  }
};

export const scanService = {
  async scanSms(content) {
    const response = await api.post('/scan/sms', { content });
    return response.data;
  },

  async scanEmail(content) {
    const response = await api.post('/scan/email', { content });
    return response.data;
  },

  async scanUrl(content) {
    const response = await api.post('/scan/url', { content });
    return response.data;
  },
};

export const reportService = {
  async listReports() {
    const response = await api.get('/reports');
    return response.data;
  },

  async getReport(reportId) {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },
};
