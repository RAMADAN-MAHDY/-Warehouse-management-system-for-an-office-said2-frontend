'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Printer
} from 'lucide-react';
import { purchaseInvoiceService, supplierService, itemService, authService } from '@/services/api';
import { PurchaseInvoice, Supplier, Item } from '@/types';
import { PrintInvoice } from '@/components/PrintInvoice';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

interface PurchaseInvoiceItemForm {
  itemId: string;
  qty: number;
  unitCost: number;
}

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<PurchaseInvoiceItemForm[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printingData, setPrintingData] = useState<PurchaseInvoice | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as PurchaseInvoiceItemForm[],
    subTotal: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0,
    paidAmount: 0
  });

  // Calculate totals
  const calculateTotals = (items: PurchaseInvoiceItemForm[], tax: number = 0, discount: number = 0) => {
    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
    const grandTotal = subTotal + tax - discount;
    return { subTotal, grandTotal };
  };

  // Update totals when items, tax, or discount change
  useEffect(() => {
    const { subTotal, grandTotal } = calculateTotals(invoiceItems, formData.tax, formData.discount);
    setFormData(prev => ({
      ...prev,
      subTotal,
      grandTotal
    }));
  }, [invoiceItems, formData.tax, formData.discount]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await purchaseInvoiceService.getAll({ page, limit: 10 });
      if (response.status) {
        setInvoices(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ page: 1, limit: 100 });
      if (response.status) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemService.getAll({ page: 1, limit: 1000 });
      if (response.status) {
        setItems(response.data);
      }
    } catch (error) {}
  };

  const handleExport = async () => {
    try {
      const blob = await purchaseInvoiceService.exportExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `purchase-invoices-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      toast.error('فشل تصدير التقرير');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.status) {
        setCompanyName(response.data.companyName);
      }
    } catch (error) {}
  };

  const handlePrint = (invoice: PurchaseInvoice) => {
    setPrintingData(invoice);
    setIsPrinting(true);
  };

  useEffect(() => {
    if (!isPrinting || !printingData) return;

    const handleAfterPrint = () => {
      setIsPrinting(false);
      setPrintingData(null);
    };

    const printAfterRender = () => {
      requestAnimationFrame(() => {
        window.print();
      });
    };

    const timeoutId = window.setTimeout(printAfterRender, 500);
    window.addEventListener('afterprint', handleAfterPrint);

    const fallbackId = window.setTimeout(() => {
      if (isPrinting) {
        handleAfterPrint();
      }
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(fallbackId);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isPrinting, printingData]);

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  useEffect(() => {
    fetchSuppliers();
    fetchItems();
    fetchProfile();
  }, []);

  // Add item to invoice
  const addInvoiceItem = () => {
    if (items.length > 0) {
      setInvoiceItems(prev => [
        ...prev,
        {
          itemId: items[0]._id,
          qty: 1,
          unitCost: items[0].costPrice || 0
        }
      ]);
    }
  };

  // Update invoice item
  const updateInvoiceItem = (index: number, field: keyof PurchaseInvoiceItemForm, value: number | string) => {
    setInvoiceItems(prev => {
      const newItems = [...prev];
      if (field === 'itemId' && typeof value === 'string') {
        const item = items.find(i => i._id === value);
        if (item) {
          newItems[index] = {
            ...newItems[index],
            itemId: value,
            unitCost: item.costPrice || 0
          };
        }
      } else {
        newItems[index] = { ...newItems[index], [field]: Number(value) };
      }
      return newItems;
    });
  };

  // Remove item from invoice
  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await purchaseInvoiceService.create({
        ...formData,
        items: invoiceItems.map(item => ({
          ...item,
          lineTotal: item.qty * item.unitCost
        }))
      });

      if (response.status) {
        toast.success('تم إضافة الفاتورة بنجاح');
        setIsModalOpen(false);
        resetForm();
        fetchInvoices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل إضافة الفاتورة');
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    try {
      const response = await purchaseInvoiceService.update(editingInvoice._id, {
        ...formData,
        items: invoiceItems.map(item => ({
          ...item,
          lineTotal: item.qty * item.unitCost
        }))
      });

      if (response.status) {
        toast.success('تم تحديث الفاتورة بنجاح');
        setIsEditModalOpen(false);
        setEditingInvoice(null);
        resetForm();
        fetchInvoices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تحديث الفاتورة');
    }
  };

  const handleCancelInvoice = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذه الفاتورة؟')) return;
    try {
      const response = await purchaseInvoiceService.cancel(id);
      if (response.status) {
        toast.success('تم إلغاء الفاتورة بنجاح');
        fetchInvoices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل إلغاء الفاتورة');
    }
  };

  const resetForm = () => {
    setInvoiceItems([]);
    setFormData({
      invoiceNumber: '',
      supplierId: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      subTotal: 0,
      tax: 0,
      discount: 0,
      grandTotal: 0,
      paidAmount: 0
    });
  };

  const handleEditInvoice = (invoice: PurchaseInvoice) => {
    setEditingInvoice(invoice);
    setInvoiceItems(invoice.items.map(item => ({
      itemId: typeof item.itemId === 'string' ? item.itemId : item.itemId._id,
      qty: item.qty,
      unitCost: item.unitCost
    })));
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      supplierId: typeof invoice.supplierId === 'string' ? invoice.supplierId : invoice.supplierId._id,
      date: new Date(invoice.date).toISOString().split('T')[0],
      items: [],
      subTotal: invoice.subTotal,
      tax: invoice.tax,
      discount: invoice.discount,
      grandTotal: invoice.grandTotal,
      paidAmount: invoice.paidAmount
    });
    setIsEditModalOpen(true);
  };

  // Get supplier name
  const getSupplierName = (supplierId: string | Supplier) => {
    if (typeof supplierId === 'string') {
      const supplier = suppliers.find(s => s._id === supplierId);
      return supplier?.name || 'غير معروف';
    }
    return supplierId.name;
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="text-blue-500" />
            فواتير المشتريات
          </h1>
          <p className="text-gray-400 mt-1">إدارة فواتير مشتريات المخزن</p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            icon={<Download size={20} />}
            onClick={handleExport}
          >
            تصدير Excel
          </Button>
          <Button 
            variant="outline" 
            icon={<Printer size={20} />}
            onClick={() => window.print()}
          >
            طباعة الصفحة
          </Button>
          <Button 
            variant="primary" 
            icon={<Plus size={20} />}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            إضافة فاتورة جديدة
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400">جاري تحميل الفواتير...</p>
        </div>
      ) : (
        <div className="w-full">
          <Table data={invoices}>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المجموع الفرعي</TableHead>
                <TableHead>الضريبة</TableHead>
                <TableHead>الخصم</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المبلغ المدفوع</TableHead>
                <TableHead>حالة الدفع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => {
                  let statusClass = '';
                  let statusLabel = '';
                  switch(invoice.paymentStatus) {
                    case 'paid':
                      statusClass = 'bg-green-100 text-green-800 border-green-300';
                      statusLabel = 'مدفوعة';
                      break;
                    case 'partial':
                      statusClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                      statusLabel = 'جزئية';
                      break;
                    default:
                      statusClass = 'bg-red-100 text-red-800 border-red-300';
                      statusLabel = 'غير مدفوعة';
                  }

                  let invoiceStatusClass = '';
                  let invoiceStatusLabel = '';
                  if (invoice.status === 'cancelled') {
                    invoiceStatusClass = 'bg-red-100 text-red-800 border-red-300';
                    invoiceStatusLabel = 'ملغية';
                  } else if (invoice.status === 'posted') {
                    invoiceStatusClass = 'bg-purple-100 text-purple-800 border-purple-300';
                    invoiceStatusLabel = 'مرحّلة';
                  } else {
                    invoiceStatusClass = 'bg-blue-100 text-blue-800 border-blue-300';
                    invoiceStatusLabel = 'مسجلة';
                  }

                  return (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium text-blue-400">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{getSupplierName(invoice.supplierId)}</TableCell>
                      <TableCell>{formatCurrency(invoice.subTotal)}</TableCell>
                      <TableCell>{formatCurrency(invoice.tax)}</TableCell>
                      <TableCell>{formatCurrency(invoice.discount)}</TableCell>
                      <TableCell className="font-bold text-green-400">
                        {formatCurrency(invoice.grandTotal)}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${invoiceStatusClass}`}>
                          {invoiceStatusLabel}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handlePrint(invoice)}
                            className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                            title="طباعة الفاتورة"
                          >
                            <Printer size={16} />
                          </Button>
                          {invoice.status !== 'posted' && invoice.status !== 'cancelled' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditInvoice(invoice)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleCancelInvoice(invoice._id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <X size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-gray-500">
                    لا توجد فواتير مسجلة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="text-gray-400 hover:text-white"
          >
            <ChevronRight size={18} className="ml-1" />
            السابق
          </Button>

          <div className="flex items-center gap-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={page === pagination.totalPages}
            className="text-gray-400 hover:text-white"
          >
            التالي
            <ChevronLeft size={18} className="mr-1" />
          </Button>
        </div>
      )}

      {/* Add Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة فاتورة شراء"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveInvoice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">رقم الفاتورة</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="PI-2024-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">المورد</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">اختر المورد</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">التاريخ</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">المبلغ المدفوع</label>
              <input
                type="number"
                min="0"
                step="0.01"
                max={formData.grandTotal}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">المنتجات</h3>
              <Button type="button" variant="secondary" onClick={addInvoiceItem}>
                <Plus size={16} className="ml-1" />
                إضافة منتج
              </Button>
            </div>

            {invoiceItems.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا توجد منتجات في الفاتورة</p>
            ) : (
              <div className="space-y-2">
                {invoiceItems.map((item, index) => {
                  const product = items.find(i => i._id === item.itemId);
                  return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">المنتج</label>
                        <select
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.itemId}
                          onChange={(e) => updateInvoiceItem(index, 'itemId', e.target.value)}
                        >
                          {items.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} ({product.modelNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">الكمية</label>
                        <input
                          type="number"
                          min="0.000001"
                          step="0.000001"
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.qty}
                          onChange={(e) => updateInvoiceItem(index, 'qty', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">سعر الوحدة</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.unitCost}
                          onChange={(e) => updateInvoiceItem(index, 'unitCost', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">الإجمالي: {formatCurrency(item.qty * item.unitCost)}</span>
                        <Button
                          type="button"
                          variant="danger"
                          size="icon"
                          onClick={() => removeInvoiceItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الضريبة</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الخصم</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl flex flex-col items-center justify-center">
              <p className="text-sm text-gray-400">الإجمالي الكلي</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(formData.grandTotal)}
              </p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" variant="primary" className="flex-1">
              حفظ الفاتورة
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل فاتورة شراء"
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdateInvoice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">رقم الفاتورة</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">المورد</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">التاريخ</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">المبلغ المدفوع</label>
              <input
                type="number"
                min="0"
                step="0.01"
                max={formData.grandTotal}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">المنتجات</h3>
              <Button type="button" variant="secondary" onClick={addInvoiceItem}>
                <Plus size={16} className="ml-1" />
                إضافة منتج
              </Button>
            </div>

            {invoiceItems.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا توجد منتجات في الفاتورة</p>
            ) : (
              <div className="space-y-2">
                {invoiceItems.map((item, index) => {
                  return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">المنتج</label>
                        <select
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.itemId}
                          onChange={(e) => updateInvoiceItem(index, 'itemId', e.target.value)}
                        >
                          {items.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} ({product.modelNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">الكمية</label>
                        <input
                          type="number"
                          min="0.000001"
                          step="0.000001"
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.qty}
                          onChange={(e) => updateInvoiceItem(index, 'qty', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">سعر الوحدة</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.unitCost}
                          onChange={(e) => updateInvoiceItem(index, 'unitCost', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">الإجمالي: {formatCurrency(item.qty * item.unitCost)}</span>
                        <Button
                          type="button"
                          variant="danger"
                          size="icon"
                          onClick={() => removeInvoiceItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الضريبة</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الخصم</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl flex flex-col items-center justify-center">
              <p className="text-sm text-gray-400">الإجمالي الكلي</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(formData.grandTotal)}
              </p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" variant="primary" className="flex-1">
              حفظ التعديلات
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      {isPrinting && printingData && (
        <PrintInvoice 
          type="purchase"
          invoice={printingData}
          companyName={companyName} 
        />
      )}
    </div>
  );
}
