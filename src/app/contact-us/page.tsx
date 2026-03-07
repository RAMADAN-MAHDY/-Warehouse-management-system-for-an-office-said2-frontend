'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Phone, MapPin, MessageCircle, Clock, Zap, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ContactUsPage() {

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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold mb-6">
              <MessageCircle size={16} />
              <span>نحن هنا لمساعدتك دائماً</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">تواصل معنا</h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              لديك استفسار؟ تواجه مشكلة تقنية؟ أو تريد اقتراح ميزة جديدة؟ فريق الدعم لدينا جاهز للرد عليك.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* WhatsApp Focused Contact Section */}
            <div className="glass-card p-10 lg:p-16 rounded-[3rem] border border-gray-800 bg-gray-800/20 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full -z-10 group-hover:bg-green-500/20 transition-all duration-700" />
              
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-green-500/10 text-green-500 mb-8 border border-green-500/20 shadow-2xl shadow-green-500/10 animate-pulse">
                <MessageCircle size={48} />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">تواصل معنا عبر واتساب</h2>
              <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
                للحصول على أسرع استجابة وتواصل مباشر مع فريق الدعم الفني، يرجى مراسلتنا عبر الواتساب. نحن متواجدون لمساعدتك في أي وقت.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button 
                  size="lg" 
                  className="px-12 h-16 text-lg bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 flex items-center gap-3 w-full sm:w-auto"
                  onClick={() => window.open('https://wa.me/201556299599', '_blank')}
                >
                  <MessageCircle size={24} />
                  <span>راسلنا الآن</span>
                </Button>
                
                <div className="flex items-center gap-4 p-4 px-6 bg-gray-800/50 rounded-2xl border border-gray-700 w-full sm:w-auto">
                  <Phone size={20} className="text-gray-400" />
                  <span className="text-xl font-mono font-bold text-white tracking-wider" dir="ltr">+20 155 629 9599</span>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-gray-800/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                    <Clock size={20} />
                  </div>
                  <span className="text-sm text-gray-400">السبت - الخميس</span>
                  <span className="text-white font-bold">9ص - 10م</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                    <Zap size={20} />
                  </div>
                  <span className="text-sm text-gray-400">استجابة سريعة</span>
                  <span className="text-white font-bold">خلال دقائق</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                    <HelpCircle size={20} />
                  </div>
                  <span className="text-sm text-gray-400">دعم فني شامل</span>
                  <span className="text-white font-bold">24/7 للطوارئ</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-24">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">الأسئلة الشائعة</h2>
                <p className="text-gray-400">إجابات سريعة على أكثر الاستفسارات تكراراً</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FAQItem 
                  question="كيف يمكنني تجديد اشتراكي؟" 
                  answer="يمكنك التجديد بسهولة من صفحة 'الاشتراك' داخل لوحة التحكم، واتباع خطوات الدفع عبر فودافون كاش." 
                />
                <FAQItem 
                  question="هل يمكنني تصدير بياناتي؟" 
                  answer="نعم، يوفر النظام خاصية تصدير كافة بيانات المخزون والمبيعات إلى ملفات Excel بضغطة زر واحدة." 
                />
                <FAQItem 
                  question="هل بياناتي آمنة؟" 
                  answer="بالتأكيد، نستخدم أحدث تقنيات التشفير ونقوم بعمل نسخ احتياطية دورية لضمان عدم فقدان أي بيانات." 
                />
                <FAQItem 
                  question="كيف يمكنني تغيير كلمة المرور؟" 
                  answer="يمكنك تغييرها من خلال إعدادات الحساب في لوحة التحكم، أو طلب استعادة كلمة المرور من صفحة الدخول." 
                />
             </div>
          </section>
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

function ContactInfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border border-gray-800 bg-gray-800/10 hover:border-gray-700 transition-all text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4 border border-gray-700">
        {icon}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-white font-bold text-sm">{value}</p>
    </div>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a href={href} className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-600/10 border border-gray-700 transition-all">
      {icon}
    </a>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-800 bg-gray-800/10">
      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
        <HelpCircle size={18} className="text-blue-400" />
        {question}
      </h4>
      <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
    </div>
  );
}
