'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { superAdminService } from '@/services/api';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Loader2,
  Package,
  ShoppingCart,
  Wallet,
  Zap,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import {Button} from '@/components/ui/Button';

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: '',
    name: '',
    price: 0,
    limits: { maxItems: 200, maxSales: 200, maxExpenses: 200 },
    features: [],
    isPublic: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await superAdminService.getPlans();
      if (response.status) setPlans(response.data);
    } catch (error: any) {
      toast.error('فشل في تحميل الخطط');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await superAdminService.createPlan(formData);
      if (response.status) {
        toast.success('تمت إضافة الخطة بنجاح');
        setShowAddModal(false);
        fetchPlans();
      }
    } catch (error: any) {
      toast.error('فشل في إضافة الخطة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;
    try {
      const response = await superAdminService.deletePlan(id);
      if (response.status) {
        toast.success('تم حذف الخطة');
        fetchPlans();
      }
    } catch (error: any) {
      toast.error('فشل في حذف الخطة');
    }
  };

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
            <h1 className="text-3xl font-bold text-white mb-2">إدارة خطط الاشتراك</h1>
            <p className="text-gray-400">إضافة وتعديل وحذف خطط الأسعار والحدود المسموحة</p>
          </div>
          <Button variant="primary" size="lg" className="rounded-2xl" onClick={() => setShowAddModal(true)}>
            <Plus className="ml-2" size={20} />
            إضافة خطة جديدة
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan._id} className="glass-card p-8 rounded-[2.5rem] border border-gray-700/50 bg-gray-800/20 flex flex-col hover:scale-[1.02] transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  plan.id === 'professional' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                }`}>
                  {plan.id === 'professional' ? <Crown size={28} /> : <Zap size={28} />}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl border-gray-700 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(plan._id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">جنيه / {plan.durationDays} يوم</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <div className="flex items-center gap-2"><Package size={16} /> حد المنتجات:</div>
                  <span className="text-white font-bold">{plan.limits.maxItems}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <div className="flex items-center gap-2"><ShoppingCart size={16} /> حد العمليات:</div>
                  <span className="text-white font-bold">{plan.limits.maxSales}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <div className="flex items-center gap-2"><Wallet size={16} /> حد المصاريف:</div>
                  <span className="text-white font-bold">{plan.limits.maxExpenses}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700/50 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">كود الخطة: <span className="text-gray-300 font-mono">{plan.id}</span></span>
                  <div className={`px-4 py-1 rounded-full text-xs font-bold border ${
                    plan.isPublic ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {plan.isPublic ? 'عامة' : 'مخفية'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Plan Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-card w-full max-w-2xl p-8 rounded-[2.5rem] border border-gray-700 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">إضافة خطة اشتراك جديدة</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">اسم الخطة</label>
                    <input type="text" required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">كود الخطة (Unique ID)</label>
                    <input type="text" required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">السعر (ج.م)</label>
                    <input type="number" required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">أقصى عدد منتجات</label>
                    <input type="number" required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" value={formData.limits.maxItems} onChange={(e) => setFormData({...formData, limits: {...formData.limits, maxItems: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">أقصى عدد مبيعات/مشتريات</label>
                    <input type="number" required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" value={formData.limits.maxSales} onChange={(e) => setFormData({...formData, limits: {...formData.limits, maxSales: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 pr-2">أقصى عدد مصروفات</label>
                    <input type="number" required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500" value={formData.limits.maxExpenses} onChange={(e) => setFormData({...formData, limits: {...formData.limits, maxExpenses: Number(e.target.value)}})} />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full py-4 text-lg font-bold">حفظ الخطة الجديدة</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
