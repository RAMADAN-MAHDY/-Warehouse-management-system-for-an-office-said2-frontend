'use client';

import { SendHorizonal, Sparkles } from 'lucide-react';
import React from 'react';
import VoiceRecorderButton from './VoiceRecorderButton';
import type { VoiceServiceError } from '@/services/voiceService';

type MessageInputProps = {
  value: string;
  loading: boolean;
  error?: string | null;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceError?: (error: VoiceServiceError) => void;
};

export default function MessageInput({
  value,
  loading,
  error,
  onChange,
  onSend,
  onVoiceError,
}: MessageInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const handleTranscribed = (text: string) => {
    // Fill text into input field for user review (NO automatic send)
    if (value.trim()) {
      onChange(`${value} ${text}`);
    } else {
      onChange(text);
    }
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/95 p-2.5 sm:p-4">
      {error && (
        <div className="mb-2 rounded-2xl border border-red-800/60 bg-red-950/50 px-3 py-2 text-xs sm:text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-3 shadow-xl transition focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30">
        {/* Row 1: Full Width Textarea */}
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب استفسارك هنا..."
          disabled={loading}
          rows={1}
          aria-label="اكتب رسالة"
          className="w-full resize-none border-none bg-transparent px-1 py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 max-h-36 min-h-[44px]"
        />

        {/* Row 2: Action Bar (Voice on Right, Send Pill on Left in RTL) */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
          <div className="flex items-center gap-2">
            <VoiceRecorderButton
              onTranscribed={handleTranscribed}
              onError={(err) => onVoiceError?.(err)}
              disabled={loading}
            />
            <span className="hidden sm:inline text-xs text-slate-500">
              {loading ? 'المساعد يكتب...' : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={loading || !value.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
            aria-label="إرسال الرسالة"
          >
            <span>إرسال</span>
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

