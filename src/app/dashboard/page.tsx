'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Loader2,
  RefreshCcw,
  Download,
  AlertTriangle,
  History,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { itemService, reportService } from '@/services/api';
import { Item } from '@/types';
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
import Link from 'next/link';

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    modelNumber: '',
    customer: '',
    name: '',
    quantity: 0,
    price: 0
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await itemService.getAll();
      if (response.status) {
        setItems(response.data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await reportService.getSummary();
      if (response.status) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchSummary();
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await itemService.search(query);
        if (response.status) {
          setItems(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    } else if (query.length === 0) {
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    try {
      const response = await itemService.delete(id);
      if (response.status) {
        setItems(items.filter(item => item._id !== id));
        toast.success('تم الحذف بنجاح');
      }
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      modelNumber: item.modelNumber,
      customer: item.customer,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let response;
      if (editingItem) {
        response = await itemService.update(editingItem._id, formData);
      } else {
        response = await itemService.create(formData);
      }

      if (response.status) {
        toast.success(editingItem ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ modelNumber: '', customer: '', name: '', quantity: 0, price: 0 });
        fetchItems();
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await itemService.exportExcel();
      
      // Check if blob is actually a JSON error message (this happens if responseType is blob but server returns error)
      if (blob instanceof Blob && blob.type === 'application/json') {
        const text = await blob.text();
        const error = JSON.parse(text);
        toast.error(error.message || 'حدث خطأ أثناء تصدير الملف');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تصدير المخزون بنجاح');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء تصدير الملف');
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-blue-500" />
            إدارة المخزون
          </h1>
          <p className="text-gray-400 mt-1">عرض وإدارة كافة المنتجات في مخزنك</p>
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
            variant="success" 
            icon={<Plus size={20} />}
            onClick={() => {
              setEditingItem(null);
              setFormData({ modelNumber: '', customer: '', name: '', quantity: 0, price: 0 });
              setIsModalOpen(true);
            }}
          >
            إضافة قطعة جديدة
          </Button>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="إجمالي المبيعات" 
          value={summary?.financials?.totalSales || 0} 
          icon={<TrendingUp className="text-green-500" />}
          loading={summaryLoading}
        />
        <DashboardCard 
          title="إجمالي المشتريات" 
          value={summary?.financials?.totalPurchases || 0} 
          icon={<ShoppingCart className="text-blue-500" />}
          loading={summaryLoading}
        />
        <DashboardCard 
          title="إجمالي المصروفات" 
          value={summary?.financials?.totalExpenses || 0} 
          icon={<TrendingDown className="text-orange-500" />}
          loading={summaryLoading}
        />
        <DashboardCard 
          title="صافي الربح" 
          value={summary?.financials?.netProfit || 0} 
          icon={<DollarSign className="text-emerald-500" />}
          loading={summaryLoading}
          isProfit
        />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-blue-500" />
              المخزون الحالي
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="بحث سريع..."
                  className="bg-gray-800 border border-gray-700 rounded-lg py-1.5 pr-10 pl-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none w-48 lg:w-64"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <Table data={items}>
              <TableHeader>
                <TableRow>
                  <TableHead>الموديل</TableHead>
                  <TableHead>القطعة</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.slice(0, 10).map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium text-blue-400">{item.modelNumber}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <span className={item.quantity < 5 ? "text-red-400 font-bold" : ""}>
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>{formatCurrency(item.quantity * item.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-blue-400">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)} className="h-8 w-8 text-red-400">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            نواقص المخزن
          </h2>
          <div className="glass rounded-2xl overflow-hidden border border-gray-700">
            {summaryLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : summary?.inventory?.lowStockItems?.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {summary.inventory.lowStockItems.map((item: any) => (
                  <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition">
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">موديل: {item.modelNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{item.quantity} قطعة</p>
                      <p className="text-xs text-gray-500">متبقي</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm italic">لا توجد نواقص حالياً</div>
            )}
          </div>

          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-8">
            <History size={20} className="text-purple-500" />
            آخر المبيعات
          </h2>
          <div className="glass rounded-2xl overflow-hidden border border-gray-700">
            {summaryLoading ? (
              <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : summary?.recentSales?.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {summary.recentSales.map((sale: any) => (
                  <div key={sale._id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition">
                    <div>
                      <p className="text-sm font-bold text-white">{sale.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(sale.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{formatCurrency(sale.total)}</p>
                      <p className="text-xs text-gray-500">{sale.quantity} قطعة</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm italic">لا توجد مبيعات مؤخراً</div>
            )}
            <Link href="/sales" className="block p-3 text-center text-xs text-blue-400 hover:bg-blue-900/10 transition border-t border-gray-700 font-bold">
              عرض كل المبيعات
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl p-8 rounded-3xl mt-[-350px] sm:mt-[10px] shadow-2xl border border-gray-700 animate-in">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingItem ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">رقم الموديل</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">اسم المورد</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">اسم القطعة</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">الكمية</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">سعر الوحدة</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {/*  */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">الاجمالي</label>
                  <p className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {formatCurrency(formData.quantity * formData.price)}
                  </p>
                </div>
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

function DashboardCard({ title, value, icon, loading, isProfit }: { title: string, value: number, icon: React.ReactNode, loading?: boolean, isProfit?: boolean }) {
  return (
    <div className="glass p-6 rounded-2xl border border-gray-700 shadow-xl transition-all hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-gray-800 animate-pulse rounded"></div>
      ) : (
        <p className={`text-2xl font-bold ${isProfit ? (value >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>
          {formatCurrency(value)}
        </p>
      )}
    </div>
  );
}
