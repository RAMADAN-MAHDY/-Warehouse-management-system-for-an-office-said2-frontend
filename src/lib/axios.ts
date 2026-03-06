import axios from 'axios';
import Cookies from 'js-cookie';

// استخدام رابط نسبي في المتصفح لدعم Next.js Rewrites (Proxy)
// وفي السيرفر نستخدم الرابط الكامل
const API_URL = typeof window !== 'undefined' 
  ? '' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://management-system-said2.vercel.app');

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
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
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
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
