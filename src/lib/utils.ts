import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

export function getErrorMessage(error: unknown, fallbackMessage: string = 'حدث خطأ غير متوقع'): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
          error?: string | { message?: string };
        };
      };
      message?: string;
    };

    const resData = err.response?.data;
    
    // 1. Check nested error object: response.data.error.message (e.g. AI Backend)
    if (resData?.error && typeof resData.error === 'object' && resData.error.message) {
      return resData.error.message;
    }
    // 2. Check response.data.message (e.g. Main Backend)
    if (resData?.message && typeof resData.message === 'string') {
      return resData.message;
    }
    // 3. Check if response.data.error is a string
    if (typeof resData?.error === 'string' && resData.error.trim()) {
      return resData.error;
    }
    // 4. Check error.message if it's not a generic Axios status code string
    if (err.message && typeof err.message === 'string' && !/^Request failed with status code/i.test(err.message)) {
      return err.message;
    }
  }

  if (error instanceof Error && !/^Request failed with status code/i.test(error.message)) {
    return error.message;
  }

  return fallbackMessage;
}

