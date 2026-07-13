'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight, FileText } from 'lucide-react';
import { representativeService, saleService } from '@/services/api';
import { Representative, SaleInvoice } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RepresentativesPage() {
  const [data, setData] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<Representative | null>(null);
  
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesPage, setSalesPage] = useState(1);
  const [salesPagination, setSalesPagination] = useState({ totalPages: 1, total: 0 });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    commissionRate: 0,
    hiredAt: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await representativeService.getAll({ page, limit: 10, search, includeInactive });
      if (response.status) {
        setData(response.data || []);
        setPagination(response.pagination || { totalPages: 1, total: 0 });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المناديب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, includeInactive]);

  const canSearch = useMemo(() => search.trim().length >= 0, [search]);

  useEffect(() => {
    if (!canSearch) return;
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 350);
    return () => clearTimeout(t);
  }, [search, canSearch]);

  const openCreate = () => {
    setForm({ name: '', phone: '', address: '', commissionRate: 0, hiredAt: '' });
    setIsModalOpen(true);
  };

  const openEdit = (rep: Representative) => {
    setEditing(rep);
    setForm({
      name: rep.name || '',
      phone: rep.phone || '',
      address: rep.address || '',
      commissionRate: rep.commissionRate || 0,
      hiredAt: rep.hiredAt ? String(rep.hiredAt).slice(0, 10) : ''
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await representativeService.create({
        name: form.name,
        phone: form.phone || undefined,
        address: form.address || undefined,
        commissionRate: Number(form.commissionRate) || 0,
        hiredAt: form.hiredAt || undefined
      });
      if (response.status) {
        toast.success('تم إضافة المندوب');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل إضافة المندوب');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const response = await representativeService.update(editing._id, {
        name: form.name,
        phone: form.phone || '',
        address: form.address || '',
        commissionRate: Number(form.commissionRate) || 0,
        hiredAt: form.hiredAt || undefined,
        isActive: editing.isActive
      });
      if (response.status) {
        toast.success('تم تحديث المندوب');
        setIsEditModalOpen(false);
        setEditing(null);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث المندوب');
    }
  };

  const handleToggleActive = async (rep: Representative) => {
    try {
      const response = await representativeService.update(rep._id, { isActive: !rep.isActive });
      if (response.status) {
        toast.success(rep.isActive ? 'تم تعطيل المندوب' : 'تم تفعيل المندوب');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الحالة');
    }
  };

  const handleDelete = async (rep: Representative) => {
    if (!confirm('هل أنت متأكد من تعطيل هذا المندوب؟')) return;
    try {
      const response = await representativeService.delete(rep._id);
      if (response.status) {
        toast.success('تم تعطيل المندوب');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تعطيل المندوب');
    }
  };

  const handleViewSales = async (rep: Representative) => {
    setSelectedRep(rep);
    setSalesPage(1);
    setIsSalesModalOpen(true);
    await fetchSalesForRep(rep._id, 1);
  };

  const fetchSalesForRep = async (repId: string, currentPage: number) => {
    setSalesLoading(true);
    try {
      const response = await saleService.getByRepresentative(repId, { page: currentPage, limit: 10 });
      if (response.status) {
        setSales(response.data || []);
        setSalesPagination(response.pagination || { totalPages: 1, total: 0 });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المبيعات');
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    if (isSalesModalOpen && selectedRep) {
      fetchSalesForRep(selectedRep._id, salesPage);
    }
  }, [salesPage]);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-500" />
            إدارة المناديب
          </h1>
          <p className="text-gray-400 mt-1">إنشاء وتعديل وتعطيل المناديب وربطهم بفواتير المبيعات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIncludeInactive(!includeInactive)}>
            <span className="flex items-center gap-2">
              {includeInactive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {includeInactive ? 'عرض غير النشط' : 'إخفاء غير النشط'}
            </span>
          </Button>
          <Button variant="success" icon={<Plus size={18} />} onClick={openCreate}>
            إضافة مندوب
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Search size={16} className="text-blue-500" />
            بحث بالاسم
          </label>
          <input
            type="text"
            placeholder="اكتب اسم المندوب..."
            className="bg-gray-800 border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            className="w-full rounded-xl py-2.5"
            onClick={() => {
              setSearch('');
              setPage(1);
            }}
          >
            إعادة تعيين
          </Button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table data={data}>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">الاسم</TableHead>
                <TableHead className="text-gray-400">الهاتف</TableHead>
                <TableHead className="text-gray-400">العنوان</TableHead>
                <TableHead className="text-gray-400">العمولة %</TableHead>
                <TableHead className="text-gray-400">الحالة</TableHead>
                <TableHead className="text-gray-400 text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-gray-400">جاري تحميل المناديب...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <p className="text-gray-500">لا يوجد مناديب</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((rep) => (
                  <TableRow key={rep._id} className="border-gray-800 hover:bg-gray-800/30 transition-colors group">
                    <TableCell className="text-white font-medium">{rep.name}</TableCell>
                    <TableCell className="text-gray-300">{rep.phone || '-'}</TableCell>
                    <TableCell className="text-gray-300">{rep.address || '-'}</TableCell>
                    <TableCell className="text-gray-300">{rep.commissionRate ?? 0}</TableCell>
                    <TableCell className={rep.isActive ? 'text-green-400 font-bold' : 'text-gray-500'}>
                      {rep.isActive ? 'نشط' : 'غير نشط'}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleViewSales(rep)}
                          className="p-2 text-gray-500 hover:text-green-400 transition-colors bg-gray-800/50 rounded-lg"
                          title="عرض المبيعات"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(rep)}
                          className="p-2 text-gray-500 hover:text-blue-400 transition-colors bg-gray-800/50 rounded-lg"
                          title={rep.isActive ? 'تعطيل' : 'تفعيل'}
                        >
                          {rep.isActive ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                        </button>
                        <button
                          onClick={() => openEdit(rep)}
                          className="p-2 text-gray-500 hover:text-yellow-400 transition-colors bg-gray-800/50 rounded-lg"
                          title="تعديل"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(rep)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-gray-800/50 rounded-lg"
                          title="تعطيل"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>إجمالي: {pagination.total}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            السابق
          </Button>
          <span>
            صفحة {page} / {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
            disabled={page >= (pagination.totalPages || 1)}
          >
            التالي
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة مندوب">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الاسم</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">الهاتف</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">العمولة %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">العنوان</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">تاريخ التعيين</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.hiredAt}
                onChange={(e) => setForm({ ...form, hiredAt: e.target.value })}
              />
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="submit" variant="success" className="flex-1">
                حفظ
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isEditModalOpen && editing && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="تعديل مندوب">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الاسم</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">الهاتف</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">العمولة %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">العنوان</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">تاريخ التعيين</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.hiredAt}
                onChange={(e) => setForm({ ...form, hiredAt: e.target.value })}
              />
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="submit" variant="success" className="flex-1">
                حفظ
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isSalesModalOpen && selectedRep && (
        <Modal 
          isOpen={isSalesModalOpen} 
          onClose={() => setIsSalesModalOpen(false)} 
          title={`مبيعات المندوب: ${selectedRep.name}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {salesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-gray-400">جاري تحميل المبيعات...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">لا توجد مبيعات لهذا المندوب</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table data={sales}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale._id}>
                          <TableCell className="text-white">{sale.name}</TableCell>
                          <TableCell className="text-gray-300">{sale.quantity}</TableCell>
                          <TableCell className="text-gray-300">{formatCurrency(sale.price)}</TableCell>
                          <TableCell className="text-gray-300 font-bold">{formatCurrency(sale.total)}</TableCell>
                          <TableCell className="text-gray-300">{formatDate(sale.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {salesPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-gray-400">إجمالي: {salesPagination.total}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                        disabled={salesPage <= 1}
                      >
                        السابق
                      </Button>
                      <span className="text-sm text-gray-400 px-2">
                        صفحة {salesPage} / {salesPagination.totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSalesPage(p => Math.min(salesPagination.totalPages, p + 1))}
                        disabled={salesPage >= salesPagination.totalPages}
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

