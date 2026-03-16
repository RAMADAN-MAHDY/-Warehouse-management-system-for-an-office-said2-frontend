 import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { Wallet, Loader2, QrCode, Copy, ExternalLink, Check } from 'lucide-react';
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

  const instaPayUri = `upi://pay?pa=${INSTAPAY_ID}&pn=Subscription&am=${plan.price}&cu=EGP`;

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

  return (    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="الدفع عبر انستا باي (InstaPay)"
      maxWidth="md"
    >
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 sm:p-6 rounded-2xl mb-6 text-right">
        <p className="text-blue-400 text-xs sm:text-sm mb-3 font-medium">يرجى تحويل المبلغ المطلوب للرقم التالي أو مسح رمز QR:</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-black/40 p-4 sm:p-5 rounded-xl mb-4">
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-lg">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(INSTAPAY_ID)}`}
              alt="QR Code"
              width={120}
              height={120}
              className="rounded-lg"
            />
            <span className="text-[10px] text-gray-500 font-bold mt-2 text-center">امسح للدفع عبر<br/>InstaPay</span>
          </div>
          
          <div className="flex flex-col sm:items-end w-full">
            <span className="text-xs text-gray-400 mb-1">عنوان الدفع (IPA) / رقم الهاتف:</span>
            <div className="flex flex-col gap-2 w-full sm:items-end">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={handleCopy}>
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-widest bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700 group-hover:border-blue-500 transition-colors">
                  01099313876
                </span>
                <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              
              <a 
                href={instaPayUri}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>فتح في تطبيق InstaPay (للموبايل)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <div className="flex flex-col text-xs sm:text-sm text-gray-400 mt-4 w-full">
              <div className="flex justify-between border-b border-gray-700/50 pb-2 mb-2">
                <span>الخطة:</span>
                <span className="text-white font-bold">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ المطلوب:</span>
                <span className="text-green-400 font-bold text-lg">{plan.price} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handlePay} className="space-y-4 sm:space-y-6 text-right" dir="rtl">
        <div className="space-y-2">
          <label className="text-xs sm:text-sm text-gray-400 pr-2">رقم العملية (Reference Number)</label>
          <input 
            type="text"
            required
            placeholder="أدخل رقم العملية (10-12 رقم)"
            className="w-full px-4 py-2.5 sm:py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left text-sm sm:text-base"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
          />
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full py-3.5 sm:py-4 text-base sm:text-lg font-bold shadow-xl shadow-blue-500/20"
          disabled={submitting}
        >
          {submitting ? (
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>جاري الإرسال...</span>
            </div>
          ) : 'تأكيد إرسال الدفع'}
        </Button>
        
        <p className="text-xs text-center text-gray-400 leading-relaxed px-4">
          بعد الضغط على تأكيد، سيتم مراجعة العملية من قبل فريقنا وتفعيل حسابك خلال ساعة.
        </p>
      </form>
    </Modal>
  );
}


