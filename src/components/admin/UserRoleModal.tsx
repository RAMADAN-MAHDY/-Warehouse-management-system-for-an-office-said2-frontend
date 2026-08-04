'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { superAdminService } from '@/services/api';
import { toast } from 'sonner';
import { Crown, Shield, ShieldAlert, User, Edit3, Eye, Loader2, Check } from 'lucide-react';

type UserRoleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  username?: string;
  currentRole?: string;
  onSuccess: () => void;
};

const ROLES = [
  {
    id: 'owner',
    title: 'مالك النظام (Owner)',
    desc: 'صلاحيات كاملة تشمل إدارة السوبر أدمن والتحكم الشامل بكل النظام',
    icon: Crown,
    color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  },
  {
    id: 'superadmin',
    title: 'سوبر أدمن (SuperAdmin)',
    desc: 'إدارة جميع العملاء، المشتريات والاشتراكات والخطط بجميع أنحاء النظام',
    icon: ShieldAlert,
    color: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  },
  {
    id: 'admin',
    title: 'أدمن المتجر (Admin)',
    desc: 'إدارة متجر العميل الخاص، المنتجات، المبيعات والمصروفات',
    icon: Shield,
    color: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  },
  {
    id: 'editor',
    title: 'محرر (Editor)',
    desc: 'إضافة وتعديل بيانات المتجر والفواتير بدون إمكانية الحذف الأساسي',
    icon: Edit3,
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  },
  {
    id: 'viewer',
    title: 'مشاهد (Viewer)',
    desc: 'عرض وعرض التظاهرات والتقارير فقط بدون إمكانية الإضافة أو التعديل',
    icon: Eye,
    color: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
  },
];

export default function UserRoleModal({
  isOpen,
  onClose,
  userId,
  username,
  currentRole = 'admin',
  onSuccess,
}: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(currentRole || 'admin');
      setReason('');
    }
  }, [isOpen, currentRole]);

  const handleUpdateRole = async () => {
    if (!userId) return;
    if (selectedRole === currentRole) {
      return toast.info('لم يتم تغيير الصلاحية');
    }

    setLoading(true);
    try {
      const response = await superAdminService.updateUser(userId, {
        role: selectedRole,
        reason: reason.trim() || `تحديث دور المستخدم إلى ${selectedRole}`,
      });

      if (response.status) {
        toast.success(response.message || 'تم تحديث الدور بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'فشل تحديث الصلاحية');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الدور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل صلاحيات المستخدم: ${username || ''}`}
    >
      <div className="space-y-5 text-slate-100 dir-rtl">
        <p className="text-xs text-slate-400 leading-relaxed">
          قم باختيار الدور المناسب للمستخدم <span className="text-emerald-400 font-bold">"{username}"</span>.
          سيحدد الدور الصلاحيات المتاحة له عبر لوحة التحكم والنظام.
        </p>

        {/* Roles List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${r.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {r.title}
                        {r.id === 'owner' && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-400 border border-amber-500/30">
                            أعلى صلاحية
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reason Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            سبب تغيير الصلاحية (مستحسن للتسجيل بالتدقيق):
          </label>
          <input
            type="text"
            placeholder="مثال: ترقية الحساب إلى مالك للنظام / تعيين صلاحيات إدارية..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleUpdateRole}
            disabled={loading || selectedRole === currentRole}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl border-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'تأكيد وحفظ الصلاحية'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 py-2.5 rounded-xl"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
}
