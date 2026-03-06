'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  BarChart2, 
  Zap, 
  Package, 
  ArrowRight,
  CheckCircle2,
  Crown,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { subscriptionService } from '@/services/api';
import PricingCard, { PricingPlan } from '@/components/ui/PricingCard';
import { useRouter } from 'next/navigation';

/**
 * @description تعريف خطط الأسعار المتاحة في النظام
 */
const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'الخطة التجريبية',
    price: 0,
    icon: <Zap className="w-8 h-8" />,
    features: [
      'فترة تجربة لمدة 30 يوم',
      'حد أقصى 200 منتج',
      '200 عملية بيع/شراء',
      '200 تسجيل مصروفات',
      'دعم فني أساسي'
    ],
    color: 'blue'
  },
  {
    id: 'basic',
    name: 'الخطة الأساسية',
    price: 180,
    icon: <ShieldCheck className="w-8 h-8" />,
    features: [
      'حد أقصى 200 منتج',
      '200 عملية بيع/شراء',
      '200 تسجيل مصروفات',
      'تقارير مالية أساسية',
      'دعم فني متميز'
    ],
    color: 'emerald',
    popular: true
  },
  {
    id: 'professional',
    name: 'الخطة الاحترافية',
    price: 480,
    icon: <Crown className="w-8 h-8" />,
    features: [
      'حد أقصى 1000 منتج',
      '1000 عملية بيع/شراء',
      '1000 تسجيل مصروفات',
      'تقارير تحليلية متقدمة',
      'تصدير Excel غير محدود',
      'دعم فني 24/7'
    ],
    color: 'amber'
  }
];

/**
 * @component LandingPage
 * @description الصفحة الرئيسية للنظام (Landing Page)
 */
export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [subscription, setSubscription] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchSubscription();
    }
  }, [isAuthenticated]);

  const fetchSubscription = async () => {
    try {
      const response = await subscriptionService.getStatus();
      if (response.status) setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription status');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden text-right" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {mounted && (
              isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleLogout} icon={<LogOut size={16} />}>
                    خروج
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm" icon={<LayoutDashboard size={16} />}>
                      لوحة التحكم
                    </Button>
                  </Link>
                  <span className="text-gray-400 text-sm hidden sm:inline-block">مرحباً، {user?.username}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm">دخول</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">ابدأ مجاناً</Button>
                  </Link>
                </div>
              )
            )}
          </div>
          
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-400 hidden sm:inline-block">نظام الإدارة</span>
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg shadow-lg" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
        <div className="max-w-6xl mx-auto text-center animate-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold mb-8">
            <Zap size={16} />
            <span>نظام حديث ومطور لإدارة المخازن</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            قم بإدارة مخزنك <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">بكل سهولة وذكاء</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            النظام المتكامل لإدارة المبيعات، المشتريات، المخزون، والمصروفات مع تقارير مالية دقيقة ورؤى بيانية متطورة.
          </p>

          <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-4">
            {mounted && (
              <>
                <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                  <Button size="lg" className="px-10 h-16 text-lg" icon={<ArrowRight size={20} className="mr-2" />}>
                    {isAuthenticated ? "انتقل للوحة التحكم" : "ابدأ الآن مجاناً"}
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="px-10 h-16 text-lg">
                      تسجيل الدخول
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-950/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">خطط الأسعار</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              نوفر لك خططاً مرنة تناسب حجم أعمالك، من الشركات الناشئة وحتى المؤسسات الكبيرة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mounted && PRICING_PLANS.map((plan) => (
              <PricingCard 
                key={plan.id} 
                plan={plan} 
                isLoggedIn={isAuthenticated}
                currentPlanId={subscription?.plan}
                onSubscribe={(p) => router.push('/subscription')}
              />
            ))}
          </div>
          
          <div className="mt-16 p-8 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">هل تحتاج إلى ميزات مخصصة؟</h3>
            <p className="text-gray-400 mb-6">يمكننا تصميم خطة خاصة تناسب احتياجاتك الفريدة، تواصل مع فريق المبيعات لدينا.</p>
            <Button variant="outline" className="px-8 border-blue-500/50 text-blue-400">تواصل معنا</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-bold text-white mb-8">لماذا تختار نظامنا؟</h2>
              <div className="space-y-6">
                <BenefitItem title="سرعة فائقة" description="تم بناء النظام بأحدث التقنيات لضمان استجابة لحظية لكل العمليات." />
                <BenefitItem title="تقارير دقيقة" description="احصل على رؤية شاملة لأداء عملك من خلال تقارير مفصلة ورسوم بيانية." />
                <BenefitItem title="دعم فني متواصل" description="فريقنا متواجد دائماً لمساعدتك في أي استفسار أو مشكلة تواجهك." />
                <BenefitItem title="واجهة مستخدم بديهية" description="تصميم بسيط وسهل الاستخدام لا يتطلب تدريباً مسبقاً." />
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
               <div className="absolute inset-0 bg-blue-600/10 blur-[100px] -z-10" />
               <div className="glass p-4 rounded-[2.5rem] border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="bg-gray-800 rounded-[2rem] overflow-hidden aspect-video relative group flex items-center justify-center">
                     <Package size={120} className="text-gray-700 animate-pulse" />
                     <div className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-2xl shadow-xl">
                        <BarChart2 className="text-white" size={32} />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg opacity-70" />
            <span className="text-gray-500">© 2026 جميع الحقوق محفوظة</span>
          </div>
          <div className="flex gap-8 text-gray-500">
            <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms-of-use" className="hover:text-blue-400 transition-colors">شروط الاستخدام</Link>
            <Link href="/contact-us" className="hover:text-blue-400 transition-colors">اتصل بنا</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="mt-1 bg-blue-600/10 p-2 rounded-lg group-hover:bg-blue-600/20 transition-colors">
        <CheckCircle2 className="text-blue-400" size={20} />
      </div>
      <div>
        <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}
