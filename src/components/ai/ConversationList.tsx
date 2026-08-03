'use client';

import React, { useEffect, useState } from 'react';
import { aiService } from '@/services/aiService';

type Conversation = {
  _id: string;
  title: string;
  summary?: string;
  lastActivityAt?: string;
  messageCount?: number;
};

// Component for displaying a list of AI conversations
export default function ConversationList({
  selectedId,
  onSelect,
  reloadTrigger,
}: {
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  reloadTrigger?: number;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.listConversations();
      if (res?.success) setConversations(res.data.conversations || []);
      else setError('فشل جلب المحادثات');
    } catch (err: any) {
      console.error('Failed to load conversations', err);
      const backendMessage = err?.response?.data?.error?.message;
      setError(backendMessage || err?.message || 'فشل جلب المحادثات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload when parent signals (e.g. after creating a new conversation)
  useEffect(() => {
    if (typeof reloadTrigger !== 'undefined') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger]);

  return (
    <div className="w-full lg:max-w-xs shrink-0 rounded-3xl border border-slate-700 bg-slate-950 p-4 shadow-sm max-h-[calc(100vh-7rem)] overflow-hidden lg:overflow-visible">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">المحادثات</h3>
          <p className="text-sm text-slate-400">{loading ? 'جاري التحميل...' : `${conversations.length} محادثة`}</p>
        </div>
        <button
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-500"
          onClick={() => onSelect(null)}
          title="محادثة جديدة"
        >
          محادثة جديدة
        </button>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-700 bg-red-950/70 p-4 text-sm text-red-200">
          <div>{error}</div>
          <div className="mt-3 text-right">
            <button className="text-xs text-blue-300 hover:text-white" onClick={() => load()}>
              إعادة المحاولة
            </button>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {conversations.length === 0 && (
            <li className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-400 text-center">
              لا توجد محادثات
            </li>
          )}

          {conversations.map((c) => (
            <li
              key={c._id}
              className={`rounded-3xl border px-4 py-3 transition cursor-pointer ${
                selectedId === String(c._id)
                  ? 'border-emerald-500 bg-emerald-600/10 text-white'
                  : 'border-transparent bg-slate-900/80 text-slate-200 hover:border-slate-600 hover:bg-slate-900'
              }`}
              onClick={() => onSelect(String(c._id))}
            >
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{c.title}</div>
                  <div className="text-[11px] text-slate-400">{c.messageCount || 0} رسالة</div>
                </div>
                <div className="text-[11px] text-slate-500 text-right whitespace-nowrap">
                  {c.lastActivityAt ? new Date(c.lastActivityAt).toLocaleString() : ''}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-3 text-xs text-slate-500">
        المحادثات محفوظة ومربوطة بحسابك.
      </div>
    </div>
  );
}
