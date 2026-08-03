'use client';

import { MessageSquareText, Plus, Sparkles } from 'lucide-react';
import React from 'react';

type Conversation = {
  _id: string;
  title: string;
  summary?: string;
  lastActivityAt?: string;
  messageCount?: number;
};

type ChatSidebarProps = {
  conversations: Conversation[];
  selectedId?: string | null;
  loading: boolean;
  error?: string | null;
  onSelect: (id: string | null) => void;
  onCreateNew: () => void;
  onRetry?: () => void;
};

function formatActivity(value?: string) {
  if (!value) return '';

  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function ChatSidebar({
  conversations,
  selectedId,
  loading,
  error,
  onSelect,
  onCreateNew,
  onRetry,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full flex-col rounded-[28px] border border-slate-800 bg-slate-950/95 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onCreateNew}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-500 hover:bg-emerald-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <Plus className="h-4 w-4" />
          <span>محادثة جديدة</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-semibold text-slate-100">المحادثات</p>
            <p className="text-xs text-slate-400">{loading ? 'جاري التحميل…' : `${conversations.length} محادثة`}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-400">
            <MessageSquareText className="h-4 w-4" />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-800/60 bg-red-950/40 p-3 text-sm text-red-200">
            <p>{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-4 text-center text-sm text-slate-400">
            لا توجد محادثات بعد.
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = selectedId === String(conversation._id);
              return (
                <li key={conversation._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(String(conversation._id))}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      isActive
                        ? 'border-emerald-600/40 bg-emerald-600/10 shadow-[0_10px_30px_-20px_rgba(16,185,129,0.6)]'
                        : 'border-transparent bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-100">{conversation.title}</div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {conversation.messageCount || 0} رسالة
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] text-slate-500">
                        {formatActivity(conversation.lastActivityAt)}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-800 px-3 py-3 text-xs text-slate-500 sm:px-4">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>المحادثات محفوظة وتظل متاحة في أي وقت.</span>
        </div>
      </div>
    </aside>
  );
}
