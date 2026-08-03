'use client';

import React, { useEffect, useRef, useState } from 'react';
import { aiService } from '@/services/aiService';
import ChatHeader from './ChatHeader';
import MessageBubble, { type Message } from './MessageBubble';
import MessageInput from './MessageInput';
import WelcomeScreen from './WelcomeScreen';

export default function ChatWindow({
  conversationId,
  onConversationCreated,
  onBack,
  isSidebarOpen = false,
}: {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
  onBack?: () => void;
  isSidebarOpen?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentConversationId(conversationId || null);
    if (conversationId) {
      void fetchMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  async function fetchMessages(id: string) {
    try {
      const res = await aiService.getConversationMessages(id);
      if (res?.success) {
        setMessages(res.data.messages || []);
      }
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

        setMessages((previous) => [
          ...previous,
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

  const chatTitle = currentConversationId ? 'دردشة المخزون' : 'محادثة جديدة';
  const chatSubtitle = currentConversationId
    ? 'اسأل عن حالة المخزون، الطلبات، أو التقارير.'
    : 'ابدأ محادثة جديدة واحصل على المساعدة فوراً.';

  return (
    <div className="flex h-full max-h-[calc(100vh-6rem)] min-h-0 flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.95)]">
      <ChatHeader
        title={chatTitle}
        subtitle={chatSubtitle}
        onToggleSidebar={onBack}
        mobileOpen={isSidebarOpen}
      />

      <div className="flex-1 overflow-y-auto bg-slate-950 px-0 py-0 sm:px-0 sm:py-6 lg:px-6 ml-7">
        {messages.length === 0 && !loading ? (
          <WelcomeScreen onSuggestionSelect={(value) => setInput(value)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            {messages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} message={message} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-slate-700/80 bg-slate-800/90 px-4 py-3 shadow-[0_10px_30px_-20px_rgba(2,6,23,0.95)]">
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.2s]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.1s]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400" />
                    </div>
                    <span className="font-medium">المساعد يكتب ردّه...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput
        value={input}
        loading={loading}
        error={error}
        onChange={setInput}
        onSend={send}
      />
    </div>
  );
}
