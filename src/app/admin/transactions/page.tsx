'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { superAdminService } from '@/services/api';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Loader2,
  Calendar,
  User as UserIcon,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  MessageCircle,
  FileDown,
  FileText,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [rejectModal, setRejectModal] = useState<{show: boolean, transactionId: string}>({ show: false, transactionId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await superAdminService.getTransactions();
      if (response.status) setTransactions(response.data);
    } catch (error: any) {
      toast.error('فشل في تحميل المعاملات');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await superAdminService.exportTransactions();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تصدير ملف Excel بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير البيانات');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Transactions Report", 14, 15);
      
      const tableData = filteredTransactions.map(t => [
        t.customerId,
        t.amount,
        t.referenceNumber,
        t.planRequested,
        t.status,
        new Date(t.createdAt).toLocaleDateString()
      ]);

      (doc as any).autoTable({
        head: [['CID', 'Amount', 'Ref #', 'Plan', 'Status', 'Date']],
        body: tableData,
        startY: 20,
      });

      doc.save(`transactions-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('تم تصدير ملف PDF بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير PDF');
    }
  };

  const handleApprove = async (transactionId: string) => {
    if (!confirm('هل تريد تأكيد استلام الدفعة وتفعيل الاشتراك؟')) return;
    
    setIsProcessing(true);
    try {
      // نرسل body فارغ لتجنب الأخطاء في الـ backend
      const response = await superAdminService.approveTransaction(transactionId, {});
      if (response.status) {
        toast.success(response.message);
        fetchTransactions();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في قبول العملية');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('يرجى ذكر سبب الرفض');
    
    setIsProcessing(true);
    try {
      const response = await superAdminService.rejectTransaction(rejectModal.transactionId, { reason: rejectReason });
      if (response.status) {
        toast.success(response.message);
        setRejectModal({ show: false, transactionId: '' });
        setRejectReason('');
        fetchTransactions();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في رفض العملية');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesDate = !dateFilter || new Date(t.createdAt).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">مراجعة المدفوعات</h1>
            <p className="text-gray-400">مراجعة وتأكيد عمليات الدفع عبر فودافون كاش وتفعيل الاشتراكات</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              className="rounded-2xl border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 text-purple-400 font-bold px-6 py-3 flex items-center gap-2"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
              Excel
            </Button>
            <Button 
              variant="outline" 
              className="rounded-2xl border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 text-red-400 font-bold px-6 py-3 flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <FileText size={20} />
              PDF
            </Button>
            
            <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-2xl px-4 py-2">
              <Filter size={18} className="text-gray-500" />
              <select 
                className="bg-transparent text-gray-300 text-sm outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="completed">تم التفعيل</option>
                <option value="failed">مرفوضة</option>
              </select>
            </div>

            <input 
              type="date"
              className="bg-gray-800/50 border border-gray-700 rounded-2xl px-4 py-2 text-gray-300 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            <div className="relative w-full md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="بحث بالرقم، الكود، أو الاسم..."
                className="w-full pr-12 pl-4 py-3 bg-gray-800/50 border border-gray-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-gray-700/50 bg-gray-800/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[800px]">
              <thead className="bg-gray-800/50 text-gray-400 text-sm font-bold border-b border-gray-700/50">
                <tr>
                  <th className="px-6 py-5">العميل</th>
                  <th className="px-6 py-5">المبلغ</th>
                  <th className="px-6 py-5">رقم العملية (Vodafone)</th>
                  <th className="px-6 py-5">الخطة المطلوبة</th>
                  <th className="px-6 py-5">التاريخ</th>
                  <th className="px-6 py-5">الحالة</th>
                  <th className="px-6 py-5">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30 text-gray-300">
                {filteredTransactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center text-blue-400">
                          <UserIcon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{t.user?.username || 'مستخدم غير معروف'}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{t.customerId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20 w-fit">
                          {t.amount} ج.م
                        </span>
                        {t.user?.email && <span className="text-[10px] text-gray-500 mt-1">{t.user.email}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-purple-400 bg-purple-500/5 px-3 py-1 rounded-lg border border-purple-500/10 tracking-wider">
                        {t.referenceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-5 capitalize">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-blue-400" />
                        {t.planRequested}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(t.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${
                        t.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        t.status === 'failed' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {t.status === 'completed' ? <CheckCircle size={12} /> : 
                         t.status === 'failed' ? <XCircle size={12} /> : 
                         <Clock size={12} />}
                        {t.status === 'completed' ? 'تم التفعيل' : t.status === 'failed' ? 'مرفوضة' : 'بانتظار المراجعة'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {t.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-xl px-4 py-2 text-xs font-bold shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 border-none"
                            onClick={() => handleApprove(t._id)}
                            disabled={isProcessing}
                          >
                            <Check size={14} className="ml-1" />
                            قبول
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl px-4 py-2 text-xs font-bold border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => setRejectModal({ show: true, transactionId: t._id })}
                            disabled={isProcessing}
                          >
                            <X size={14} className="ml-1" />
                            رفض
                          </Button>
                        </div>
                      )}
                      {t.notes && (
                        <div className="text-[10px] text-gray-500 mt-1 max-w-[150px] truncate" title={t.notes}>
                          ملاحظة: {t.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center">
              <CreditCard size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-lg">لا توجد معاملات لعرضها</p>
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {rejectModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border border-red-500/30 animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">رفض عملية الدفع</h2>
                <p className="text-gray-400 text-sm">سيتم إخطار المستخدم برفض العملية مع السبب المذكور.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-right">
                  <label className="text-sm text-gray-400 pr-2 flex items-center gap-2">
                    <MessageCircle size={14} />
                    سبب الرفض (إلزامي)
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                    placeholder="مثال: رقم العملية غير صحيح / المبلغ المحول ناقص..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="primary" 
                    className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 border-none font-bold"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'تأكيد الرفض'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 py-4 rounded-2xl border-gray-700 font-bold"
                    onClick={() => {
                      setRejectModal({ show: false, transactionId: '' });
                      setRejectReason('');
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
