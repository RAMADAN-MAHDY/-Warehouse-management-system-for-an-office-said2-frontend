'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { authService } from '@/services/api';
import { RootState } from '@/store';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      return toast.error('يرجى إدخال اسم المستخدم وكلمة المرور');
    }

    dispatch(loginStart());
    try {
      const response = await authService.login({ username, password });
      if (response.status) {
        dispatch(loginSuccess({ 
          user: response.data.user,
          token: response.data.token
        }));
        toast.success('تم تسجيل الدخول بنجاح');
        router.push('/dashboard');
      } else {
        dispatch(loginFailure(response.message || 'بيانات الدخول غير صحيحة'));
        toast.error(response.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      dispatch(loginFailure(message));
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={120} 
                height={120} 
                className="rounded-2xl shadow-2xl animate-fade-in"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">تسجيل الدخول</h1>
            <p className="text-gray-400">أهلاً بك مجدداً في نظام إدارة المخازن</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <LogIn className="ml-2" size={20} />
                  <span>دخول</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                أنشئ حساباً جديداً
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
