'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Loader2,
  Calendar,
  Tag,
  User,
  Hash
} from 'lucide-react';
import { purchaseService } from '@/services/api';
import { Purchase } from '@/types';
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

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    reason: '',
    amount: 0
  });

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getAll();
      if (response.status) {
        setPurchases(response.data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المشتريات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await purchaseService.create({
        reason: formData.reason,
        amount: formData.amount
      });

      if (response.status) {
        toast.success('تمت إضافة المشتريات بنجاح');
        setIsModalOpen(false);
        setFormData({ reason: '', amount: 0 });
        fetchPurchases();
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القيد؟ سيتم الاحتفاظ بنسخة احتياطية.')) return;
    try {
      const response = await purchaseService.delete(id);
      if (response.status) {
        setPurchases(purchases.filter(p => p._id !== id));
        toast.success('تم الحذف بنجاح');
      }
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="text-blue-500" />
            إدارة المشتريات
          </h1>
          <p className="text-gray-400 mt-1">تتبع كافة المشتريات والتعديلات المالية للمخزون</p>
        </div>
        
        <Button 
          variant="primary" 
          icon={<Plus size={20} />}
          onClick={() => setIsModalOpen(true)}
        >
          إضافة مشتريات أخرى
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400">جاري تحميل المشتريات...</p>
        </div>
      ) : (
        <div className="w-full">
          <Table data={purchases}>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length > 0 ? (
                purchases.map((p) => {
                  const quantity = (p.itemId && p.itemId.price) ? (Number(p.amount) / p.itemId.price).toFixed(0) : '-';
                  const price = p.itemId?.price ? formatCurrency(p.itemId.price) : '-';
                  const supplier = p.itemId?.customer || p.supplier || '-';
                  
                  return (
                    <TableRow key={p._id}>
                      <TableCell>{formatDate(p.date || p.createdAt)}</TableCell>
                      <TableCell className="font-medium text-white">{p.description || p.reason || '-'}</TableCell>
                      <TableCell>{supplier}</TableCell>
                      <TableCell>{quantity}</TableCell>
                      <TableCell>{price}</TableCell>
                      <TableCell className="font-bold text-green-400">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(p._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    لا توجد مشتريات مسجلة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-700 animate-in">
            <h2 className="text-2xl font-bold text-white mb-6">إضافة مشتريات أو تعديل</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">المبلغ</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="أدخل المبلغ (+/-)"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">المشتريات / السبب</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شراء بضاعة إضافية، تعديل يدوي..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" variant="primary" className="flex-1" loading={formLoading}>
                  حفظ
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
          </div>
        </div>
      )}
    </div>
  );
}
