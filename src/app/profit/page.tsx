'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  Loader2,
  PieChart as PieChartIcon,
  BarChart3,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
  FileText,
  Clock,
  UserX,
  PackageCheck,
  ChevronLeft
} from 'lucide-react';
import { reportService } from '@/services/api';
import { ReportSummaryData } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ProfitPage() {
  const [summaryData, setSummaryData] = useState<ReportSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await reportService.getSummary();
      if (response.status && response.data) {
        setSummaryData(response.data);
      }
    } catch (error: any) {
      if (error.response?.status !== 402 && error.response?.status !== 403) {
        console.error('Failed to fetch report summary', error);
        toast.error('حدث خطأ أثناء جلب ملخص التقارير');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading || !summaryData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-gray-400">جاري تحميل ملخص التقارير...</p>
      </div>
    );
  }

  const { financials, inventory, topDebtorClient, recentSales } = summaryData;
  const totalReturns = financials.totalReturns ?? 0;
  const returnsCOGS = financials.returnsCOGS ?? 0;

  const barChartData = {
    labels: ['صافي COGS', 'صافي المبيعات', 'المرتجعات', 'المصروفات', 'صافي الربح'],
    datasets: [
      {
        label: 'المبالغ (ج.م)',
        data: [
          financials.totalCOGS,
          financials.totalSales,
          totalReturns,
          financials.totalExpenses,
          financials.netProfit
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)', // Blue
          'rgba(16, 185, 129, 0.6)', // Green
          'rgba(239, 68, 68, 0.6)',  // Red
          'rgba(245, 158, 11, 0.6)', // Orange
          'rgba(168, 85, 247, 0.6)', // Purple
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 14, family: 'var(--font-cairo)' },
        bodyFont: { size: 14, family: 'var(--font-cairo)' },
        rtl: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'var(--font-cairo)' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.8)', font: { family: 'var(--font-cairo)' } }
      }
    }
  };

  return (
    <div className="space-y-8 animate-in" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="text-green-500" />
          الأرباح واللوحة الماليّة المباشرة
        </h1>
        <p className="text-gray-400 mt-1">مؤشرات الأداء الرئيسية (KPIs) ونظرة شاملة على حالة المخزن والمالية</p>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Net Profit */}
        <SummaryCard 
          title="صافي الربح" 
          value={financials.netProfit} 
          isCurrency={true}
          subtitle={`معدل هامش الربح الإجمالي`}
          icon={financials.netProfit >= 0 ? <TrendingUp className="text-emerald-400" /> : <TrendingDown className="text-red-400" />}
          color={financials.netProfit >= 0 ? "emerald" : "red"}
        />

        {/* 2. Total Net Sales */}
        <SummaryCard 
          title="صافي المبيعات" 
          value={financials.totalSales} 
          isCurrency={true}
          subtitle={`عدد الفواتير: ${financials.salesCount || 0}`}
          icon={<DollarSign className="text-green-400" />}
          color="green"
        />

        {/* 3. Low Stock Items Count */}
        <SummaryCard 
          title="أصناف منخفضة المخزون" 
          value={inventory.lowStockItems?.length || 0} 
          isCurrency={false}
          subtitle={`إجمالي الأصناف: ${inventory.totalItems || 0}`}
          icon={<AlertTriangle className="text-amber-400" />}
          color="amber"
          badgeText={(inventory.lowStockItems?.length || 0) > 0 ? "تحذير إعادة الطلب" : "المخزون ممتاز"}
        />

        {/* 4. Unpaid Invoices */}
        <SummaryCard 
          title="فواتير غير مدفوعة" 
          value={financials.unpaidInvoicesCount || 0} 
          isCurrency={false}
          subtitle="فواتير مبيعات آجلة بالكامل"
          icon={<FileText className="text-red-400" />}
          color="red"
        />

        {/* 5. Partially Paid Invoices */}
        <SummaryCard 
          title="فواتير مدفوعة جزئياً" 
          value={financials.partiallyPaidCount || 0} 
          isCurrency={false}
          subtitle="تحتاج لمتابعة تحصيل المتبقي"
          icon={<Clock className="text-orange-400" />}
          color="orange"
        />

        {/* 6. Top Debtor Client */}
        <SummaryCard 
          title="أكبر عميل مديون" 
          value={topDebtorClient ? topDebtorClient.balance : 0} 
          isCurrency={true}
          subtitle={topDebtorClient ? `${topDebtorClient.name} (${topDebtorClient.code})` : 'لا يوجد مديونيات قائمة'}
          icon={<UserX className="text-purple-400" />}
          color="purple"
        />
      </div>

      {/* Additional breakdown cards: COGS, Returns, Expenses, Purchases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="صافي تكلفة البضاعة (COGS)" 
          value={financials.totalCOGS} 
          isCurrency={true}
          icon={<ShoppingCart className="text-blue-400" />}
          color="blue"
        />
        <SummaryCard 
          title="المبيعات قبل المرتجعات" 
          value={financials.grossSales} 
          isCurrency={true}
          icon={<DollarSign className="text-emerald-400" />}
          color="emerald"
        />
        <SummaryCard 
          title="إجمالي المرتجعات" 
          value={totalReturns} 
          isCurrency={true}
          icon={<RotateCcw className="text-red-400" />}
          color="red"
        />
        <SummaryCard 
          title="إجمالي المصروفات" 
          value={financials.totalExpenses} 
          isCurrency={true}
          icon={<Wallet className="text-orange-400" />}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-gray-700 shadow-2xl h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" />
              مقارنة ماليّة
            </h3>
          </div>
          <div className="h-[300px]">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-gray-700 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="text-purple-500" />
            توزيع المصروفات والربح
          </h3>
          <div className="h-[250px]">
            <Pie 
              data={{
                labels: ['صافي الربح', 'المصروفات', 'صافي COGS', 'صافي المبيعات', 'المرتجعات'],
                datasets: [{
                  data: [
                    Math.max(0, financials.netProfit),
                    financials.totalExpenses,
                    financials.totalCOGS,
                    financials.totalSales,
                    totalReturns
                  ],
                  backgroundColor: [
                    'rgba(168, 85, 247, 0.6)', 
                    'rgba(245, 158, 11, 0.6)', 
                    'rgba(59, 130, 246, 0.6)', 
                    'rgba(16, 185, 129, 0.6)', 
                    'rgba(239, 68, 68, 0.6)'
                  ],
                  borderColor: [
                    'rgba(168, 85, 247, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
                  ],
                  borderWidth: 1,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: 'white', font: { family: 'var(--font-cairo)' } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Widgets Grid: Low Stock Alert List & Recent Sales Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Items List */}
        <div className="glass p-6 rounded-3xl border border-gray-700 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" />
              تنبيهات المخزون المنخفض
            </h3>
            <Link href="/store" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              عرض المخزن بالكامل <ChevronLeft size={14} />
            </Link>
          </div>

          {inventory.lowStockItems && inventory.lowStockItems.length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {inventory.lowStockItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/60 border border-gray-700/60">
                  <div>
                    <div className="font-semibold text-white text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400">موديل: {item.modelNumber}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      متبقي {item.quantity} قطع
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
              <PackageCheck className="text-emerald-400" size={36} />
              <p className="text-sm font-medium">جميع الأصناف متوفرة بنسب أمينات كافية</p>
            </div>
          )}
        </div>

        {/* Recent Sales Activity Feed */}
        <div className="glass p-6 rounded-3xl border border-gray-700 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-blue-400" />
              آخر الفواتير الصادرة
            </h3>
            <Link href="/sales" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              جميع الفواتير <ChevronLeft size={14} />
            </Link>
          </div>

          {recentSales && recentSales.length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {recentSales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/60 border border-gray-700/60">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white text-sm">{sale.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>العميل: {sale.clientName || 'عميل عام'}</span>
                      <span>•</span>
                      <span>{sale.createdAt ? formatDate(sale.createdAt) : ''}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-emerald-400 text-sm">{formatCurrency(sale.total)}</div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      sale.paymentStatus === 'paid' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : sale.paymentStatus === 'partial'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {sale.paymentStatus === 'paid' ? 'مدفوعة' : sale.paymentStatus === 'partial' ? 'جزئية' : 'غير مدفوعة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              لا توجد فواتير مبيعات مسجلة مؤخراً
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  isCurrency = true, 
  subtitle,
  badgeText,
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  isCurrency?: boolean; 
  subtitle?: string;
  badgeText?: string;
  icon: React.ReactNode; 
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "border-l-blue-500 bg-blue-500/5",
    green: "border-l-green-500 bg-green-500/5",
    orange: "border-l-orange-500 bg-orange-500/5",
    red: "border-l-red-500 bg-red-500/5",
    emerald: "border-l-emerald-500 bg-emerald-500/5",
    amber: "border-l-amber-500 bg-amber-500/5",
    purple: "border-l-purple-500 bg-purple-500/5",
  };

  return (
    <div className={`glass p-6 rounded-2xl border border-gray-700 border-l-4 ${colors[color] || colors.blue} shadow-xl transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <div className="p-2 rounded-lg bg-gray-800/80">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">
        {isCurrency ? formatCurrency(value) : value.toLocaleString('ar-EG')}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      )}
      {badgeText && (
        <div className="mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300">
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}

