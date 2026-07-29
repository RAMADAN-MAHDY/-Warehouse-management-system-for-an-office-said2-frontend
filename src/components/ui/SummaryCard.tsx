import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  /** اختياري: نص فرعي أسفل القيمة (مثل عدد العمليات) */
  subtitle?: string;
  /** اختياري: إظهار القيمة كعدد صحيح بدل عملة */
  isCount?: boolean;
  /** اختياري: نسبة التغيير مقارنة بالفترة السابقة (مثلاً 12.5 أو -3.2). null = لا يُعرض */
  change?: number | null;
  /** اختياري: تسمية فترة المقارنة (مثل "عن آخر 7 أيام") */
  changePeriodLabel?: string;
}

const colorMap: Record<string, string> = {
  blue:    'border-l-blue-500 bg-blue-500/5',
  green:   'border-l-green-500 bg-green-500/5',
  orange:  'border-l-orange-500 bg-orange-500/5',
  red:     'border-l-red-500 bg-red-500/5',
  emerald: 'border-l-emerald-500 bg-emerald-500/5',
  purple:  'border-l-purple-500 bg-purple-500/5',
  yellow:  'border-l-yellow-500 bg-yellow-500/5',
};

export function SummaryCard({
  title,
  value,
  icon,
  color,
  subtitle,
  isCount = false,
  change,
  changePeriodLabel,
}: SummaryCardProps) {
  const hasChange = change != null && isFinite(change);
  const isPositive = hasChange && change! > 0;
  const isNegative = hasChange && change! < 0;
  const isZero = hasChange && change === 0;

  return (
    <div className={`glass p-6 rounded-2xl border border-gray-700 border-l-4 ${colorMap[color] ?? ''} shadow-xl transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">
        {isCount ? value.toLocaleString('ar-EG') : formatCurrency(value)}
      </p>

      {/* ─── Change Indicator ─── */}
      {hasChange && (
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : isNegative
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-gray-500/15 text-gray-400'
            }`}
          >
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {isZero ? '0%' : `${change! > 0 ? '+' : ''}${change!.toFixed(1)}%`}
          </span>
          {changePeriodLabel && (
            <span className="text-[11px] text-gray-500">{changePeriodLabel}</span>
          )}
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export default SummaryCard;
