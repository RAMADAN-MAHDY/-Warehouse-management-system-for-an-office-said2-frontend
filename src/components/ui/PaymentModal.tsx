 import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { Wallet, Loader2, QrCode, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/api';
import Image from 'next/image';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
  } | null;
  onSuccess?: () => void;
}

const INSTAPAY_ID = '01099313876@instapay';

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [refNumber, setRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !plan) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('01099313876');
    setCopied(true);
    toast.success('تم نسخ الرقم بنجاح');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber) return toast.error('يرجى إدخال رقم العملية');
    if (refNumber.length < 8) return toast.error('رقم العملية غير صحيح');
    
    setSubmitting(true);
    try {
      const response = await subscriptionService.submitPayment({
        amount: plan.price,
        referenceNumber: refNumber,
        planRequested: plan.id
      });
      
      if (response.status) {
        toast.success(response.message || 'تم إرسال الطلب بنجاح');
        setRefNumber('');
        // أطلق حدثاً مخصصاً لإخطار NotificationBell بتحديث الإشعارات فوراً
        window.dispatchEvent(new CustomEvent('notification:refresh'));
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="الدفع عبر انستا باي (InstaPay)"
      maxWidth="md"
    >
      <div className="space-y-6 text-right" dir="rtl">
        {/* Payment Info Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-6 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-600/10 blur-3xl -ml-16 -mb-16" />
          
          <div className="relative flex flex-col items-center gap-8">
            {/* QR Code Section */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-2xl">
                <img 
                  src="/qrcode/WhatsApp Image 2026-03-18 at 10.31.18 PM.jpeg"
                  alt="InstaPay QR Code"
                  width={220}
                  height={220}
                  className="rounded-lg object-contain"
                />
                <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <QrCode className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Scan to Pay</span>
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="w-full space-y-5">
              <div className="flex flex-col items-center sm:items-end space-y-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">عنوان الدفع اللحظي (IPA)</span>
                <button 
                  onClick={handleCopy}
                  className="group relative flex items-center gap-3 px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 rounded-2xl transition-all duration-300 w-full sm:w-auto"
                >
                  <span className="text-lg sm:text-xl font-mono font-bold text-white tracking-wider">
                    01099313876
                  </span>
                  <div className="p-1.5 bg-gray-700/50 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/30">
                  <span className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">الخطة المختارة</span>
                  <span className="text-sm text-white font-bold">{plan.name}</span>
                </div>
                <div className="bg-green-500/5 p-4 rounded-2xl border border-green-500/10">
                  <span className="text-[10px] text-green-500/70 block mb-1 uppercase font-bold">المبلغ المطلوب</span>
                  <span className="text-xl text-green-400 font-black">{plan.price} <small className="text-xs font-normal">ج.م</small></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handlePay} className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">تأكيد عملية الدفع</span>
              <label className="text-xs text-gray-400">رقم العملية (Reference Number)</label>
            </div>
            <div className="relative group">
              <input 
                type="text"
                required
                placeholder="أدخل رقم العملية المكون من 10-12 رقم"
                className="w-full px-5 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-center text-lg font-mono tracking-widest placeholder:text-gray-700 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-5 rounded-2xl text-lg font-black tracking-wide shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-500 transform hover:-translate-y-0.5"
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center gap-3 justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>جاري معالجة الطلب...</span>
              </div>
            ) : 'تأكيد إرسال طلب التفعيل'}
          </Button>
          
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
            <div className="p-1 bg-amber-500/20 rounded-full mt-0.5">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] text-amber-200/60 leading-relaxed">
              بمجرد الضغط على تأكيد، سيقوم فريقنا بمراجعة العملية وتفعيل حسابك تلقائياً خلال أقل من ساعة.
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
}


