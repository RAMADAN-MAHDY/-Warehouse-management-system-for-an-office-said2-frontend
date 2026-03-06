'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  TrendingDown
} from 'lucide-react';
import { expenseService } from '@/services/api';
import { Expense } from '@/types';
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


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    description: '',
    amount: 0
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseService.getAll();
      if (response.status) {
        setExpenses(response.data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المصروفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      const response = await expenseService.delete(id);
      if (response.status) {
        setExpenses(expenses.filter(e => e._id !== id));
        toast.success('تم الحذف بنجاح');
      }
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let response;
      if (editingExpense) {
        response = await expenseService.update(editingExpense._id, formData);
      } else {
        response = await expenseService.create(formData);
      }

      if (response.status) {
        toast.success(editingExpense ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        setIsModalOpen(false);
        setEditingExpense(null);
        setFormData({ description: '', amount: 0 });
        fetchExpenses();
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setFormLoading(false);
    }
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="text-orange-500" />
            المصروفات العامة
          </h1>
          <p className="text-gray-400 mt-1">تتبع وتسجيل كافة المصاريف التشغيلية</p>
        </div>
        
        <Button 
          variant="danger" 
          icon={<Plus size={20} />}
          onClick={() => {
            setEditingExpense(null);
            setFormData({ description: '', amount: 0 });
            setIsModalOpen(true);
          }}
        >
          إضافة مصروف جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-orange-500 shadow-xl">
          <div>
            <p className="text-sm text-gray-400">إجمالي المصروفات</p>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <TrendingDown className="text-orange-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <Table data={expenses}>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{formatDate(expense.date || expense.createdAt || '')}</TableCell>
                  <TableCell className="font-medium text-white">{expense.description}</TableCell>
                  <TableCell className="font-bold text-red-400">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(expense)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(expense._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                  لا توجد مصروفات مسجلة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">الوصف</label>
            <input
              type="text"
              required
              placeholder="مثال: فاتورة كهرباء، إيجار..."
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">المبلغ</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
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
      </Modal>

    </div>
  );
}
