'use client';

import { Bot, Sparkles } from 'lucide-react';
import React from 'react';

type WelcomeScreenProps = {
  onSuggestionSelect: (text: string) => void;
};

const suggestions = [
  'اعرض حالة المخزون',
  'أكثر الأصناف مبيعًا',
  'هل يوجد نقص بالمخزون؟',
  'اعرض تقرير المبيعات',
];

export default function WelcomeScreen({ onSuggestionSelect }: WelcomeScreenProps) {
  return (
    <div className="flex h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-800 bg-slate-900/70 p-8 text-center shadow-[0_20px_80px_-40px_rgba(0,0,0,0.95)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-400">
          <Bot className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold text-slate-100">مرحبًا بك في مساعد المخزون</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
          اطرح سؤالًا عن المخزون أو المبيعات أو التقارير، وسأساعدك في الحصول على إجابة سريعة ومباشرة.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionSelect(suggestion)}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-emerald-500/40 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
            >
              <span>{suggestion}</span>
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
