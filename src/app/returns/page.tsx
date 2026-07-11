'use client';

import React, { useEffect, useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  Download, 
  Trash2, 
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { returnService } from '@/services/api';
import { Return } from '@/types';
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

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [totalReturnsValue, setTotalReturnsValue] = useState(0);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await returnService.getAll({ ...filter, page, limit: 10 });
      if (response.status) {
        setReturns(response.data);
        setPagination(response.pagination);
        setTotalReturnsValue(response.totalReturnsValue || 0);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المرتجعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filter, page]);

  const handleDeleteReturn = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف سجل المرتجع؟ سيتم تعديل المخزن تلقائياً.')) return;
    try {
      const response = await returnService.delete(id);
      if (response.status) {
        setReturns(returns.filter(r => r._id !== id));
        toast.success('تم حذف سجل المرتجع بنجاح');
        fetchReturns();
      }
    } catch (error) {
      toast.error('فشل حذف المرتجع');
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <RotateCcw className="text-orange-500" />
            إدارة المرتجعات
            <span className="text-sm font-medium text-gray-400 mr-2 bg-gray-800/50 px-2 py-0.5 rounded-full border border-gray-700/50">
              (إجمالي المرتجعات: {formatCurrency(totalReturnsValue)})
            </span>
          </h1>
          <p className="text-gray-400 mt-1">عرض وإدارة كافة عمليات المرتجعات وتأثيرها على المخزون</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Calendar size={16} className="text-orange-500" />
            تصفية حسب التاريخ
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="date" 
              className="bg-gray-800 border-gray-700 rounded-xl text-white focus:ring-orange-500 focus:border-orange-500 w-full p-2.5 text-sm"
              value={filter.from}
              onChange={(e) => setFilter({ ...filter, from: e.target.value })}
            />
            <input 
              type="date" 
              className="bg-gray-800 border-gray-700 rounded-xl text-white focus:ring-orange-500 focus:border-orange-500 w-full p-2.5 text-sm"
              value={filter.to}
              onChange={(e) => setFilter({ ...filter, to: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex items-end gap-2">
          <Button 
            variant="outline" 
            className="w-full rounded-xl py-2.5"
            onClick={() => {
              setFilter({ from: '', to: '' });
              setPage(1);
            }}
          >
            إعادة تعيين
          </Button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table data={returns}>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">التاريخ</TableHead>
                <TableHead className="text-gray-400">الموديل</TableHead>
                <TableHead className="text-gray-400">المنتج</TableHead>
                <TableHead className="text-gray-400">الكمية المرتجعة</TableHead>
                <TableHead className="text-gray-400">سعر الوحدة</TableHead>
                <TableHead className="text-gray-400">الإجمالي المسترد</TableHead>
                <TableHead className="text-gray-400">المندوب</TableHead>
                <TableHead className="text-gray-400">سبب المرتجع</TableHead>
                <TableHead className="text-gray-400 text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      <p className="text-gray-400">جاري تحميل المرتجعات...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                      <ArrowRightLeft size={48} strokeWidth={1} />
                      <p>لا توجد مرتجعات مسجلة</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((ret) => (
                  <TableRow key={ret._id} className="border-gray-800 hover:bg-gray-800/30 transition-colors group">
                    <TableCell className="text-gray-300">{formatDate(ret.date)}</TableCell>
                    <TableCell className="font-medium text-orange-400">{ret.modelNumber}</TableCell>
                    <TableCell className="text-white">{ret.name}</TableCell>
                    <TableCell className="text-orange-400 font-bold">{ret.quantity}</TableCell>
                    <TableCell className="text-gray-300">{formatCurrency(ret.price)}</TableCell>
                    <TableCell className="text-white font-bold">{formatCurrency(ret.total)}</TableCell>
                    <TableCell className="text-gray-400">{ret.sellerName || '-'}</TableCell>
                    <TableCell className="text-gray-400 text-sm italic">{ret.reason || '-'}</TableCell>
                    <TableCell className="text-left">
                      <button 
                        onClick={() => handleDeleteReturn(ret._id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-gray-800/50 rounded-lg"
                        title="حذف سجل المرتجع"
                      >
                        <Trash2 size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900/30">
            <div className="text-sm text-gray-400">
              عرض الصفحة {page} من {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg h-9 w-9 p-0"
              >
                <ChevronRight size={18} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg h-9 w-9 p-0"
              >
                <ChevronLeft size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
