'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
  Wallet,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  X,
  BarChart3
} from 'lucide-react';
import { clientService } from '@/services/api';
import { Client, SaleInvoice } from '@/types';
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
import Modal from '@/components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClientBalance {
  totalInvoiced: number;
  totalPaid: number;
  totalRemaining: number;
  invoiceCount: number;
}

interface BalanceData {
  client: Client;
  balance: ClientBalance;
  invoices: SaleInvoice[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 }).format(amount);

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

const paymentStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  paid:    { label: 'مدفوع',          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 size={12} /> },
  partial: { label: 'مدفوع جزئياً',  color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',      icon: <Clock size={12} /> },
  unpaid:  { label: 'غير مدفوع',      color: 'bg-red-500/10 text-red-400 border-red-500/30',            icon: <AlertCircle size={12} /> }
};

// ─── Balance Modal Component ──────────────────────────────────────────────────
function ClientBalanceModal({ 
  clientId, 
  onClose 
}: { 
  clientId: string; 
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BalanceData | null>(null);
  const [page, setPage] = useState(1);

  const fetchBalance = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await clientService.getBalance(clientId, { page: p, limit: 8 });
      if (res.status) setData(res.data);
    } catch {
      toast.error('تعذّر جلب بيانات الرصيد');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchBalance(page); }, [page, fetchBalance]);

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-start justify-center sm:pt-16 p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl flex flex-col rounded-2xl border border-gray-700 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', maxHeight: 'calc(100vh - 80px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — always visible, never scrolls */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-700"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Wallet className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {loading || !data ? 'جاري التحميل...' : `الرصيد المالي — ${data.client.name}`}
              </h2>
              {data && <p className="text-xs text-gray-400">كود العميل: {data.client.code}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-blue-400" size={36} />
            <p className="text-gray-400">جاري جلب البيانات المالية...</p>
          </div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Invoiced */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-2">
                  <BarChart3 size={14} />
                  إجمالي الفواتير
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(data.balance.totalInvoiced)}</p>
                <p className="text-xs text-gray-400">{data.balance.invoiceCount} فاتورة</p>
              </div>

              {/* Total Paid */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-2">
                  <CheckCircle2 size={14} />
                  إجمالي المدفوع
                </div>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(data.balance.totalPaid)}</p>
                <p className="text-xs text-gray-400">
                  {data.balance.totalInvoiced > 0
                    ? `${((data.balance.totalPaid / data.balance.totalInvoiced) * 100).toFixed(1)}% من الإجمالي`
                    : '—'}
                </p>
              </div>

              {/* Remaining */}
              <div className={`rounded-xl border p-4 space-y-1 ${
                data.balance.totalRemaining > 0
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-gray-600/30 bg-gray-700/20'
              }`}>
                <div className={`flex items-center gap-2 text-xs font-medium mb-2 ${
                  data.balance.totalRemaining > 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  <TrendingDown size={14} />
                  المتبقي (الديون)
                </div>
                <p className={`text-xl font-bold ${
                  data.balance.totalRemaining > 0 ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {formatCurrency(data.balance.totalRemaining)}
                </p>
                <p className="text-xs text-gray-400">
                  {data.balance.totalRemaining === 0 ? 'لا توجد ديون ✓' : 'مستحق السداد'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {data.balance.totalInvoiced > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>نسبة السداد</span>
                  <span>{((data.balance.totalPaid / data.balance.totalInvoiced) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (data.balance.totalPaid / data.balance.totalInvoiced) * 100)}%`,
                      background: 'linear-gradient(90deg, #10b981, #059669)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Invoices Table */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-200">سجل الفواتير</h3>
              </div>

              {data.invoices.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  لا توجد فواتير مرتبطة بهذا العميل
                </div>
              ) : (
                <div className="rounded-xl border border-gray-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">التاريخ</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">الصنف</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">الكمية</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">الإجمالي</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">المدفوع</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">المتبقي</th>
                        <th className="text-center px-4 py-3 text-gray-400 font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.invoices.map((inv, idx) => {
                        const remaining = inv.total - inv.paidAmount;
                        const status = paymentStatusConfig[inv.paymentStatus] ?? paymentStatusConfig['unpaid'];
                        return (
                          <tr
                            key={inv._id}
                            className="border-b border-gray-800 last:border-0 hover:bg-white/[0.02] transition"
                          >
                            <td className="px-4 py-3 text-gray-300 text-xs">{formatDate(inv.createdAt)}</td>
                            <td className="px-4 py-3 text-white font-medium">{inv.name}</td>
                            <td className="px-4 py-3 text-gray-300">{inv.quantity}</td>
                            <td className="px-4 py-3 text-blue-300 font-semibold">{formatCurrency(inv.total)}</td>
                            <td className="px-4 py-3 text-emerald-400">{formatCurrency(inv.paidAmount)}</td>
                            <td className="px-4 py-3 font-medium">
                              <span className={remaining > 0 ? 'text-red-400' : 'text-gray-400'}>
                                {formatCurrency(remaining)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setPage(p => Math.max(1, p - 1)); }}
                  disabled={page === 1 || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} /> السابق
                </button>
                <span className="text-xs text-gray-400">
                  {page} / {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => { setPage(p => Math.min(data.pagination.totalPages, p + 1)); }}
                  disabled={page === data.pagination.totalPages || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  التالي <ChevronLeft size={16} />
                </button>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                style={{ background: 'rgba(15,23,42,0.6)' }}>
                <Loader2 className="animate-spin text-blue-400" size={32} />
              </div>
            )}
          </div>
        ) : null}
        </div>{/* end scrollable body */}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [balanceClientId, setBalanceClientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientService.getAll({ page, limit: 10, search });
      if (response.status) {
        setClients(response.data);
        setPagination(response.pagination);
      }
    } catch {
      toast.error('حدث خطأ أثناء جلب العملاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من تعطيل حساب هذا العميل؟')) return;
    try {
      const response = await clientService.delete(id);
      if (response.status) {
        toast.success('تم تعطيل العميل بنجاح');
        fetchClients();
      }
    } catch {
      toast.error('فشل التعطيل');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await clientService.create(formData);
      if (response.status) {
        toast.success('تم إضافة العميل بنجاح');
        setIsModalOpen(false);
        resetForm();
        fetchClients();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ العميل');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setFormLoading(true);
    try {
      const response = await clientService.update(editingClient._id, formData);
      if (response.status) {
        toast.success('تم تحديث العميل بنجاح');
        setIsEditModalOpen(false);
        setEditingClient(null);
        resetForm();
        fetchClients();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث العميل');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', address: '' });
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-500" />
            بيانات العملاء (Master Data)
          </h1>
          <p className="text-gray-400 mt-1">إدارة بيانات العملاء والرصيد المالي والفواتير</p>
        </div>

        <Button 
          variant="primary" 
          icon={<Plus size={20} />}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          إضافة عميل جديد
        </Button>
      </div>

      {/* Search Input */}
      <div className="glass p-6 rounded-2xl border border-gray-700 shadow-xl">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="ابحث عن عميل بالاسم أو رقم التليفون..."
            className="w-full pr-12 pl-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400">جاري تحميل العملاء...</p>
        </div>
      ) : (
        <div className="w-full">
          <Table data={clients}>
            <TableHeader>
              <TableRow>
                <TableHead>كود العميل</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>التليفون</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell className="font-bold text-blue-400">{client.code}</TableCell>
                    <TableCell className="font-semibold text-white">{client.name}</TableCell>
                    <TableCell>
                      {client.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-500" />
                          <span>{client.phone}</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {client.email ? (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-500" />
                          <span>{client.email}</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {client.address ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          <span>{client.address}</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        client.isActive 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {client.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {/* Balance Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setBalanceClientId(client._id)}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                          title="عرض الرصيد المالي"
                        >
                          <Wallet size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(client)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <Edit2 size={16} />
                        </Button>
                        {client.isActive && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(client._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            title="تعطيل العميل"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    لا يوجد عملاء مسجلين
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
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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

      {/* ─── Balance Modal ──────────────────────────────────── */}
      {balanceClientId && (
        <ClientBalanceModal
          clientId={balanceClientId}
          onClose={() => setBalanceClientId(null)}
        />
      )}

      {/* ─── Add Client Modal ───────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة عميل جديد"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">اسم العميل *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أحمد محمد علي"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">رقم التليفون</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="client@domain.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">العنوان</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="القاهرة، مصر"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" loading={formLoading}>
              إضافة
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

      {/* ─── Edit Client Modal ──────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل بيانات العميل"
        maxWidth="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">اسم العميل *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">رقم التليفون</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">العنوان</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" loading={formLoading}>
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
    </div>
  );
}
