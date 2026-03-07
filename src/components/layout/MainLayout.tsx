'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { subscriptionService } from '@/services/api';
import RestrictedAccess from '../ui/RestrictedAccess';


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  const [subscription, setSubscription] = useState<any>(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionType, setRestrictionType] = useState<'expired' | 'banned' | 'required'>('required');


  const checkSubscription = async () => {
    try {
      const response = await subscriptionService.getStatus();
      if (response.status) {
        setSubscription(response.data);
        if (response.data.status !== 'active') {
          setIsRestricted(true);
          setRestrictionType(response.data.status === 'expired' ? 'expired' : 'banned');
        } else {
          setIsRestricted(false);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 402) {
        setIsRestricted(true);
        setRestrictionType('expired');
      } else if (error.response?.status === 403) {
        setIsRestricted(true);
        setRestrictionType('banned');
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/' || 
                     pathname === '/privacy-policy' || pathname === '/terms-of-use' || pathname === '/contact-us';
      
      const isSubscriptionPage = pathname === '/subscription';

      if (!isAuthenticated && !isAuthPage) {
        router.push('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      } else if (isAuthenticated && !isAuthPage && !isSubscriptionPage) {
        // التحقق من حالة الاشتراك للصفحات المحمية (غير صفحة الاشتراك نفسها)
        checkSubscription();
      }
    }
  }, [isAuthenticated, loading, router, pathname]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/' || 
                     pathname === '/privacy-policy' || pathname === '/terms-of-use' || pathname === '/contact-us';


  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 relative">
          {children}
      </div>
    );
  }

  const isSubscriptionPage = pathname === '/subscription';

  if (isRestricted && !isSubscriptionPage) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
          <RestrictedAccess type={restrictionType} />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden relative">
      <Sidebar />
      <main className="flex-1 w-full lg:mr-64 p-4 lg:p-8 animate-in overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
