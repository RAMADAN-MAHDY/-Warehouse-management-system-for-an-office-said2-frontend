'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { superAdminService } from '@/services/api';
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  ShieldCheck,
  MoreVertical,
  Loader2,
  Trash2,
  Building2,
  Calendar,
  AlertTriangle,
  CreditCard,
  Zap,
  Crown,
  Info,
  FileDown,
  Settings2,
  Clock,
  Check,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [deleteModal, setDeleteModal] = useState<{show: boolean, userId: string, username: string}>({ show: false, userId: '', username: '' });
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Subscription Modal State
  const [subModal, setSubModal] = useState<{
    show: boolean, 
    userId: string, 
    username: string,
    currentPlan: string,
    currentStatus: string
  }>({ 
    show: false, 
    userId: '', 
    username: '', 
    currentPlan: 'free', 
    currentStatus: 'active' 
  });
  const [subForm, setSubForm] = useState({ planType: '', status: '', reason: '' });
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await superAdminService.getUsers();
      if (response.status) setUsers(response.data);
    } catch (error: any) {
      toast.error('فشل في تحميل قائمة المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!subForm.reason.trim()) return toast.error('يرجى ذكر سبب التعديل');
    
    setIsUpdatingSub(true);
    try {
      const response = await superAdminService.updateUserSubscription(subModal.userId, subForm);
      if (response.status) {
        toast.success(response.message);
        setSubModal({ ...subModal, show: false });
        setSubForm({ planType: '', status: '', reason: '' });
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الاشتراك');
    } finally {
      setIsUpdatingSub(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await superAdminService.exportUsers();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
      doc.text("Users Report", 14, 15);
      
      const tableData = filteredUsers.map(user => [
        user.customerId,
        user.username,
        user.companyName,
        user.subscription?.planType || 'free',
        user.subscription?.status || 'active',
        new Date(user.createdAt).toLocaleDateString()
      ]);

      (doc as any).autoTable({
        head: [['CID', 'Username', 'Company', 'Plan', 'Status', 'Joined']],
        body: tableData,
        startY: 20,
      });

      doc.save(`users-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('تم تصدير ملف PDF بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير PDF');
    }
  };

  const handleStatusUpdate = async (userId: string, isBanned: boolean) => {
    try {
      const response = await superAdminService.updateUser(userId, { isBanned });
      if (response.status) {
        toast.success(isBanned ? 'تم حظر المستخدم بنجاح' : 'تم إلغاء حظر المستخدم');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error('فشل في تحديث حالة المستخدم');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteReason.trim()) return toast.error('يرجى ذكر سبب الحذف النهائي');
    
    setIsDeleting(true);
    try {
      const response = await superAdminService.deleteUser(deleteModal.userId, { reason: deleteReason });
      if (response.status) {
        toast.success(response.message);
        setDeleteModal({ show: false, userId: '', username: '' });
        setDeleteReason('');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف المستخدم');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto sm:py-8 sm:px-4 p-2 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">إدارة المستخدمين</h1>
            <p className="text-gray-400">إدارة حسابات المستخدمين، الصلاحيات، والاشتراكات</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              className="rounded-2xl border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 text-purple-400 font-bold px-6 py-3 flex items-center gap-2"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
              تصدير Excel
            </Button>
            {/* <Button 
              variant="outline" 
              className="rounded-2xl border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 text-red-400 font-bold px-6 py-3 flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <FileText size={20} />
              تصدير PDF
            </Button> */}
            <div className="relative w-full md:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="بحث باسم المستخدم، الشركة، أو الكود..."
                className="w-full pr-12 pl-4 py-3 bg-gray-800/50 border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className={`glass-card p-6 rounded-[2.5rem] border transition-all flex flex-col ${
              user.isBanned ? 'border-red-500/30 bg-red-500/5' : 'border-gray-700/50 bg-gray-800/20'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  user.isBanned ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                }`}>
                  <Users size={28} />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`rounded-xl border-gray-700 ${user.isBanned ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                    onClick={() => handleStatusUpdate(user._id, !user.isBanned)}
                    title={user.isBanned ? "إلغاء الحظر" : "حظر المستخدم"}
                  >
                    {user.isBanned ? <CheckCircle size={18} /> : <Ban size={18} />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-gray-700 text-purple-400 hover:bg-purple-500/10"
                    onClick={() => {
                      setSubModal({
                        show: true,
                        userId: user._id,
                        username: user.username,
                        currentPlan: user.subscription?.planType || 'free',
                        currentStatus: user.subscription?.status || 'active'
                      });
                      setSubForm({
                        planType: user.subscription?.planType || 'free',
                        status: user.subscription?.status || 'active',
                        reason: ''
                      });
                    }}
                    title="إدارة الاشتراك"
                  >
                    <Settings2 size={18} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-gray-700 text-red-500 hover:bg-red-500/10"
                    onClick={() => setDeleteModal({ show: true, userId: user._id, username: user.username })}
                    title="حذف نهائي"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{user.username}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Building2 size={14} />
                    <span>{user.companyName}</span>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 font-bold">الاشتراك الحالي</span>
                    <div className={`px-3 py-0.5 rounded-full text-[10px] font-bold border ${
                      user.subscription?.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {user.subscription?.status === 'active' ? 'نشط' : (user.subscription?.status || 'لا يوجد')}
                    </div>
                  </div>
                  
                  {user.subscription ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white text-sm font-medium">
                        {user.subscription.planType === 'professional' ? <Crown size={14} className="text-amber-400" /> : <Zap size={14} className="text-blue-400" />}
                        <span className="capitalize">{user.subscription.planType}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>ينتهي في: {new Date(user.subscription.endDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 italic">لا يوجد اشتراك مسجل</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 block">كود العميل</span>
                    <span className="text-sm font-mono text-purple-400">{user.customerId}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500 block">عضو منذ</span>
                    <span className="text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border border-red-500/30 animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <AlertTriangle size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">تأكيد الحذف النهائي</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  أنت على وشك حذف المستخدم <span className="text-red-400 font-bold">"{deleteModal.username}"</span> وكافة بياناته نهائياً.
                  <br />
                  <span className="text-red-500 font-bold mt-2 block italic">تحذير: هذا الإجراء لا يمكن التراجع عنه وسيمسح كافة الفواتير والمخزون والمصروفات!</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-right">
                  <label className="text-sm text-gray-400 pr-2">سبب الحذف النهائي (إلزامي)</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                    placeholder="مثال: طلب العميل حذف حسابه / انتهاك سياسات الاستخدام..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="primary" 
                    className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 border-none font-bold"
                    onClick={handlePermanentDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="animate-spin mx-auto" /> : 'تأكيد الحذف النهائي'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 py-4 rounded-2xl border-gray-700 font-bold"
                    onClick={() => {
                      setDeleteModal({ show: false, userId: '', username: '' });
                      setDeleteReason('');
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Modal */}
        {subModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border border-purple-500/30 animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                  <Settings2 size={32} className="text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">إدارة اشتراك المستخدم</h2>
                <p className="text-gray-400 text-sm font-medium">{subModal.username}</p>
              </div>

              <div className="space-y-5">
                {/* Plan Type Selection */}
                <div className="space-y-2 text-right">
                  <label className="text-sm text-gray-400 pr-2 block">نوع الخطة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['free', 'basic', 'professional'].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setSubForm({ ...subForm, planType: plan })}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all capitalize flex flex-col items-center gap-1 ${
                          subForm.planType === plan 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' 
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {plan === 'professional' ? <Crown size={14} /> : plan === 'basic' ? <Zap size={14} /> : <Info size={14} />}
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2 text-right">
                  <label className="text-sm text-gray-400 pr-2 block">حالة الاشتراك</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'active', label: 'نشط', icon: Check, color: 'text-green-400' },
                      { id: 'expired', label: 'منتهي', icon: Clock, color: 'text-amber-400' },
                      { id: 'cancelled', label: 'ملغي', icon: Ban, color: 'text-red-400' }
                    ].map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setSubForm({ ...subForm, status: status.id })}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1 ${
                          subForm.status === status.id 
                            ? 'bg-gray-700 border-gray-500 text-white shadow-lg shadow-black/20' 
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <status.icon size={14} className={subForm.status === status.id ? 'text-white' : status.color} />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm text-gray-400 pr-2 block">سبب التعديل (إلزامي)</label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    placeholder="مثال: ترقية الخطة بعد تأكيد الدفع / تمديد الاشتراك يدوياً..."
                    value={subForm.reason}
                    onChange={(e) => setSubForm({ ...subForm, reason: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="primary" 
                    className="flex-1 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 border-none font-bold"
                    onClick={handleUpdateSubscription}
                    disabled={isUpdatingSub}
                  >
                    {isUpdatingSub ? <Loader2 className="animate-spin mx-auto" /> : 'تحديث الاشتراك'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 py-4 rounded-2xl border-gray-700 font-bold"
                    onClick={() => {
                      setSubModal({ ...subModal, show: false });
                      setSubForm({ planType: '', status: '', reason: '' });
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
    </>
  );
}
