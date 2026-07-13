'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText
} from 'lucide-react';
import { supplierService, purchaseInvoiceService } from '@/services/api';
import { Supplier, PurchaseInvoice } from '@/types';
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    balance: 0
  });

  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesPagination, setInvoicesPagination] = useState({ totalPages: 1, total: 0 });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierService.getAll({ page, limit: 10 });
      if (response.status) {
        setSuppliers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الموردين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page]);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      balance: supplier.balance
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      const response = await supplierService.delete(id);
      if (response.status) {
        toast.success('تم الحذف بنجاح');
        fetchSuppliers();
      }
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  const handleViewInvoices = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setInvoicesPage(1);
    setIsInvoicesModalOpen(true);
    await fetchInvoicesForSupplier(supplier._id, 1);
  };

  const fetchInvoicesForSupplier = async (supplierId: string, currentPage: number) => {
    setInvoicesLoading(true);
    try {
      const response = await purchaseInvoiceService.getBySupplier(supplierId, { page: currentPage, limit: 10 });
      if (response.status) {
        setPurchaseInvoices(response.data || []);
        setInvoicesPagination(response.pagination || { totalPages: 1, total: 0 });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الفواتير');
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    if (isInvoicesModalOpen && selectedSupplier) {
      fetchInvoicesForSupplier(selectedSupplier._id, invoicesPage);
    }
  }, [invoicesPage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let response;
      if (editingSupplier) {
        response = await supplierService.update(editingSupplier._id, formData);
      } else {
        response = await supplierService.create(formData);
      }

      if (response.status) {
        toast.success(editingSupplier ? 'تم التعديل بنجاح' : 'تم الإضافة بنجاح');
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setEditingSupplier(null);
        setFormData({ name: '', phone: '', email: '', address: '', balance: 0 });
        fetchSuppliers();
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="text-blue-500" />
            الموردين
          </h1>
          <p className="text-gray-400 mt-1">إدارة الموردين</p>
        </div>

        <Button 
          variant="primary" 
          icon={<Plus size={20} />}
          onClick={() => {
            setEditingSupplier(null);
            setFormData({ name: '', phone: '', email: '', address: '', balance: 0 });
            setIsModalOpen(true);
          }}
        >
          إضافة مورد جديد
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400">جار تحميل الموردين...</p>
        </div>
      ) : (
        <div className="w-full">
          <Table data={suppliers}>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد الالكتروني</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <TableRow key={supplier._id}>
                    <TableCell className="font-medium text-white">{supplier.name}</TableCell>
                    <TableCell>
                      {supplier.phone ? (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone size={16} />
                          {supplier.phone}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {supplier.email ? (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail size={16} />
                          {supplier.email}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {supplier.address ? (
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin size={16} />
                          {supplier.address}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${supplier.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatCurrency(supplier.balance)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(supplier.createdAt || '')}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewInvoices(supplier)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          title="عرض الفواتير"
                        >
                          <FileText size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(supplier._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    لا يوجد موردين مسجلين
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
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === p 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p}
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

      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen || isEditModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'تعديل مورد' : 'إضافة مورد جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">الاسم</label>
            <input
              type="text"
              required
              placeholder="اسم المورد"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الهاتف</label>
              <input
                type="text"
                placeholder="رقم الهاتف"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">البريد الالكتروني</label>
              <input
                type="email"
                placeholder="البريد الالكتروني"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">العنوان</label>
            <input
              type="text"
              placeholder="العنوان"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {editingSupplier && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <DollarSign size={16} />
                الرصيد
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" loading={formLoading}>
              حفظ
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditModalOpen(false);
                setEditingSupplier(null);
              }}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      {isInvoicesModalOpen && selectedSupplier && (
        <Modal 
          isOpen={isInvoicesModalOpen} 
          onClose={() => setIsInvoicesModalOpen(false)} 
          title={`فواتير المورد: ${selectedSupplier.name}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {invoicesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-gray-400">جاري تحميل الفواتير...</p>
              </div>
            ) : purchaseInvoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">لا توجد فواتير لهذا المورد</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table data={purchaseInvoices}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>المدفوع</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseInvoices.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell className="text-white">{invoice.invoiceNumber}</TableCell>
                          <TableCell className="text-gray-300">{formatDate(invoice.date)}</TableCell>
                          <TableCell className="text-gray-300 font-bold">{formatCurrency(invoice.grandTotal)}</TableCell>
                          <TableCell className="text-gray-300">{formatCurrency(invoice.paidAmount)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              invoice.paymentStatus === 'paid' ? 'bg-green-900/50 text-green-400' :
                              invoice.paymentStatus === 'partial' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              {invoice.paymentStatus === 'paid' ? 'مدفوع' :
                               invoice.paymentStatus === 'partial' ? 'جزئي' : 'غير مدفوع'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {invoicesPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-gray-400">إجمالي: {invoicesPagination.total}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setInvoicesPage(p => Math.max(1, p - 1))}
                        disabled={invoicesPage <= 1}
                      >
                        السابق
                      </Button>
                      <span className="text-sm text-gray-400 px-2">
                        صفحة {invoicesPage} / {invoicesPagination.totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setInvoicesPage(p => Math.min(invoicesPagination.totalPages, p + 1))}
                        disabled={invoicesPage >= invoicesPagination.totalPages}
                      >
                        التالي
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
