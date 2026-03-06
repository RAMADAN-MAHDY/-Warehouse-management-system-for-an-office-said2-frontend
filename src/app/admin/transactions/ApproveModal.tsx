'use client';

import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export default function ApproveModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing 
}: ApproveModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تأكيد عملية الدفع"
      maxWidth="md"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
          <ShieldCheck size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">هل تريد تأكيد العملية؟</h3>
        <p className="text-gray-400 text-sm">سيتم تفعيل الاشتراك للعميل فور تأكيدك لاستلام المبلغ.</p>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="primary" 
          className="flex-1 py-4 rounded-2xl bg-green-600 hover:bg-green-700 border-none font-bold"
          onClick={onConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'تأكيد وتفعيل'}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 py-4 rounded-2xl border-gray-700 font-bold"
          onClick={onClose}
        >
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
