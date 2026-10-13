import api from './axiosInstance';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.delete('/transactions/bulk', { data: { ids } }),
};

export const analyticsAPI = {
  getSummary: (params) => api.get('/analytics/summary', { params }),
  getMonthly: (params) => api.get('/analytics/monthly', { params }),
  getYearly: () => api.get('/analytics/yearly'),
  getCategories: (params) => api.get('/analytics/categories', { params }),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getTopTransactions: (params) => api.get('/analytics/top-transactions', { params }),
  getPaymentMethods: (params) => api.get('/analytics/payment-methods', { params }),
};

export const budgetsAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};
