'use client';

import { Bot, Menu, X } from 'lucide-react';
import React from 'react';

type ChatHeaderProps = {
  title: string;
  subtitle: string;
  onBack?: () => void;
  onToggleSidebar?: () => void;
  mobileOpen?: boolean;
};

export default function ChatHeader({ title, subtitle, onBack, onToggleSidebar, mobileOpen }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="fixed left-2 top-2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/95 text-slate-200 shadow-lg shadow-slate-950/40 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 lg:hidden"
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 lg:hidden"
            aria-label="الرجوع"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-400">
          <Bot className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-100">{title}</h2>
          <p className="truncate text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
