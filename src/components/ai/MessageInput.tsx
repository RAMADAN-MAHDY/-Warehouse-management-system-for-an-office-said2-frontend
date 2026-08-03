'use client';

import { SendHorizonal, Sparkles } from 'lucide-react';
import React from 'react';

type MessageInputProps = {
  value: string;
  loading: boolean;
  error?: string | null;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function MessageInput({ value, loading, error, onChange, onSend }: MessageInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900/95 p-3 sm:p-4">
      {error && (
        <div className="mb-3 rounded-2xl border border-red-800/60 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-[28px] border border-slate-800 bg-slate-950/80 p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-start gap-2">
          <div className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            disabled={loading}
            rows={1}
            aria-label="اكتب رسالة"
            className="max-h-40 min-h-[56px] flex-1 resize-none overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={loading || !value.trim()}
            className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-slate-950 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            aria-label="إرسال الرسالة"
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span>Enter لإرسال · Shift + Enter لسطر جديد</span>
          <span>{loading ? 'جارٍ التحضير...' : 'جاهز'}</span>
        </div>
      </div>
    </div>
  );
}
