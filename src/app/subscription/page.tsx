'use client';
import { useState, useEffect } from 'react';
// import MainLayout from '@/components/layout/MainLayout';
import { Check, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/useSubscription';
import PaymentModal from '@/components/ui/PaymentModal';


import PricingCard, { PricingPlan } from '@/components/ui/PricingCard';



export default function SubscriptionPage() {
  const { status, plans, loading, refetch } = useSubscription();
  const [paymentModal, setPaymentModal] = useState<any>(null);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto sm:py-8 sm:px-4 p-2">
        {/* Current Subscription Status */}
        <div className="glass-card sm:p-8 p-4 rounded-3xl mb-12 border border-gray-700/50 bg-gradient-to-br from-gray-900 to-black">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">حالة الاشتراك الحالي</h1>
              <p className="text-gray-400">تابع استهلاكك وموعد انتهاء اشتراكك</p>
            </div>
            <div className={`px-6 py-2 rounded-full font-bold text-lg ${status?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
              {status?.status === 'active' ? 'نشط' : 'منتهي'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-700/30">
              <span className="text-gray-400 text-sm block mb-1">الخطة الحالية</span>
              <span className="text-xl font-bold text-white capitalize">
                {status?.plan === 'free' ? 'تجريبية مجانية' : status?.plan === 'basic' ? 'أساسية' : 'احترافية'}
              </span>
            </div>
            <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-700/30">
              <span className="text-gray-400 text-sm block mb-1">تاريخ الانتهاء</span>
              <span className="text-xl font-bold text-white">
                {new Date(status?.endDate).toLocaleDateString('ar-EG')}
              </span>
            </div>
            <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-700/30">
              <span className="text-gray-400 text-sm block mb-1">الأيام المتبقية</span>
              <span className={`text-xl font-bold ${status?.daysLeft < 5 ? 'text-red-400' : 'text-blue-400'}`}>
                {status?.daysLeft} يوم
              </span>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="mt-10 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              حدود الاستخدام
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <UsageBar label="المنتجات" current={status?.usage.items} max={status?.limits.maxItems} color="blue" />
              <UsageBar label="عمليات البيع/الشراء" current={status?.usage.sales} max={status?.limits.maxSales} color="green" />
              <UsageBar label="المصاريف" current={status?.usage.expenses} max={status?.limits.maxExpenses} color="purple" />
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">اختر الخطة المناسبة لك</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            نوفر لك خططاً مرنة تناسب حجم أعمالك، مع دعم فني متميز وأمان كامل لبياناتك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className="flex flex-col">
              <PricingCard
                plan={plan}
                isLoggedIn={true}
                currentPlanId={status?.plan}
                onSubscribe={(p) => {
                  if (p.price === 0) return; // الخطة المجانية - لا شيء
                  setPaymentModal(p);
                }}
              />
              {plan.price === 0 && status?.plan !== plan.id && (
                <p className="text-center text-xs text-blue-400 font-medium mt-2">
                  ( شهر مجاني تجريبي — تجربتك مفعّلة تلقائياً عند التسجيل )
                </p>
              )}
            </div>
          ))}
        </div>

      </div>

      <PaymentModal
        isOpen={!!paymentModal}
        onClose={() => setPaymentModal(null)}
        plan={paymentModal}
        onSuccess={refetch}
      />

    </>
  );
}

function UsageBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  const percentage = Math.min((current / max) * 100, 100);
  const colorMap: any = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{current} / {max}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
