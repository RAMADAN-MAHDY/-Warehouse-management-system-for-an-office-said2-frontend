'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt?: string;
};

type MessageBubbleProps = {
  message: Message;
};

function formatTime(value?: string) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[95%] rounded-2xl border px-3 py-2 shadow-[0_10px_30px_-20px_rgba(2,6,23,0.95)] transition ${
          isAssistant
            ? 'border-slate-700 bg-slate-800 text-slate-100'
            : 'border-emerald-600/30 bg-emerald-600 text-white'
        }`}
      >
        <div className={`ai-markdown max-w-none break-words text-sm ${isAssistant ? 'text-slate-100' : 'text-white'}`}>
          {isAssistant ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap leading-7 text-white">{message.content}</div>
          )}
        </div>
        {message.createdAt && (
          <div className={`mt-3 text-[10px] ${isAssistant ? 'text-slate-400' : 'text-emerald-100/80'}`}>
            {formatTime(message.createdAt)}
          </div>
        )}
      </div>
    </div>
  );
}
