'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserPlus, User, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('كلمتا المرور غير متطابقتين');
    }

    setLoading(true);
    try {
      const response = await authService.register({
        username: formData.username,
        password: formData.password,
        companyName: formData.companyName
      });
    //   console.log(response);

      if (response.status) {
        setSuccess(`تم إنشاء الحساب بنجاح! اسم الشركة: ${response.data.companyName}`);
        toast.success('تم إنشاء الحساب بنجاح');
        // Optional: auto login or redirect after delay
      } else {
        toast.error(response.message || 'فشل إنشاء الحساب');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="glass-card p-10 rounded-3xl text-center max-w-md animate-in">
          <div className="flex justify-center mb-6">
            <CheckCircle2 size={64} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">مبروك!</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">{success}</p>
          <Button variant="primary" className="w-full" onClick={() => router.push('/login')}>
            انتقل لتسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
            <p className="text-gray-400">ابدأ في إدارة مخزنك بذكاء وسهولة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">اسم الشركة</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <UserPlus size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pr-10 pl-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="أدخل اسم الشركة"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}   
                />
              </div>
            </div>
            {/* user name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pr-10 pl-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="اختر اسم مستخدم فريد"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                  required
                  className="block w-full pr-10 pl-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="أدخل كلمة مرور قوية"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pr-10 pl-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="أعد كتابة كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 text-lg mt-4"
              icon={!loading && <UserPlus size={20} />}
            >
              إنشاء الحساب
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                سجل دخولك من هنا
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
