import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Lock, Eye, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | نظام الإدارة المتطور',
  description: 'تعرف على كيفية حمايتنا لبياناتك الشخصية وبيانات أعمالك في نظام إدارة المخازن.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-right" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={<ArrowRight size={16} className="ml-2" />}>العودة للرئيسية</Button>
          </Link>
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-400">نظام الإدارة</span>
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg shadow-lg" />
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold mb-6">
              <ShieldCheck size={16} />
              <span>خصوصيتك هي أولويتنا القصوى</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">سياسة الخصوصية</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              نحن نلتزم بحماية بياناتك الشخصية وبيانات أعمالك بأعلى معايير الأمان والشفافية.
            </p>
          </div>

          <div className="space-y-12">
            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Lock className="text-blue-400" size={24} />
                مقدمة
              </h2>
              <p className="text-gray-400 leading-relaxed">
                في "نظام الإدارة"، ندرك أن البيانات التي تضعها في نظامنا هي عصب عملك. تهدف هذه السياسة إلى شرح كيفية جمعنا ومعالجتنا لبياناتك الشخصية والبيانات المتعلقة بالمخزون والمبيعات التي تقوم بإدخالها. باستخدامك لخدمتنا، فإنك توافق على الممارسات الموضحة في هذه الصفحة.
              </p>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Eye className="text-blue-400" size={24} />
                البيانات التي نجمعها
              </h2>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، اسم الشركة، وكلمة المرور المشفرة.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span><strong>بيانات العمل:</strong> تفاصيل المنتجات، الكميات، أسعار البيع والشراء، وسجلات المصروفات.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span><strong>بيانات الاستخدام:</strong> سجلات الدخول، نوع المتصفح، وعنوان IP لأغراض أمنية وتطوير الخدمة.</span>
                </li>
              </ul>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="text-blue-400" size={24} />
                حماية البيانات وأمنها
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                نستخدم تقنيات تشفير متطورة (SSL/TLS) لحماية بياناتك أثناء الانتقال، ونقوم بتخزين البيانات في قواعد بيانات مؤمنة بشكل كامل. كما نطبق سياسات صارمة للوصول إلى البيانات تضمن عدم وصول أي طرف غير مصرح له إلى معلوماتك.
              </p>
              <p className="text-gray-400 leading-relaxed">
                نحن لا نقوم ببيع بياناتك لأي جهات خارجية أو استخدامها لأغراض إعلانية. بياناتك ملك لك وحدك.
              </p>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="text-blue-400" size={24} />
                حقوق المستخدم
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                لديك الحق الكامل في:
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• الوصول إلى كافة بياناتك في أي وقت.</li>
                <li>• تعديل أو تصحيح أي معلومات غير دقيقة.</li>
                <li>• طلب حذف حسابك وكافة البيانات المرتبطة به بشكل نهائي.</li>
                <li>• تصدير بياناتك في ملفات Excel للرجوع إليها خارج النظام.</li>
              </ul>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Mail className="text-blue-400" size={24} />
                تواصل معنا
              </h2>
              <p className="text-gray-400 leading-relaxed">
                إذا كان لديك أي استفسار بخصوص سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: 
                <span className="text-blue-400 mr-2">privacy@management-system.com</span>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-gray-800 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg opacity-70" />
            <span className="text-gray-500">© 2026 جميع الحقوق محفوظة</span>
          </div>
          <div className="flex gap-8 text-gray-500 text-sm">
            <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms-of-use" className="hover:text-blue-400 transition-colors">شروط الاستخدام</Link>
            <Link href="/contact-us" className="hover:text-blue-400 transition-colors">اتصل بنا</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
