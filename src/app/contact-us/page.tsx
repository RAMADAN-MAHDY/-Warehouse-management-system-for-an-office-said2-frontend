'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, Phone, MapPin, Send, MessageCircle, Clock, Facebook, Twitter, Instagram, Linkedin, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // محاكاة إرسال الرسالة
    setTimeout(() => {
      toast.success('تم إرسال رسالتك بنجاح! سيرد فريقنا عليك قريباً.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="glass-card p-8 rounded-[2.5rem] border border-gray-800 bg-gray-800/20">
              <h2 className="text-2xl font-bold text-white mb-8">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">الاسم بالكامل</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">البريد الإلكتروني</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 pr-2">الموضوع</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 pr-2">الرسالة</label>
                  <textarea 
                    rows={5}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full py-4 text-lg font-bold" disabled={loading}>
                  {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  {!loading && <Send size={20} className="mr-2" />}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContactInfoCard 
                  icon={<Phone className="text-green-400" />}
                  title="اتصل بنا"
                  value="+20 101 234 5678"
                />
                <ContactInfoCard 
                  icon={<Mail className="text-blue-400" />}
                  title="راسلنا"
                  value="support@management-system.com"
                />
                <ContactInfoCard 
                  icon={<MapPin className="text-red-400" />}
                  title="الموقع"
                  value="القاهرة، مصر - المعادي"
                />
                <ContactInfoCard 
                  icon={<Clock className="text-amber-400" />}
                  title="أوقات العمل"
                  value="السبت - الخميس: 9ص - 6م"
                />
              </div>

              {/* Map Placeholder */}
              <div className="glass-card h-64 rounded-[2.5rem] border border-gray-800 bg-gray-800/20 flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                 <div className="text-center z-10">
                    <MapPin size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-bold">خريطة الموقع التفاعلية</p>
                 </div>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-6">
                 <SocialLink icon={<Facebook />} href="#" />
                 <SocialLink icon={<Twitter />} href="#" />
                 <SocialLink icon={<Instagram />} href="#" />
                 <SocialLink icon={<Linkedin />} href="#" />
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
