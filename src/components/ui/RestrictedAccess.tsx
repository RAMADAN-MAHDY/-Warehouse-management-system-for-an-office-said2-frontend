'use client';

import React from 'react';
import { ShieldAlert, LogOut, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';

import Modal from './Modal';

interface RestrictedAccessProps {
  type: 'expired' | 'banned' | 'required';
  message?: string;
}

export default function RestrictedAccess({ type, message }: RestrictedAccessProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'expired': return 'انتهت صلاحية الاشتراك';
      case 'banned': return 'تم إيقاف الحساب';
      case 'required': return 'الاشتراك مطلوب';
      default: return 'وصول مقيد';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'expired': return 'عذراً، لقد انتهت فترة اشتراكك في النظام. يرجى تجديد الاشتراك للمتابعة في استخدام الخدمات.';
      case 'banned': return 'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني للاستفسار.';
      case 'required': return 'يجب الحصول على اشتراك نشط لتتمكن من الوصول إلى هذه الصفحة.';
      default: return 'لا تملك صلاحية الوصول إلى هذه البيانات حالياً.';
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={() => {}} 
      showCloseButton={false}
      maxWidth="md"
      className="bg-gray-900 border-none backdrop-blur-none"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-2xl mb-6">
          <ShieldAlert className="text-red-500" size={48} />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">{getTitle()}</h1>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          {message || getDefaultMessage()}
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            variant="primary" 
            className="w-full h-12"
            onClick={() => router.push('/subscription')}
          >
            تجديد الاشتراك الآن
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full h-12 gap-2"
              onClick={handleLogout}
              icon={<LogOut size={18} />}
            >
              خروج
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-12 gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10"
              onClick={() => window.open('https://wa.me/201556299599', '_blank')}
              icon={<MessageCircle size={18} />}
            >
              تواصل معنا
            </Button>
          </div>
        </div>
        
        <p className="mt-8 text-xs text-gray-500">
          إذا كنت تعتقد أن هذا الخطأ ظهر عن طريق الخطأ، يرجى تحديث الصفحة أو التواصل مع الدعم.
        </p>
      </div>
    </Modal>
  );
}

