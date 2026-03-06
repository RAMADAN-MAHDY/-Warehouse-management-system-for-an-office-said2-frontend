'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  Plus, 
  Trash2, 
  Loader2,
  PieChart as PieChartIcon,
  BarChart3,
  ShoppingCart
} from 'lucide-react';
import { profitService, purchaseService } from '@/services/api';
import { ProfitSummary } from '@/types';
import { toast } from 'sonner';
// import { Button } from '@/components/ui/Button';
// import Link from 'next/link';
// import { 
//   Table, 
//   TableHeader, 
//   TableBody, 
//   TableRow, 
//   TableHead, 
//   TableCell 
// } from '@/components/ui/Table';
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
  const [summary, setSummary] = useState<ProfitSummary | null>(null);
  const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formLoading, setFormLoading] = useState(false);
//   const [purchaseData, setPurchaseData] = useState({
//     description: '',
//     amount: 0,
//     type: 'purchase' as 'purchase' | 'adjustment'
//   });

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await profitService.getSummary();
      if (response.status) {
        setSummary(response.data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب ملخص الأرباح');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

//   const handleAddPurchase = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormLoading(true);
//     try {
//       const response = await purchaseService.create({
//         reason: purchaseData.description,
//         amount: purchaseData.amount
//       });
//       if (response.status) {
//         toast.success('تمت إضافة القيد بنجاح');
//         setIsModalOpen(false);
//         setPurchaseData({ description: '', amount: 0, type: 'purchase' });
//         fetchSummary();
//       }
//     } catch (error) {
//       toast.error('فشلت عملية الإضافة');
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleDeletePurchase = async (id: string) => {
//     if (!confirm('هل أنت متأكد من حذف هذا القيد؟')) return;
//     try {
//       const response = await purchaseService.delete(id);
//       if (response.status) {
//         toast.success('تم الحذف بنجاح');
//         fetchSummary();
//       }
//     } catch (error) {
//       toast.error('فشل الحذف');
//     }
//   };

  const barChartData = {
    labels: ['تكلفة البضاعة (COGS)', 'إجمالي المبيعات', 'إجمالي المصروفات', 'صافي الربح'],
    datasets: [
      {
        label: 'المبالغ (ج.م)',
        data: summary ? [
          summary.totalCOGS,
          summary.totalSales,
          summary.totalExpenses,
          summary.netProfit
        ] : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)', // Blue
          'rgba(16, 185, 129, 0.6)', // Green
          'rgba(245, 158, 11, 0.6)', // Orange
          'rgba(239, 68, 68, 0.6)',  // Red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
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
      legend: {
        display: false,
      },
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

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-gray-400">جاري تحميل ملخص الأرباح...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="text-green-500" />
          الأرباح والتقارير المالية
        </h1>
        <p className="text-gray-400 mt-1">نظرة شاملة على أداء مخزنك المالي</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="تكلفة البضاعة المباعة" 
          value={summary.totalCOGS} 
          icon={<ShoppingCart className="text-blue-400" />}
          color="blue"
        />
        <SummaryCard 
          title="إجمالي المبيعات" 
          value={summary.totalSales} 
          icon={<TrendingUp className="text-green-400" />}
          color="green"
        />
        <SummaryCard 
          title="إجمالي المصروفات" 
          value={summary.totalExpenses} 
          icon={<Wallet className="text-orange-400" />}
          color="orange"
        />
        <SummaryCard 
          title="صافي الربح" 
          value={summary.netProfit} 
          icon={summary.netProfit >= 0 ? <TrendingUp className="text-emerald-400" /> : <TrendingDown className="text-red-400" />}
          color={summary.netProfit >= 0 ? "emerald" : "red"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-gray-700 shadow-2xl h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" />
              مقارنة مالية
            </h3>
          </div>
          <div className="h-[300px]">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-gray-700 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="text-purple-500" />
            نسبة المصروفات للربح
          </h3>
          <div className="h-[250px]">
            <Pie 
              data={{
                labels: ['صافي الربح', 'المصروفات' , 'تكلفة البضاعة المباعة' , 'إجمالي المبيعات'],
                datasets: [{
                  data: [Math.max(0, summary.netProfit), summary.totalExpenses, summary.totalCOGS, summary.totalSales],
                  backgroundColor: ['rgba(245, 0, 19, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(59, 130, 246, 0.6)', 'rgba(19, 130, 26, 0.6)'],
                  borderColor: ['rgba(245, 0, 19, 1)', 'rgba(245, 158, 11, 1)', 'rgba(59, 130, 246, 1)', 'rgba(19, 130, 26, 1)'],
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

      {/* المشتريات الأخيرة */}
      {/* 
       <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">آخر المشتريات</h2>
          <div className="flex gap-2">
            <Link href="/purchases">
              <Button variant="outline" size="sm">عرض الكل</Button>
            </Link>
             <Button variant="primary" size="sm" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
              إضافة سريعة
            </Button> 
          </div>
        </div>

        <Table data={(summary.purchases || []).slice(0, 5)}>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(summary.purchases || []).slice(0, 5).map((p) => (
              <TableRow key={p._id}>
                <TableCell>{formatDate(p.date || p.createdAt || '')}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    p.type === 'adjustment' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {p.type === 'adjustment' ? 'تعديل' : 'شراء'}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-green-400">{formatCurrency(p.amount)}</TableCell>
                <TableCell className="text-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeletePurchase(p._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      
      */}
      {/* <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">آخر المصروفات</h2>
        
          <div className="text-right text-white">
            <p className="text-lg font-bold">
              مجموع المصروفات: {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
          <Link href="/expenses">
            <Button variant="outline" size="sm">عرض الكل</Button>
          </Link>
        </div>

        <Table data={(summary.expenses || []).slice(0, 5)}>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(summary.expenses || []).slice(0, 5).map((e) => (
              <TableRow key={e._id}>
                <TableCell>{formatDate(e.date || e.createdAt || '')}</TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell className="font-bold text-red-400">{formatCurrency(e.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> */}

      {/* Add Purchase Modal */}
      {/* {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-700 animate-in">
            <h2 className="text-2xl font-bold text-white mb-6">إضافة مشتريات أو تعديل مالي</h2>
            
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">الوصف</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شراء بضاعة جديدة، تعديل رصيد..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={purchaseData.description}
                  onChange={(e) => setPurchaseData({ ...purchaseData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">المبلغ</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={purchaseData.amount}
                  onChange={(e) => setPurchaseData({ ...purchaseData, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">النوع</label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  value={purchaseData.type}
                  onChange={(e) => setPurchaseData({ ...purchaseData, type: e.target.value as any })}
                >
                  <option value="purchase">شراء بضاعة</option>
                  <option value="adjustment">تعديل مالي</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" variant="primary" className="flex-1" loading={formLoading}>
                  حفظ القيد
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )} */}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    blue: "border-l-blue-500 bg-blue-500/5",
    green: "border-l-green-500 bg-green-500/5",
    orange: "border-l-orange-500 bg-orange-500/5",
    red: "border-l-red-500 bg-red-500/5",
    emerald: "border-l-emerald-500 bg-emerald-500/5",
  };

  return (
    <div className={`glass p-6 rounded-2xl border border-gray-700 border-l-4 ${colors[color]} shadow-xl transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{formatCurrency(value)}</p>
    </div>
  );
}
