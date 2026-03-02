'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/login' && pathname !== '/register') {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 w-full lg:mr-64 p-4 lg:p-8 animate-in overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
