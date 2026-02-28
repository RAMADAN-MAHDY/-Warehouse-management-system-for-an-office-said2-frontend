import axiosInstance from '@/lib/axios';
import { Item, SaleInvoice, Expense, Purchase, ProfitSummary, User } from '@/types';

export const authService = {
  login: async (credentials: any) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get('/api/auth/profile');
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
  create: async (sale: any) => {
    const response = await axiosInstance.post('/api/sales', sale);
    return response.data;
  },
  update: async (id: string, sale: any) => {
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
  create: async (purchase: any) => {
    const response = await axiosInstance.post('/api/purchases/adjust', purchase);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/purchases/${id}`);
    return response.data;
  }
};

export const expenseService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/expenses');
    return response.data;
  },
  create: async (expense: any) => {
    const response = await axiosInstance.post('/api/expenses', expense);
    return response.data;
  },
  update: async (id: string, expense: any) => {
    const response = await axiosInstance.put(`/api/expenses/${id}`, expense);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/expenses/${id}`);
    return response.data;
  }
};

export const excelService = {
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

export const profitService = {
  getSummary: async () => {
    const response = await axiosInstance.get('/api/profit');
    return response.data;
  }
};

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
