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
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}

