'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Hash, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { saleService } from '@/services/api';
import { SaleInvoice } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface AddSalePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleInvoice | null;
  onSuccess: () => void;
}

export default function AddSalePaymentModal({
  isOpen,
  onClose,
  sale,
  onSuccess,
}: AddSalePaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'cheque' | 'other'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');

  const remainingDebt = sale ? Math.max(0, sale.total - (sale.paidAmount || 0)) : 0;

  useEffect(() => {
    if (isOpen && sale) {
      setAmount(remainingDebt > 0 ? remainingDebt.toString() : '');
      setMethod('cash');
      setReferenceNumber('');
      setNote('');
    }
  }, [isOpen, sale, remainingDebt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('المبلغ يجب أن يكون أكبر من صفر');
      return;
    }

    if (numAmount > remainingDebt + 0.001) {
      toast.error('المبلغ المدفوع أكبر من المتبقي');
      return;
    }

    setLoading(true);
    try {
      const response = await saleService.addPayment(sale._id, {
        amount: numAmount,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        note: note.trim() || undefined,
      });

      if (response.status) {
        toast.success('تم تسجيل الدفعة بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'فشل تسجيل الدفعة');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدفعة');
    } finally {
      setLoading(false);
    }
  };

  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تسجيل دفعة - فاتورة بيع #${sale.modelNumber}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Summary Card */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/60 space-y-2 text-sm">
          <div className="flex justify-between items-center text-gray-300">
            <span>إجمالي الفاتورة:</span>
            <span className="font-semibold text-white">{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>المبلغ المدفوع سابقًا:</span>
            <span className="font-semibold text-green-400">{formatCurrency(sale.paidAmount || 0)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-800 text-gray-200">
            <span className="font-bold">المتبقي للدفع:</span>
            <span className="font-bold text-amber-400">{formatCurrency(remainingDebt)}</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <DollarSign size={16} className="text-blue-400" />
            مبلغ الدفعة <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            required
            min="0.01"
            max={remainingDebt}
            step="0.01"
            placeholder="أدخل المبلغ المدفوع الآن"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <CreditCard size={16} className="text-blue-400" />
            طريقة الدفع (اختياري)
          </label>
          <select
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
          >
            <option value="cash">نقدي (Cash)</option>
            <option value="bank_transfer">تحويل بنكي (Bank Transfer)</option>
            <option value="cheque">شيك (Cheque)</option>
            <option value="other">أخرى (Other)</option>
          </select>
        </div>

        {/* Reference Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Hash size={16} className="text-blue-400" />
            الرقم المرجعي / رقم التحويل (اختياري)
          </label>
          <input
            type="text"
            maxLength={100}
            placeholder="مثال: TRX-123456"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            ملاحظة (اختياري)
          </label>
          <textarea
            rows={2}
            maxLength={500}
            placeholder="ملاحظات حول هذه الدفعة..."
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-3">
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>
            حفظ الدفعة
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
