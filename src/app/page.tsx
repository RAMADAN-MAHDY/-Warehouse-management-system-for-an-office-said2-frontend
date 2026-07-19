'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
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
  LogOut,
  Users,
  Repeat2,
  BadgeCheck,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { subscriptionService, authService } from '@/services/api';
import PricingCard, { PricingPlan } from '@/components/ui/PricingCard';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import PaymentModal from '@/components/ui/PaymentModal';


export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { plans, status: subscription, loading, refetch } = useSubscription(isAuthenticated);


  const [mounted, setMounted] = useState(false);
  const [paymentModal, setPaymentModal] = useState<PricingPlan | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();


  useEffect(() => {
    setMounted(true);
  }, [isAuthenticated]);
    

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden text-right" dir="rtl">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
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
                    <Button variant="primary" size="sm">ابدأ الآن</Button>
                  </Link>
                </div>
              )
            )}
          </div>
          
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-400 hidden sm:inline-block">المخزنجي</span>
            <Image src="/logo.png" alt="المخزنجي" width={120} height={40} className="rounded-[50] md:w-[200px] md:ml-[-14px] md:p-4 shadow-lg object-contain" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-14 lg:pt-36 lg:pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold mb-6">
                <Zap size={16} />
                <span>نظام حديث ومطور لإدارة المخازن</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
                قم بإدارة مخزنك <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">بكل سهولة وذكاء</span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                كل ما تحتاجه من مبيعات ومشتريات ومخزون ومصروفات، مع إدارة العملاء والموردين والمرتجعات والمناديب في لوحة واحدة، مع تقارير واضحة وخبرة تشغيلية أنيقة وسهلة.
              </p>

              <div className="flex flex-col sm:flex-row-reverse items-center justify-center lg:justify-start gap-3 mb-8">
                {mounted && (
                  <>
                    <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                      <Button size="lg" className="px-8 h-14 text-base" icon={<ArrowRight size={18} className="mr-2" />}>
                        {isAuthenticated ? "انتقل للوحة التحكم" : "ابدأ الآن"}
                      </Button>
                    </Link>
                    {!isAuthenticated && (
                      <Link href="/login">
                        <Button variant="outline" size="lg" className="px-8 h-14 text-base">
                          تسجيل الدخول
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
                <QuickStat title="العمليات الأساسية" text="مبيعات، مشتريات، مخزون، مصروفات" />
                <QuickStat title="إدارة الأعمال" text="عملاء، موردين، مرتجعات، مناديب" />
                <QuickStat title="سهل الاستخدام" text="واجهة واضحة من أول لمحة" />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute inset-0 bg-blue-500/10 blur-[90px] rounded-full -z-10" />
              <div className="rounded-[2rem] border border-gray-700 bg-gray-900/80 p-3 shadow-2xl animate-float">
                <div className="rounded-[1.5rem] border border-gray-800 bg-gradient-to-br from-blue-500/20 to-purple-500/10 p-4">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-700 bg-gray-950/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-sm text-blue-300">لوحة التحكم</span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-950/70 p-4 border border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">المبيعات</span>
                        <BarChart2 className="text-blue-400" size={18} />
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-gray-800">
                        <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                      </div>
                      <p className="mt-3 text-2xl font-bold text-white">+24%</p>
                    </div>

                    <div className="rounded-2xl bg-gray-950/70 p-4 border border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">المخزون</span>
                        <Package className="text-purple-400" size={18} />
                      </div>
                      <div className="mt-3 flex items-end gap-2">
                        <div className="h-10 w-5 rounded-t-lg bg-blue-500/70" />
                        <div className="h-16 w-5 rounded-t-lg bg-purple-500/70" />
                        <div className="h-7 w-5 rounded-t-lg bg-cyan-500/70" />
                      </div>
                      <p className="mt-3 text-sm text-gray-400">تتبع مباشر للأصناف</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">النشاط الأخير</span>
                      <span className="text-sm text-emerald-400">محدث الآن</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-800">
                        <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                      </div>
                      <span className="text-sm font-semibold text-white">68%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 border-t border-gray-800 bg-gray-950/40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">خطط الأسعار</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              اختر الخطة التي تناسب حجم عملك، وابدأ باستخدام النظام بكل مرونة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mounted && plans?.map((plan: PricingPlan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isLoggedIn={isAuthenticated}
                currentPlanId={typeof subscription?.plan === 'string' ? subscription.plan : subscription?.plan?.id || undefined}
                onSubscribe={(p) => {
                  if (p.price === 0) {
                    router.push('/store');
                  } else {
                    router.push('/subscription');
                  }
                }}
              />
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-blue-500/20 bg-blue-600/10 p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">هل تحتاج خطة مخصصة؟</h3>
            <p className="text-gray-400 mb-4">يمكننا تصميم حل يناسب احتياجاتك الخاصة بشكل أدق.</p>
            <Link href="https://wa.me/201124885991">
              <Button variant="outline" className="px-8 border-blue-500/50 text-blue-400">
                تواصل معنا <MessageCircle className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
            <div className="rounded-[1.75rem] border border-gray-800 bg-gray-900/70 p-6">
              <h2 className="text-3xl font-bold text-white mb-3">ماذا يقدم لك النظام؟</h2>
              <p className="text-gray-400 leading-relaxed">
                نظام عملي مصمم لمساعدتك على متابعة كل شيء من مكان واحد، بدون تعقيد وبدون ضياع للوقت.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FeatureCard title="المبيعات والمشتريات" description="تابع كل عملية من نقطة واحدة." icon={<BarChart2 size={22} />} />
                <FeatureCard title="إدارة المخزون" description="راقب الكميات والأصناف بدقة." icon={<Package size={22} />} />
                <FeatureCard title="التقارير المالية" description="اعرف الأداء بسرعة وفي أي وقت." icon={<ShieldCheck size={22} />} />
                <FeatureCard title="المصروفات والعمليات" description="احتفظ بالتحكم في النفقات والأنشطة اليومية." icon={<CheckCircle2 size={22} />} />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-blue-500/20 bg-blue-600/10 p-6">
              <h3 className="text-2xl font-bold text-white mb-4">أقسام أساسية تغطي نشاطك</h3>
              <div className="grid grid-cols-1 gap-3">
                <MiniFeature title="العملاء" description="تابع الطلبات والتعاملات بوضوح." icon={<Users size={18} />} />
                <MiniFeature title="الموردين" description="أدر العلاقات والمشتريات بسهولة." icon={<Truck size={18} />} />
                <MiniFeature title="المرتجعات" description="إدارة المرتجعات بشكل منظم." icon={<Repeat2 size={18} />} />
                <MiniFeature title="المناديب" description="تابع المناديب والتسليمات بسلاسة." icon={<BadgeCheck size={18} />} />
              </div>
              <Link href="/register" className="inline-block mt-6">
                <Button size="lg" className="px-8" icon={<ArrowRight size={18} />}>
                  أنشئ حسابك الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="المخزنجي" width={40} height={40} className="rounded-lg opacity-70 object-contain" />
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

function QuickStat({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800/70 px-4 py-3">
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{text}</p>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-gray-800 bg-gray-900/70 p-6 transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-4 inline-flex rounded-2xl bg-blue-600/10 p-3 text-blue-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function MiniFeature({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-gray-900/60 p-3">
      <div className="mt-0.5 rounded-xl bg-blue-500/15 p-2 text-blue-300">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-bold text-white">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}
