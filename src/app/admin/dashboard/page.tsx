'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { superAdminService } from '@/services/api';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Package, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await superAdminService.getStats();
      if (response.status) setStats(response.data);
    } catch (error: any) {
      toast.error('فشل في تحميل إحصائيات النظام');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto sm:py-8 sm:px-4 p-2 text-right" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
            <ShieldCheck className="text-purple-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">لوحة تحكم السوبر أدمن</h1>
            <p className="text-gray-400">نظرة عامة على أداء النظام وحالة المستخدمين</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="إجمالي المستخدمين" 
            value={stats?.users} 
            icon={<Users className="text-blue-400" />} 
            color="blue"
          />
          <StatCard 
            title="اشتراكات نشطة" 
            value={stats?.activeSubscriptions} 
            icon={<CheckCircle2 className="text-green-400" />} 
            color="green"
          />
          <StatCard 
            title="إجمالي الإيرادات" 
            value={`${stats?.revenue} ج.م`} 
            icon={<TrendingUp className="text-emerald-400" />} 
            color="emerald"
          />
          <StatCard 
            title="مدفوعات معلقة" 
            value={stats?.pendingPayments} 
            icon={<Clock className="text-amber-400" />} 
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">تنبيهات النظام</h2>
            <div className="space-y-4">
              {stats?.pendingPayments > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <AlertCircle size={20} />
                    يوجد {stats.pendingPayments} طلب دفع جديد بانتظار المراجعة:
                  </h3>
                  <ul className="space-y-2">
                    {stats.latestPendingPayments.map((payment: any) => (
                      <li key={payment._id} className="flex items-center justify-between text-sm text-gray-300">
                        <a href={`/admin/transactions?id=${payment._id}`} className="hover:text-amber-300 transition-colors flex items-center gap-2">
                          <Clock size={16} />
                          <span>{payment.user?.username || payment.customerId} - {payment.planRequested} ({payment.amount} ج.م)</span>
                        </a>
                        <span className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                <ShieldCheck size={20} />
                <span>النظام يعمل بشكل مستقر، كافة الخدمات متصلة.</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">روابط سريعة</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickLink title="إدارة المستخدمين" href="/admin/users" icon={<Users />} />
              <QuickLink title="إدارة الخطط" href="/admin/plans" icon={<CreditCard />} />
              <QuickLink title="سجلات النظام" href="/admin/audit" icon={<AlertCircle />} />
              <QuickLink title="مراجعة المدفوعات" href="/admin/transactions" icon={<Clock />} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'from-blue-600/20 to-transparent border-blue-500/30',
    green: 'from-green-600/20 to-transparent border-green-500/30',
    emerald: 'from-emerald-600/20 to-transparent border-emerald-500/30',
    amber: 'from-amber-600/20 to-transparent border-amber-500/30',
  };

  return (
    <div className={`glass-card p-6 rounded-2xl border bg-gradient-to-br ${colors[color]} hover:scale-105 transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function QuickLink({ title, href, icon }: any) {
  return (
    <a href={href} className="flex items-center gap-3 p-4 bg-gray-800/40 border border-gray-700/30 rounded-2xl text-gray-300 hover:bg-purple-600/10 hover:border-purple-500/30 hover:text-purple-400 transition-all">
      {icon}
      <span className="font-medium">{title}</span>
    </a>
  );
}
