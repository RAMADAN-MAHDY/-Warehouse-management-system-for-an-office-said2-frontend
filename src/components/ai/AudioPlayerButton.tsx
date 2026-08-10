'use client';

import React from 'react';
import { Loader2, Square, Volume2, VolumeX } from 'lucide-react';

type AudioPlayerButtonProps = {
  messageId: string;
  text: string;
  isPlaying: boolean;
  isLoading: boolean;
  onToggle: (messageId: string, text: string) => void;
};

export default function AudioPlayerButton({
  messageId,
  text,
  isPlaying,
  isLoading,
  onToggle,
}: AudioPlayerButtonProps) {
  const handleClick = () => {
    onToggle(messageId, text);
  };

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs font-medium text-emerald-400 backdrop-blur-sm"
        title="جاري تحضير الصوت..."
        aria-label="جاري تحضير الصوت"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-[11px]">تحضير الصوت...</span>
      </button>
    );
  }

  if (isPlaying) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-2 py-1 text-xs font-medium text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-sm transition hover:bg-emerald-900/80"
        title="إيقاف التشغيل الصوتي"
        aria-label="إيقاف التشغيل الصوتي"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <Square className="h-3 w-3 fill-emerald-300 text-emerald-300" />
        <span className="text-[11px]">إيقاف الصوت</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-800/50 px-2 py-1 text-xs font-medium text-slate-300 transition hover:border-emerald-500/40 hover:bg-slate-800 hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
      title="استماع للرسالة بصوت فصيح (TTS)"
      aria-label="استماع للرسالة بصوت فصيح"
    >
      <Volume2 className="h-3.5 w-3.5" />
      <span className="text-[11px]">استماع 🔊</span>
    </button>
  );
}
