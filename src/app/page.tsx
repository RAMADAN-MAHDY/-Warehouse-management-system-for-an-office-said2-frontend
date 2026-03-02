import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  BarChart2, 
  Zap, 
  Package, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-6xl mx-auto text-center animate-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold mb-8">
            <Zap size={16} />
            <span>نظام حديث ومطور لإدارة المخازن</span>
          </div>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={120} 
              height={120} 
              className="rounded-2xl shadow-2xl animate-fade-in"
            />
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            قم بإدارة مخزنك <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">بكل سهولة وذكاء</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            النظام المتكامل لإدارة المبيعات، المشتريات، المخزون، والمصروفات مع تقارير مالية دقيقة ورؤى بيانية متطورة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-10 h-16 text-lg" icon={<ArrowRight size={20} />}>
                ابدأ الآن مجاناً
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-10 h-16 text-lg">
                تسجيل الدخول
              </Button>
            </Link>
          </div>

          <div className="mt-20 glass p-4 rounded-3xl border border-gray-700 shadow-2xl animate-in delay-200">
            <div className="bg-gray-800 rounded-2xl overflow-hidden aspect-video relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-lg font-bold">معاينة لوحة التحكم</p>
              </div>
              {/* Image Placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                <Package size={100} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-950/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">مميزات النظام</h2>
            <p className="text-gray-400">كل ما تحتاجه لإدارة أعمالك في مكان واحد</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Package className="text-blue-500" />}
              title="إدارة المخزون"
              description="تتبع دقيق لكافة الأصناف والكميات مع إمكانية البحث السريع والتعديل الفوري."
            />
            <FeatureCard 
              icon={<BarChart2 className="text-purple-500" />}
              title="تقارير مالية"
              description="رسوم بيانية توضح الأرباح والخسائر وإجمالي المبيعات والمصروفات بدقة."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-green-500" />}
              title="أمان عالي"
              description="نظام مصادقة متطور يحمي بياناتك ويضمن خصوصية مخزنك بشكل كامل."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-800 text-center text-gray-500">
        <p>© 2026 جميع الحقوق محفوظة - نظام إدارة المخازن المتطور</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-3xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 group">
      <div className="p-4 bg-gray-800 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
