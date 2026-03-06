import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileText, CheckCircle2, AlertTriangle, ShieldAlert, Scale, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | نظام الإدارة المتطور',
  description: 'تعرف على القواعد والأنظمة التي تحكم استخدامك لمنصة إدارة المخازن والاشتراكات.',
};

export default function TermsOfUsePage() {
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
              <FileText size={16} />
              <span>شروط واضحة لاستخدام عادل</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">شروط الاستخدام</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              يرجى قراءة هذه الشروط بعناية قبل البدء في استخدام خدماتنا.
            </p>
          </div>

          <div className="space-y-12">
            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Scale className="text-blue-400" size={24} />
                قبول الشروط
              </h2>
              <p className="text-gray-400 leading-relaxed">
                بمجرد إنشائك لحساب في "نظام الإدارة"، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء منها، فيجب عليك التوقف عن استخدام الخدمة فوراً.
              </p>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-blue-400" size={24} />
                الخدمة والاشتراك
              </h2>
              <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span><strong>الخطة التجريبية:</strong> تمنح للمستخدم الجديد لمدة 30 يوماً فقط، وبعدها يتوقف الحساب عن العمل ما لم يتم الترقية.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span><strong>حدود الاستخدام:</strong> كل خطة لها حدود قصوى لعدد المنتجات والعمليات. تجاوز هذه الحدود يتطلب ترقية الخطة.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <span><strong>الدفع:</strong> يتم الدفع مقابل الاشتراك الشهري أو السنوي، والرسوم غير قابلة للاسترداد بعد تفعيل الخدمة.</span>
                </li>
              </ul>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Ban className="text-blue-400" size={24} />
                الاستخدام المحظور
              </h2>
              <p className="text-gray-400 mb-4">يُحظر تماماً استخدام النظام في:</p>
              <ul className="space-y-2 text-gray-400">
                <li>• أي نشاط غير قانوني أو مخالف للأنظمة المعمول بها.</li>
                <li>• محاولة اختراق النظام أو الوصول لبيانات مستخدمين آخرين.</li>
                <li>• استخدام النظام لإدخال بيانات وهمية أو مضللة بشكل متعمد.</li>
                <li>• إعادة بيع الخدمة أو تأجير الحساب لأطراف ثالثة دون إذن مسبق.</li>
              </ul>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldAlert className="text-blue-400" size={24} />
                تحديد المسؤولية
              </h2>
              <p className="text-gray-400 leading-relaxed">
                نحن نسعى جاهدين لضمان دقة النظام وتوافره بنسبة 99.9%، ومع ذلك، لا يتحمل "نظام الإدارة" أي مسؤولية عن أي خسائر تجارية أو فقدان بيانات ناتج عن سوء استخدام المستخدم أو أي خلل تقني خارج عن إرادتنا. ننصح دائماً بتصدير نسخ احتياطية دورية من بياناتك عبر خاصية الـ Excel.
              </p>
            </section>

            <section className="glass-card p-8 rounded-3xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertTriangle className="text-blue-400" size={24} />
                تعليق وإنهاء الخدمة
              </h2>
              <p className="text-gray-400 leading-relaxed">
                نحتفظ بالحق في تعليق أو إنهاء حسابك في حال ثبوت مخالفة شروط الاستخدام، أو في حال عدم سداد رسوم الاشتراك بعد انتهاء فترة السماح المحددة بـ 7 أيام من تاريخ الاستحقاق.
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
