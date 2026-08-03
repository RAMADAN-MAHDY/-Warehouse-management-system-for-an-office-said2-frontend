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
  onBack,
}: {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
  onBack?: () => void;
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
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-sm">
      <div className="border-b border-slate-700 bg-slate-950 px-4 py-4 shadow-sm shadow-slate-900/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800 lg:hidden"
              >
                ←
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">دردشة المخزون</h2>
              <p className="text-sm text-slate-400">
                {currentConversationId
                  ? 'اسأل عن حالة المخزون، الطلبات، أو التقارير.'
                  : 'ابدأ محادثة جديدة وأحصل على المساعدة فوراً.'}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
            مصمم ليكون مألوف وسهل الاستخدام
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-950">
        {messages.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-700 bg-slate-900/80 p-6 text-center text-sm text-slate-400">
            لا توجد رسائل بعد. ابدأ بطرح سؤال أو طلب.
          </div>
        ) : (
          messages.map((m, i) => {
            const isAssistant = m.role === 'assistant';
            return (
              <div key={i} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-[28px] px-4 py-3 text-sm shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] ${
                  isAssistant
                    ? 'bg-slate-800 text-slate-100 border border-slate-700'
                    : 'bg-slate-100 text-slate-950 border border-slate-200'
                }`}>
                  <div className="prose prose-invert text-slate-100 max-w-full break-words">
                    {m.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : (
                      <div>{m.content}</div>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900/95 p-4">
        {error && (
          <div className="mb-3 rounded-2xl bg-red-900/80 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[90px] flex-1 resize-none rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="inline-flex items-center justify-center rounded-[24px] bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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
