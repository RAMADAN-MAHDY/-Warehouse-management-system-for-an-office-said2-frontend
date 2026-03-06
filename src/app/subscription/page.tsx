'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { subscriptionService } from '@/services/api';
import { Check, Crown, Zap, Shield, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

const PLANS = [
  {
    id: 'basic',
    name: 'الخطة الأساسية',
    price: 180,
    icon: <Zap className="w-8 h-8 text-blue-400" />,
    features: [
      'حد أقصى 200 منتج',
      '200 عملية بيع/شراء شهرياً',
      '200 عملية تسجيل مصروفات',
      'دعم فني عبر البريد',
      'تقارير أساسية'
    ],
    color: 'blue'
  },
  {
    id: 'professional',
    name: 'الخطة الاحترافية',
    price: 480,
    icon: <Crown className="w-8 h-8 text-amber-400" />,
    features: [
      'حد أقصى 1000 منتج',
      '1000 عملية بيع/شراء شهرياً',
      '1000 عملية تسجيل مصروفات',
      'دعم فني متميز 24/7',
      'تقارير تحليلية متقدمة',
      'تصدير Excel غير محدود'
    ],
    color: 'amber',
    popular: true
  }
];

export default function SubscriptionPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [refNumber, setRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await subscriptionService.getStatus();
      if (response.status) setStatus(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber) return toast.error('يرجى إدخال رقم العملية');
    
    setSubmitting(true);
    try {
      const response = await subscriptionService.submitPayment({
        amount: paymentModal.price,
        referenceNumber: refNumber,
        planRequested: paymentModal.id
      });
      if (response.status) {
        toast.success(response.message);
        setPaymentModal(null);
        setRefNumber('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Current Subscription Status */}
        <div className="glass-card p-8 rounded-3xl mb-12 border border-gray-700/50 bg-gradient-to-br from-gray-900 to-black">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">حالة الاشتراك الحالي</h1>
              <p className="text-gray-400">تابع استهلاكك وموعد انتهاء اشتراكك</p>
            </div>
            <div className={`px-6 py-2 rounded-full font-bold text-lg ${
              status?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative glass-card p-8 rounded-[2.5rem] border flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                plan.popular ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-700/50 bg-gray-800/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  الأكثر طلباً
                </div>
              )}
              
              <div className="mb-8">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">جنيه / شهر</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full py-4 rounded-2xl text-lg font-bold"
                onClick={() => setPaymentModal(plan)}
              >
                اشترك الآن
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-8 rounded-[2rem] border border-gray-700 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">الدفع عبر فودافون كاش</h2>
              <button onClick={() => setPaymentModal(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl mb-8">
              <p className="text-blue-400 text-sm mb-4">يرجى تحويل المبلغ المطلوب للرقم التالي:</p>
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl mb-4">
                <span className="text-2xl font-mono font-bold text-white tracking-widest">01012345678</span>
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>المبلغ المطلوب:</span>
                <span className="text-white font-bold">{paymentModal.price} جنيه</span>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">رقم العملية (Reference Number)</label>
                <input 
                  type="text"
                  required
                  placeholder="أدخل رقم العملية المكون من 10-12 رقم"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-500/20"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'تأكيد إرسال الدفع'}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                بعد الضغط على تأكيد، سيتم مراجعة العملية من قبل فريقنا وتفعيل حسابك خلال ساعة.
              </p>
            </form>
          </div>
        </div>
      )}
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
