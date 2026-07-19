'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { navItems } from '@/lib/nav';

export default function DashboardHome() {
  return (
    <div className="min-h-screen sm:p-6 pt-9 bg-gray-900 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="المخزنجي" width={120} height={96} className="rounded-full object-contain md:w-[300] lg:hidden shadow-lg mt-[20]" />
            <div>
              <h1 className="text-3xl font-bold text-white mt-[-20]">المخزنجي</h1>
              <p className="text-gray-400 sm:text-2xl p-2 pt-3 text-sm">لوحة التحكم الرئيسية — روابط سريعة لكل أقسام النظام</p>
            </div>
          </div>
        </header>

        <main>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-6 gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              // don't render a link to the dashboard itself
              if (item.href === '/dashboard') return null;
              return (
                <Link key={item.href} href={item.href} className="group block p-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl hover:scale-105 transform transition-all">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-transparent flex items-center justify-center text-blue-400 group-hover:from-blue-600/30">
                      <Icon size={28} />
                    </div>
                    <div className="text-sm font-medium text-white text-center">{item.name}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
