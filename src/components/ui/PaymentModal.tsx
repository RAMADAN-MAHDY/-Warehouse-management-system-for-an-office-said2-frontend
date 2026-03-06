import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Loader2, X } from 'lucide-react';
import { Button } from './Button';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/api';

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

export default function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [refNumber, setRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !plan) return null;


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
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="glass-card w-full max-w-md p-5 sm:p-8 rounded-[2rem] border border-gray-700 animate-in zoom-in duration-300 my-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">الدفع عبر فودافون كاش</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 sm:p-6 rounded-2xl mb-6 text-right">
          <p className="text-blue-400 text-xs sm:text-sm mb-3">يرجى تحويل المبلغ المطلوب للرقم التالي:</p>
          <div className="flex items-center justify-between bg-black/40 p-3 sm:p-4 rounded-xl mb-3">
            <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-widest">01012345678</span>
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-400">
            <span>الخطة: <span className="text-white font-bold">{plan.name}</span></span>
            <span>المبلغ: <span className="text-white font-bold">{plan.price} ج.م</span></span>
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
      </div>
    </div>,
    document.body
  );
}

