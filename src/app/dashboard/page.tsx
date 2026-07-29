'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  Loader2,
  BarChart3,
  CalendarDays,
  ArrowUpRight,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { navItems } from '@/lib/nav';
import { reportService } from '@/services/api';
import { ReportSummaryData, DailyDataPoint } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { SummaryCard } from '@/components/ui/SummaryCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ─── حساب نسبة التغيير ─── */
function pctChange(current: number, previous: number): number | null {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return null; // لا يوجد أساس للمقارنة
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function DashboardHome() {
  const [summary, setSummary] = useState<ReportSummaryData | null>(null);
  const [allDailyData, setAllDailyData] = useState<DailyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(7);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // نجيب ضعف المدة عشان نقارن الفترة الحالية بالسابقة
        const [summaryRes, dailyRes] = await Promise.all([
          reportService.getSummary(),
          reportService.getDaily(chartDays * 2),
        ]);
        if (summaryRes.status) setSummary(summaryRes.data);
        if (dailyRes.status) setAllDailyData(dailyRes.data);
      } catch (error: any) {
        if (error.response?.status !== 402 && error.response?.status !== 403) {
          console.error('Dashboard fetch error', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [chartDays]);

  /* ──── تقسيم الفترات ──── */
  const currentPeriod = allDailyData.slice(-chartDays);           // آخر N يوم
  const previousPeriod = allDailyData.slice(0, chartDays);        // الـ N يوم قبلهم

  const sum = (arr: DailyDataPoint[], key: keyof DailyDataPoint) =>
    arr.reduce((s, d) => s + (d[key] as number), 0);

  const curSales  = sum(currentPeriod, 'sales');
  const prevSales = sum(previousPeriod, 'sales');
  const curProfit = sum(currentPeriod, 'profit');
  const prevProfit = sum(previousPeriod, 'profit');
  const curCount  = sum(currentPeriod, 'count');
  const prevCount = sum(previousPeriod, 'count');

  const salesChange  = pctChange(curSales, prevSales);
  const profitChange = pctChange(curProfit, prevProfit);
  const countChange  = pctChange(curCount, prevCount);

  const periodLabel = `عن الـ ${chartDays} يوم السابقين`;

  /* ──── أرقام اليوم الأخير (أمس) ──── */
  const lastDay = currentPeriod.length > 0 ? currentPeriod[currentPeriod.length - 1] : null;
  const lastDaySalesText = lastDay ? `أمس: ${formatCurrency(lastDay.sales)}` : '';
  const lastDayProfitText = lastDay ? `أمس: ${formatCurrency(lastDay.profit)}` : '';
  const lastDayCountText = lastDay ? `أمس: ${lastDay.count} فاتورة` : '';

  /* ──── Line Chart ──── */
  const lineChartData = {
    labels: currentPeriod.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'المبيعات',
        data: currentPeriod.map((d) => d.sales),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2.5,
      },
      {
        label: 'الربح',
        data: currentPeriod.map((d) => d.profit),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2.5,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: 'rgba(255,255,255,0.8)',
          font: { family: 'var(--font-cairo)', size: 13 },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 14,
        titleFont: { size: 13, family: 'var(--font-cairo)' },
        bodyFont: { size: 13, family: 'var(--font-cairo)' },
        rtl: true,
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: 'rgba(255,255,255,0.45)',
          font: { family: 'var(--font-cairo)' },
          callback: (v: any) => {
            if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
            return v;
          },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: 'rgba(255,255,255,0.6)',
          font: { family: 'var(--font-cairo)', size: 11 },
        },
      },
    },
  };

  /* ──── Loading state ──── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={44} />
        <p className="text-gray-400 text-lg">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  const fin = summary?.financials;
  const inv = summary?.inventory;

  return (
    <div className="min-h-screen sm:p-6 pt-9 bg-gray-900 text-right space-y-8 animate-in" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ══════ Header ══════ */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="المخزنجي"
              width={120}
              height={96}
              className="rounded-full object-contain md:w-[300] lg:hidden shadow-lg mt-[20]"
            />
            <div>
              <h1 className="text-3xl font-bold text-white mt-[-20]">المخزنجي</h1>
              <p className="text-gray-400 sm:text-2xl p-2 pt-3 text-sm">
                لوحة التحكم الرئيسية
                {summary?.companyName && (
                  <span className="text-blue-400 mr-2">— {summary.companyName}</span>
                )}
              </p>
            </div>
          </div>
        </header>

        {/* ══════ Summary Cards ══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="صافي المبيعات"
            value={curSales}
            icon={<DollarSign className="text-blue-400" />}
            color="blue"
            change={salesChange}
            changePeriodLabel={periodLabel}
            subtitle={lastDaySalesText ? `إجمالي ${chartDays} يوم (${lastDaySalesText})` : `إجمالي آخر ${chartDays} يوم`}
          />
          <SummaryCard
            title="صافي الربح"
            value={curProfit}
            icon={curProfit >= 0 ? <TrendingUp className="text-emerald-400" /> : <TrendingDown className="text-red-400" />}
            color={curProfit >= 0 ? 'emerald' : 'red'}
            change={profitChange}
            changePeriodLabel={periodLabel}
            subtitle={lastDayProfitText ? `إجمالي ${chartDays} يوم (${lastDayProfitText})` : `إجمالي آخر ${chartDays} يوم`}
          />
          <SummaryCard
            title="عدد الفواتير"
            value={curCount}
            icon={<ShoppingCart className="text-purple-400" />}
            color="purple"
            isCount
            change={countChange}
            changePeriodLabel={periodLabel}
            subtitle={lastDayCountText ? `إجمالي ${chartDays} يوم (${lastDayCountText})` : `إجمالي آخر ${chartDays} يوم`}
          />
          <SummaryCard
            title="منتجات منخفضة المخزون"
            value={inv?.lowStockItems?.length ?? 0}
            icon={<Package className="text-orange-400" />}
            color="orange"
            isCount
            subtitle={`من أصل ${inv?.totalItems ?? 0} منتج`}
          />
        </div>

        {/* ══════ Chart + Alerts Row ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── Line Chart ─── */}
          <div className="lg:col-span-2 glass p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-blue-500" />
                اتجاه المبيعات والأرباح
              </h3>
              <div className="flex gap-2">
                {[7, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setChartDays(d)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      chartDays === d
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <CalendarDays size={14} className="inline ml-1 -mt-0.5" />
                    {d} يوم
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px]">
              {currentPeriod.length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  لا توجد بيانات لهذه الفترة
                </div>
              )}
            </div>
          </div>

          {/* ─── Alerts Panel ─── */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-gray-700 shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" />
              تنبيهات سريعة
            </h3>

            {/* فواتير غير مدفوعة / مدفوعة جزئياً */}
            {fin && (fin.unpaidInvoicesCount ?? 0) + (fin.partiallyPaidCount ?? 0) > 0 && (
              <AlertRow
                icon={<CreditCard size={18} className="text-red-400" />}
                label="فواتير معلّقة"
                value={`${(fin.unpaidInvoicesCount ?? 0) + (fin.partiallyPaidCount ?? 0)}`}
                sublabel={`${fin.unpaidInvoicesCount ?? 0} غير مدفوعة · ${fin.partiallyPaidCount ?? 0} جزئية`}
                accentColor="red"
                href="/sales"
              />
            )}

            {/* أكبر عميل مدين */}
            {summary?.topDebtorClient && (
              <AlertRow
                icon={<Users size={18} className="text-orange-400" />}
                label="أكبر مدين"
                value={summary.topDebtorClient.name}
                sublabel={`رصيد: ${formatCurrency(summary.topDebtorClient.balance)}`}
                accentColor="orange"
                href={`/clients`}
              />
            )}

            {/* مخزون منخفض — أول 3 منتجات */}
            {inv && inv.lowStockItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-400">
                  <Package size={16} />
                  مخزون منخفض ({inv.lowStockItems.length})
                </div>
                {inv.lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-2.5 border border-gray-700/50"
                  >
                    <span className="text-gray-300 text-sm truncate max-w-[60%]">
                      {item.name || item.modelNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      item.quantity === 0
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {item.quantity === 0 ? 'نفذ' : `${item.quantity} فقط`}
                    </span>
                  </div>
                ))}
                {inv.lowStockItems.length > 3 && (
                  <Link href="/store" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 pr-1">
                    عرض الكل ({inv.lowStockItems.length})
                    <ArrowUpRight size={12} />
                  </Link>
                )}
              </div>
            )}

            {/* حالة لا تنبيهات */}
            {fin &&
              (fin.unpaidInvoicesCount ?? 0) + (fin.partiallyPaidCount ?? 0) === 0 &&
              !summary?.topDebtorClient &&
              inv?.lowStockItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <TrendingUp size={36} className="text-emerald-500/40 mb-2" />
                  <p className="text-sm">كل شيء تمام! 🎉</p>
                </div>
              )}
          </div>
        </div>

        {/* ══════ Quick Navigation Grid ══════ */}
        {/* <div>
          <h2 className="text-xl font-bold text-white mb-4">روابط سريعة</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-6 gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.href === '/dashboard') return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block p-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl hover:scale-105 transform transition-all"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-transparent flex items-center justify-center text-blue-400 group-hover:from-blue-600/30">
                      <Icon size={28} />
                    </div>
                    <div className="text-sm font-medium text-white text-center">
                      {item.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
}

/* ─── Alert Row (تنبيه واحد) ─── */
function AlertRow({
  icon,
  label,
  value,
  sublabel,
  accentColor,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  accentColor: string;
  href?: string;
}) {
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    // @ts-ignore — dynamic wrapper
    <Wrapper
      {...wrapperProps}
      className={`flex items-start gap-3 bg-gray-800/40 rounded-xl px-4 py-3 border border-gray-700/50 transition-colors ${
        href ? 'hover:bg-gray-800/70 cursor-pointer' : ''
      }`}
    >
      <div className={`mt-0.5 p-1.5 rounded-lg bg-${accentColor}-500/10`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white font-bold text-base truncate">{value}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {href && <ArrowUpRight size={16} className="text-gray-600 mt-1 shrink-0" />}
    </Wrapper>
  );
}
