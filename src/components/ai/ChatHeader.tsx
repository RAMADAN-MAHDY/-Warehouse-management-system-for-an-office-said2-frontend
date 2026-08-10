'use client';

import { Bot, History, Plus, X } from 'lucide-react';
import React from 'react';

type ChatHeaderProps = {
  title: string;
  subtitle: string;
  onBack?: () => void;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  mobileOpen?: boolean;
};

export default function ChatHeader({
  title,
  subtitle,
  onBack,
  onToggleSidebar,
  onNewChat,
  mobileOpen,
}: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/95 px-3 py-2.5 sm:px-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        {/* Right side in RTL: Title & Bot Icon (Leaves top-right clear for main app menu) */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm sm:text-base font-bold text-slate-100">{title}</h2>
            <p className="truncate text-xs text-slate-400 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Left side in RTL: Action Buttons (History & New Chat) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 sm:px-3 text-xs font-semibold text-slate-300 shadow-sm transition hover:border-emerald-500/40 hover:bg-slate-800 hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 lg:hidden"
              title="سجل المحادثات"
              aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح قائمة المحادثات'}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <History className="h-3.5 w-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">السجل</span>
            </button>
          )}

          {onBack && !onToggleSidebar && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 lg:hidden"
              aria-label="الرجوع"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-2.5 sm:px-3 text-xs font-semibold text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-600/20 active:scale-95 shadow-sm"
              title="بدء محادثة جديدة"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>جديدة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
