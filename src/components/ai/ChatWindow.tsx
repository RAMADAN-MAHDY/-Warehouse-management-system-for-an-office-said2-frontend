'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiService } from '@/services/aiService';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt?: string;
};

export default function ChatWindow({
  conversationId,
  onConversationCreated,
  onOpenConversations,
}: {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
  onOpenConversations?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentConversationId(conversationId || null);
    if (conversationId) fetchMessages(conversationId);
    else setMessages([]);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages(id: string) {
    try {
      const res = await aiService.getConversationMessages(id);
      if (res?.success) setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  }

  async function send() {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await aiService.sendMessage({ conversationId: currentConversationId || undefined, message: input });

      if (res?.success) {
        const newConvId = res.data.conversationId;
        if (!currentConversationId && newConvId) {
          setCurrentConversationId(newConvId);
          onConversationCreated?.(newConvId);
        }

        setMessages((m) => [
          ...m,
          { role: 'user', content: input, createdAt: new Date().toISOString() },
          { role: 'assistant', content: res.data.reply, createdAt: new Date().toISOString() },
        ]);

        setInput('');
      }
    } catch (err: unknown) {
      console.error('Send failed', err);
      setError(err instanceof Error ? err.message : 'فشل إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden rounded-3xl border border-gray-700 bg-slate-950 shadow-sm">
      <div className="border-b border-gray-800 bg-slate-900 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {currentConversationId ? 'محادثتك' : 'ابدأ محادثة جديدة'}
            </h2>
            <p className="text-sm text-slate-400">
              {currentConversationId
                ? 'استمر في الحوار أو ابدأ محادثة جديدة بالضغط على الزر.'
                : 'اكتب رسالة لبدء دردشة مع المساعد.'}
            </p>
          </div>
          {onOpenConversations && (
            <button
              type="button"
              onClick={onOpenConversations}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition hover:border-blue-500 hover:bg-slate-800 lg:hidden"
            >
              عرض المحادثات
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-6 text-center text-sm text-slate-400">
            لا توجد رسائل بعد. ابدأ بطرح سؤال أو طلب.
          </div>
        ) : (
          messages.map((m, i) => {
            const isAssistant = m.role === 'assistant';
            return (
              <div key={i} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                  isAssistant
                    ? 'bg-slate-800 text-slate-100 border border-slate-700'
                    : 'bg-blue-600 text-white border border-blue-500'
                }`}>
                  <div className="prose prose-invert text-slate-100 max-w-full break-words">
                    {m.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : (
                      <div>{m.content}</div>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 bg-slate-900 p-4">
        {error && (
          <div className="mb-3 rounded-2xl bg-red-900/80 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[90px] flex-1 resize-none rounded-3xl border border-gray-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="اكتب رسالتك هنا..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
          />
          <div className="flex flex-col gap-2 sm:w-48">
            <button
              onClick={send}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'جاري...' : 'إرسال'}
            </button>
            {loading && <div className="text-xs text-slate-400">المساعد يكتب ردّه...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
