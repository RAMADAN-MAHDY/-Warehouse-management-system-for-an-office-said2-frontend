'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CreditCard, Hash, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { purchaseInvoiceService } from '@/services/api';
import { PurchaseInvoice } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PurchaseInvoice | null;
  onSuccess: () => void;
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: AddPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'cheque' | 'other'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const remainingDebt = invoice ? Math.max(0, invoice.grandTotal - invoice.paidAmount) : 0;

  useEffect(() => {
    if (isOpen && invoice) {
      setAmount(remainingDebt > 0 ? remainingDebt.toString() : '');
      setMethod('cash');
      setReferenceNumber('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, invoice, remainingDebt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح أكبر من 0');
      return;
    }

    if (numAmount > remainingDebt + 0.001) {
      toast.error('المبلغ المدفوع أكبر من المتبقي');
      return;
    }

    setLoading(true);
    try {
      const response = await purchaseInvoiceService.addPayment(invoice._id, {
        amount: numAmount,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        note: note.trim() || undefined,
        date: date || undefined,
      });

      if (response.status) {
        toast.success('تمت إضافة الدفعة بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'فشل إضافة الدفعة');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إضافة الدفعة');
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة دفعة - فاتورة #${invoice.invoiceNumber}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Summary Card */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/60 space-y-2 text-sm">
          <div className="flex justify-between items-center text-gray-300">
            <span>إجمالي الفاتورة:</span>
            <span className="font-semibold text-white">{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>المبلغ المدفوع سابقًا:</span>
            <span className="font-semibold text-green-400">{formatCurrency(invoice.paidAmount)}</span>
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
            المبلغ <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            required
            min="0.01"
            max={remainingDebt}
            step="0.01"
            placeholder="أدخل المبلغ"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <CreditCard size={16} className="text-blue-400" />
            طريقة الدفع
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
            placeholder="مثال: TRX-987654"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Calendar size={16} className="text-blue-400" />
            تاريخ الدفعة
          </label>
          <input
            type="date"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            ملاحظات (اختياري)
          </label>
          <textarea
            rows={2}
            maxLength={500}
            placeholder="أي ملاحظات حول هذه الدفعة..."
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
