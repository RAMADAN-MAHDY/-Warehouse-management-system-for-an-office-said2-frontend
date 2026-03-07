import axiosInstance from '@/lib/axios';
import { Item } from '@/types';

export const authService = {
  login: async (credentials: Record<string, string>) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData: Record<string, string>) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data;
  },
  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  }
};

export const itemService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/items');
    return response.data;
  },
  search: async (query: string) => {
    const response = await axiosInstance.get(`/api/items/search?search=${query}`);
    return response.data;
  },
  create: async (item: Partial<Item>) => {
    const response = await axiosInstance.post('/api/items', item);
    return response.data;
  },
  update: async (id: string, item: Partial<Item>) => {
    const response = await axiosInstance.put(`/api/items/${id}`, item);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/items/${id}`);
    return response.data;
  },
  exportExcel: async () => {
    const response = await axiosInstance.get('/api/items/export', {
      responseType: 'blob'
    });
    return response.data;
  },
  downloadExcel: async (id: string) => {
    const response = await axiosInstance.get(`/api/items/download/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export const saleService = {
  getAll: async (params?: { from?: string; to?: string }) => {
    const response = await axiosInstance.get('/api/sales', { params });
    return response.data;
  },
  create: async (sale: Record<string, unknown>) => {
    const response = await axiosInstance.post('/api/sales', sale);
    return response.data;
  },
  update: async (id: string, sale: Record<string, unknown>) => {
    const response = await axiosInstance.put(`/api/sales/${id}`, sale);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/sales/${id}`);
    return response.data;
  },
  bulkDelete: async (ids: string[]) => {
    const response = await axiosInstance.post('/api/sales/bulk-delete', { ids });
    return response.data;
  },
  exportExcel: async (params?: { from?: string; to?: string }) => {
    const response = await axiosInstance.get('/api/sales/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export const purchaseService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/purchases');
    return response.data;
  },
  create: async (purchase: Record<string, unknown>) => {
    const response = await axiosInstance.post('/api/purchases/adjust', purchase);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/purchases/${id}`);
    return response.data;
  }
};

// Service for expense-related operations
export const expenseService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/expenses');
    return response.data;
  },
  create: async (expense: Record<string, unknown>) => {
    const response = await axiosInstance.post('/api/expenses', expense);
    return response.data;
  },
  update: async (id: string, expense: Record<string, unknown>) => {
    const response = await axiosInstance.put(`/api/expenses/${id}`, expense);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/expenses/${id}`);
    return response.data;
  }
};

// Service for subscription-related operations
export const subscriptionService = {
  getStatus: async () => {
    const response = await axiosInstance.get('/api/subscription/status');
    return response.data;
  },
  submitPayment: async (paymentData: { amount: number; referenceNumber: string; planRequested: string }) => {
    const response = await axiosInstance.post('/api/subscription/pay', paymentData);
    return response.data;
  }
};

export const superAdminService = {
  getStats: async () => {
    const response = await axiosInstance.get('/api/superadmin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await axiosInstance.get('/api/superadmin/users');
    return response.data;
  },
  updateUser: async (userId: string, data: { isBanned?: boolean; role?: string; reason?: string }) => {
    const response = await axiosInstance.put(`/api/superadmin/users/${userId}`, data);
    return response.data;
  },
  updateUserSubscription: async (userId: string, data: { planType?: string; status?: string; endDate?: string; reason: string }) => {
    const response = await axiosInstance.put(`/api/superadmin/users/${userId}/subscription`, data);
    return response.data;
  },
  deleteUser: async (userId: string, data: { reason: string }) => {
    const response = await axiosInstance.delete(`/api/superadmin/users/${userId}`, { data });
    return response.data;
  },
  getPlans: async () => {
    const response = await axiosInstance.get('/api/superadmin/plans');
    return response.data;
  },
  createPlan: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.post('/api/superadmin/plans', data);
    return response.data;
  },
  updatePlan: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosInstance.put(`/api/superadmin/plans/${id}`, data);
    return response.data;
  },
  deletePlan: async (id: string) => {
    const response = await axiosInstance.delete(`/api/superadmin/plans/${id}`);
    return response.data;
  },
  getTransactions: async () => {
    const response = await axiosInstance.get('/api/superadmin/transactions');
    return response.data;
  },
  approveTransaction: async (id: string, data?: { notes?: string }) => {
    const response = await axiosInstance.post(`/api/superadmin/transactions/${id}/approve`, data);
    return response.data;
  },
  rejectTransaction: async (id: string, data: { reason: string }) => {
    const response = await axiosInstance.post(`/api/superadmin/transactions/${id}/reject`, data);
    return response.data;
  },
  getAuditLogs: async () => {
    const response = await axiosInstance.get('/api/superadmin/audit-logs');
    return response.data;
  },
  deleteAuditLogs: async (logIds: string[]) => {
    const response = await axiosInstance.post('/api/superadmin/audit-logs/bulk-delete', { logIds });
    return response.data;
  },
  exportUsers: async () => {
    const response = await axiosInstance.get('/api/superadmin/users/export', {
      responseType: 'blob'
    });
    return response.data;
  },
  exportTransactions: async () => {
    const response = await axiosInstance.get('/api/superadmin/transactions/export', {
      responseType: 'blob'
    });
    return response.data;
  }
};

// export const reportService = {for Excel file-related operations
export const excelService  = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/excel-files');
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/excel-files/${id}`);
    return response.data;
  },
  download: async (id: string) => {
    const response = await axiosInstance.get(`/api/excel-files/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Service for profit-related operations
export const profitService = {
  getSummary: async () => {
    const response = await axiosInstance.get('/api/profit');
    return response.data;
  }
};

// Service for report-related operations
export const reportService = {
  getSummary: async () => {
    const response = await axiosInstance.get('/api/reports/summary');
    return response.data;
  },
  getProfit: async (params?: { from?: string; to?: string }) => {
    const response = await axiosInstance.get('/api/reports/profit', { params });
    return response.data;
  }
};

// Service for notification-related operations
export const notificationService = {
  getNotifications: async () => {
    const response = await axiosInstance.get('/api/notifications');
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await axiosInstance.put(`/api/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await axiosInstance.put('/api/notifications/read-all');
    return response.data;
  }
};
