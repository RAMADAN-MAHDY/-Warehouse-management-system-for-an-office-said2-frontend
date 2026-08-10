'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, X } from 'lucide-react';
import type { VoiceServiceError } from '@/services/voiceService';

type VoiceRateLimitBannerProps = {
  error: VoiceServiceError;
  onClose: () => void;
};

export default function VoiceRateLimitBanner({ error, onClose }: VoiceRateLimitBannerProps) {
  const [countdown, setCountdown] = useState<number | null>(
    typeof error.retryAfterSeconds === 'number' && error.retryAfterSeconds > 0
      ? error.retryAfterSeconds
      : null
  );

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const isRateLimit =
    error.code?.startsWith('RATE_LIMIT') ||
    error.code === 'PROVIDER_RATE_LIMIT' ||
    Boolean(error.retryAfterSeconds);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          {isRateLimit ? <Clock className="h-5 w-5 animate-pulse" /> : <AlertCircle className="h-5 w-5" />}
        </div>

        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-amber-200">
            {isRateLimit ? 'تم التوصل للحد المسموح للطلبات' : 'تنبيه الخدمة الصوتية'}
          </h4>
          <p className="mt-1 text-slate-300 leading-relaxed">{error.message}</p>

          {countdown !== null && countdown > 0 && (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 border border-amber-500/20">
              <Clock className="h-3.5 w-3.5" />
              <span>يمكنك إعادة المحاولة خلال: <strong className="font-bold text-amber-200">{countdown} ثانية</strong></span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="إغلاق التنبيه"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
