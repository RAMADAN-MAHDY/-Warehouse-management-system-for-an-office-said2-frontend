'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { superAdminService } from '@/services/api';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  Bot, 
  Zap, 
  Clock, 
  Calendar, 
  CalendarDays, 
  RefreshCw, 
  Loader2, 
  Building2, 
  IdCard,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

type UserUsageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  username?: string;
  companyName?: string;
};

type UsageData = {
  user: {
    id: string;
    username: string;
    companyName: string;
    customerId: string;
  };
  resources: {
    itemsCount: number;
    salesCount: number;
    suppliersCount: number;
    clientsCount: number;
  };
  aiUsage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    requests: {
      minute: number;
      hour: number;
      day: number;
      week: number;
      month: number;
    };
  };
};

export default function UserUsageModal({
  isOpen,
  onClose,
  userId,
  username,
  companyName,
}: UserUsageModalProps) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      void fetchUsage();
    } else {
      setData(null);
    }
  }, [isOpen, userId]);

  const fetchUsage = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await superAdminService.getUserUsage(userId);
      if (response.status && response.data) {
        setData(response.data);
      } else {
        toast.error('فشل جلب تفاصيل الاستهلاك');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تفاصيل استهلاك العميل: ${companyName || username || ''}`}
    >
      <div className="space-y-6 text-slate-100 dir-rtl">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-white">{companyName || 'بدون اسم شركة'}</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <IdCard className="h-4 w-4 text-blue-400" />
            <span>كود العميل:</span>
            <span className="font-mono font-bold text-emerald-400">{data?.user?.customerId || '...'}</span>
          </div>
          <div className="mr-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsage}
              disabled={loading}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="mr-1.5 text-xs">تحديث</span>
            </Button>
          </div>
        </div>

        {loading && !data ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="mr-3 text-sm text-slate-400">جارٍ جلب إحصائيات الاستهلاك...</span>
          </div>
        ) : (
          <>
            {/* Section 1: System Resource Usage */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
                <Package className="h-4 w-4 text-amber-400" />
                <span>إحصائيات الموارد المخزنية والمبيعات</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">المنتجات المخزنة</span>
                    <Package className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {data?.resources?.itemsCount?.toLocaleString('ar-EG') ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500">صنف مسجل</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">عمليات البيع</span>
                    <ShoppingCart className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {data?.resources?.salesCount?.toLocaleString('ar-EG') ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500">فاتورة مبيعات</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">الموردين</span>
                    <UserCheck className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {data?.resources?.suppliersCount?.toLocaleString('ar-EG') ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500">مورد مسجل</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">العملاء</span>
                    <Users className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {data?.resources?.clientsCount?.toLocaleString('ar-EG') ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500">عميل مسجل</span>
                </div>
              </div>
            </div>

            {/* Section 2: AI Tokens & Request Rates */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Bot className="h-4 w-4 text-emerald-400" />
                  <span>استهلاك الذكاء الاصطناعي (AI Analytics)</span>
                </h4>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>
                    إجمالي التوكنز: {data?.aiUsage?.totalTokens?.toLocaleString('ar-EG') ?? 0}
                  </span>
                </div>
              </div>

              {/* Tokens breakdown sub-cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-slate-400">توكنز المدخلات (Prompt Tokens):</span>
                  <div className="text-base font-bold text-slate-200 mt-1">
                    {data?.aiUsage?.promptTokens?.toLocaleString('ar-EG') ?? 0}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-slate-400">توكنز الإجابات (Completion Tokens):</span>
                  <div className="text-base font-bold text-slate-200 mt-1">
                    {data?.aiUsage?.completionTokens?.toLocaleString('ar-EG') ?? 0}
                  </div>
                </div>
              </div>

              {/* Request Rates by Time Window */}
              <div>
                <span className="block mb-2 text-xs font-semibold text-slate-400">
                  معدل طلبات الرسايل حسب الفترة الزمنية (AI Requests):
                </span>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                    <Zap className="h-4 w-4 text-yellow-400 mb-1" />
                    <span className="text-[11px] text-slate-400">آخر دقيقة</span>
                    <span className="text-lg font-black text-white mt-1">
                      {data?.aiUsage?.requests?.minute ?? 0}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                    <Clock className="h-4 w-4 text-sky-400 mb-1" />
                    <span className="text-[11px] text-slate-400">آخر ساعة</span>
                    <span className="text-lg font-black text-white mt-1">
                      {data?.aiUsage?.requests?.hour ?? 0}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                    <Calendar className="h-4 w-4 text-emerald-400 mb-1" />
                    <span className="text-[11px] text-slate-400">اليوم (24 ساعة)</span>
                    <span className="text-lg font-black text-white mt-1">
                      {data?.aiUsage?.requests?.day ?? 0}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
                    <CalendarDays className="h-4 w-4 text-purple-400 mb-1" />
                    <span className="text-[11px] text-slate-400">آخر أسبوع (7 أيام)</span>
                    <span className="text-lg font-black text-white mt-1">
                      {data?.aiUsage?.requests?.week ?? 0}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center col-span-2 sm:col-span-1">
                    <CalendarDays className="h-4 w-4 text-pink-400 mb-1" />
                    <span className="text-[11px] text-slate-400">آخر شهر (30 يوم)</span>
                    <span className="text-lg font-black text-white mt-1">
                      {data?.aiUsage?.requests?.month ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
}
