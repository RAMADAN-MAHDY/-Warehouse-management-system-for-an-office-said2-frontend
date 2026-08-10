'use client';

import React, { useState } from 'react';
import { Check, Loader2, Mic, MicOff, Trash2, Volume2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { voiceService, type VoiceServiceError } from '@/services/voiceService';

type VoiceRecorderButtonProps = {
  onTranscribed: (text: string) => void;
  onError: (error: VoiceServiceError) => void;
  disabled?: boolean;
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function VoiceRecorderButton({
  onTranscribed,
  onError,
  disabled = false,
}: VoiceRecorderButtonProps) {
  const {
    isRecording,
    recordingTime,
    audioLevels,
    permissionError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleStart = async () => {
    if (disabled || isTranscribing) return;
    const success = await startRecording();
    if (!success && permissionError) {
      onError({ message: permissionError });
    }
  };

  const handleStopAndTranscribe = async () => {
    const audioBlob = await stopRecording();
    if (!audioBlob) {
      onError({ message: 'تعذر التنسيق أو التسجيل الصوتي فارغ' });
      return;
    }

    setIsTranscribing(true);
    try {
      const res = await voiceService.transcribeAudio(audioBlob, 'voice_input.webm');
      if (res.success && res.text) {
        // MUST NOT send automatically: pass transcribed text to input field for review
        onTranscribed(res.text);
      } else {
        onError({ message: 'لم يتم التعرف على أي نص من التسجيل' });
      }
    } catch (err: unknown) {
      console.error('Transcription error:', err);
      const serviceErr = err as VoiceServiceError;
      onError({
        message: serviceErr.message || 'فشل تحويل الصوت إلى نص',
        code: serviceErr.code,
        retryAfterSeconds: serviceErr.retryAfterSeconds,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCancel = () => {
    cancelRecording();
  };

  if (isTranscribing) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-2 text-xs font-medium text-emerald-300 backdrop-blur-md animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        <span>جاري تحويل الصوت إلى نص...</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2.5 rounded-full border border-red-500/40 bg-slate-900/95 px-3 py-1.5 shadow-[0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-md">
        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-red-950 hover:text-red-400"
          title="إلغاء التسجيل"
          aria-label="إلغاء التسجيل"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Live Pulse Indicator & Timer */}
        <div className="flex items-center gap-2 px-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-xs font-bold text-red-400">{formatDuration(recordingTime)}</span>
        </div>

        {/* Live Audio Visualizer Bars */}
        <div className="flex items-center gap-0.5 px-1.5 h-5">
          {audioLevels.map((level, idx) => (
            <span
              key={idx}
              className="w-1 rounded-full bg-emerald-400 transition-all duration-75"
              style={{
                height: `${Math.max(20, level * 100)}%`,
                opacity: Math.max(0.4, level),
              }}
            />
          ))}
        </div>

        {/* Confirm & Transcribe Button */}
        <button
          type="button"
          onClick={handleStopAndTranscribe}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-slate-950 transition hover:bg-emerald-400 shadow-md"
          title="إنهاء وتحويل إلى نص"
          aria-label="إنهاء وتحويل إلى نص"
        >
          <Check className="h-4 w-4 stroke-[3]" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={disabled}
      className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/90 text-slate-400 transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      title="تسجيل رسالة صوتية (STT)"
      aria-label="تسجيل رسالة صوتية"
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}
