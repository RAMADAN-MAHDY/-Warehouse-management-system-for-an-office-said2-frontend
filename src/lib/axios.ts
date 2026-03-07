import axios from 'axios';

// استخدام رابط نسبي في المتصفح لدفع الطلبات عبر Next.js Rewrites (Proxy)
// وفي السيرفر (Server-side rendering) نستخدم الرابط الكامل
// استخدام الرابط المباشر للسيرفر لضمان وصول الـ Headers والكوكيز بدون تعقيدات البروكسي
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://warehouse-management-system-for-an.vercel.app';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle specific error statuses
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 402) {
      // Payment Required - Subscription ended
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-error', { 
          detail: { type: 'expired', message: error.response.data?.message } 
        }));
        
        if (window.location.pathname !== '/subscription') {
          const errorMessage = error.response.data?.message || 'انتهت صلاحية اشتراكك، يرجى التجديد للمتابعة';
          const { toast } = await import('sonner');
          toast.error(errorMessage);
        }
      }
    } else if (error.response?.status === 403) {
      // Forbidden - Banned or unauthorized
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-error', { 
          detail: { type: 'banned', message: error.response.data?.message } 
        }));

        const errorMessage = error.response.data?.message || 'تم حظر حسابك أو لا تملك الصلاحية للوصول';
        const { toast } = await import('sonner');
        toast.error(errorMessage);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
