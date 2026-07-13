'use client';

import React from 'react';
import { SaleInvoice, PurchaseInvoice, Supplier } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PrintInvoiceProps {
  invoice: SaleInvoice | PurchaseInvoice;
  type: 'sale' | 'purchase';
  companyName?: string;
}

export const PrintInvoice = React.forwardRef<HTMLDivElement, PrintInvoiceProps>(({ invoice, type, companyName }, ref) => {
  const isSale = type === 'sale';
  const sale = invoice as SaleInvoice;
  const purchase = invoice as PurchaseInvoice;

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans dir-rtl text-right print-area" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{companyName || 'نظام إدارة المخازن'}</h1>
          <p className="text-gray-600 mt-1">فاتورة {isSale ? 'مبيعات' : 'مشتريات'}</p>
        </div>
        <div className="text-left" style={{ direction: 'ltr' }}>
          <p className="font-bold">رقم الفاتورة: {isSale ? sale._id.toString().slice(-6).toUpperCase() : purchase.invoiceNumber}</p>
          <p>التاريخ: {formatDate(isSale ? sale.createdAt! : purchase.date)}</p>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-gray-700 border-b mb-2 pb-1">تفاصيل {isSale ? 'العميل' : 'المورد'}</h3>
          {isSale ? (
            <p className="text-lg">{sale.sellerName || 'عميل نقدي'}</p>
          ) : (
            <div>
              <p className="text-lg font-bold">{purchase.supplierId && typeof purchase.supplierId === 'object' ? (purchase.supplierId as Supplier).name : 'مورد'}</p>
              {purchase.supplierId && typeof purchase.supplierId === 'object' && (purchase.supplierId as Supplier).phone && <p>الهاتف: {(purchase.supplierId as Supplier).phone}</p>}
              {purchase.supplierId && typeof purchase.supplierId === 'object' && (purchase.supplierId as Supplier).address && <p>العنوان: {(purchase.supplierId as Supplier).address}</p>}
            </div>
          )}
        </div>
        <div className="text-left" style={{ direction: 'ltr' }}>
          <h3 className="font-bold text-gray-700 border-b mb-2 pb-1 text-right" style={{ direction: 'rtl' }}>حالة الدفع</h3>
          <p className="text-lg font-bold">
            {invoice.paymentStatus === 'paid' ? 'مدفوع بالكامل' : 
             invoice.paymentStatus === 'partial' ? 'مدفوع جزئياً' : 'غير مدفوع'}
          </p>
          <p>المبلغ المدفوع: {formatCurrency(invoice.paidAmount)}</p>
          <p>المبلغ المتبقي: {formatCurrency((isSale ? sale.total : purchase.grandTotal) - invoice.paidAmount)}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="py-3 px-4 text-right">#</th>
            <th className="py-3 px-4 text-right">البيان / المنتج</th>
            <th className="py-3 px-4 text-center">الكمية</th>
            <th className="py-3 px-4 text-center">سعر الوحدة</th>
            <th className="py-3 px-4 text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {isSale ? (
            <tr className="border-b">
              <td className="py-3 px-4">1</td>
              <td className="py-3 px-4">
                <p className="font-bold">{sale.name}</p>
                <p className="text-sm text-gray-500">{sale.modelNumber}</p>
              </td>
              <td className="py-3 px-4 text-center">{sale.quantity}</td>
              <td className="py-3 px-4 text-center">{formatCurrency(sale.price)}</td>
              <td className="py-3 px-4 text-left font-bold">{formatCurrency(sale.total)}</td>
            </tr>
          ) : (
            purchase.items && purchase.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-3 px-4">{idx + 1}</td>
                <td className="py-3 px-4">
                   <p className="font-bold">{item.itemId && typeof item.itemId === 'object' ? (item.itemId as any).name : 'منتج'}</p>
                   <p className="text-sm text-gray-500">{item.itemId && typeof item.itemId === 'object' ? (item.itemId as any).modelNumber : ''}</p>
                </td>
                <td className="py-3 px-4 text-center">{item.qty}</td>
                <td className="py-3 px-4 text-center">{formatCurrency(item.unitCost)}</td>
                <td className="py-3 px-4 text-left font-bold">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/3 space-y-2 border-t-2 border-gray-800 pt-4">
          {!isSale && (
            <>
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{formatCurrency(purchase.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة:</span>
                <span>{formatCurrency(purchase.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span>{formatCurrency(purchase.discount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
            <span>الإجمالي النهائي:</span>
            <span>{formatCurrency(isSale ? sale.total : purchase.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>شكراً لتعاملكم معنا</p>
        <p className="mt-2">تم إنشاء هذه الفاتورة إلكترونياً بواسطة نظام إدارة المخازن</p>
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-area, .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />
    </div>
  );
});

PrintInvoice.displayName = 'PrintInvoice';
