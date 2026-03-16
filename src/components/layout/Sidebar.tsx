'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  TrendingUp, 
  Wallet, 
  FileSpreadsheet, 
  LogOut, 
  Menu, 
  X,
  ShoppingBag,
  CreditCard,
  Home,
  ShieldCheck,
  Users,
  CreditCard as PaymentIcon,
  ListRestart
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { authService } from '@/services/api';
import NotificationBell from '../ui/NotificationBell';

const navItems = [
  { name: 'الرئيسية', href: '/', icon: Home },
  { name: 'المخزون', href: '/store', icon: LayoutDashboard },
  { name: 'المبيعات', href: '/sales', icon: ShoppingCart },
  { name: 'المشتريات', href: '/purchases', icon: ShoppingBag },
  { name: 'الأرباح والتقارير', href: '/profit', icon: TrendingUp },
  { name: 'المصروفات', href: '/expenses', icon: Wallet },
  { name: 'ملفات الإكسل', href: '/excel-files', icon: FileSpreadsheet },
  { name: 'الاشتراك', href: '/subscription', icon: CreditCard },
];

const adminItems = [
  { name: 'إدارة النظام', href: '/admin/dashboard', icon: ShieldCheck },
  { name: 'المستخدمين', href: '/admin/users', icon: Users },
  { name: 'الاشتراكات', href: '/admin/plans', icon: PaymentIcon },
  { name: 'سجلات النظام', href: '/admin/audit', icon: ListRestart },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 rounded-lg text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-40 w-64 bg-gray-800 border-l border-gray-700 transition-transform duration-300 transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center mt-10 sm:mt-3 justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={40} 
                  height={40} 
                  className="rounded-lg shadow-lg"
                />
                <h1 className="text-xl font-bold text-blue-400">نظام الإدارة</h1>
              </Link>
              <div className="lg:hidden ml-8">
                {mounted && <NotificationBell />}
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-between mt-4 bg-gray-900/40 p-2 rounded-xl border border-gray-700/50">
              <div className="flex-1">
                {mounted && user && (
                  <p className="text-xs text-gray-400 font-medium truncate">
                    {user.companyName}
                  </p>
                )}
              </div>
              {mounted && <NotificationBell />}
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {mounted && user?.role === 'superadmin' && (
              <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-gray-700 mt-4">
                  إدارة النظام
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive 
                          ? "bg-purple-600 text-white" 
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
