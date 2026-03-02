'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit2, 
  Loader2,
  Calendar,
  X
} from 'lucide-react';
import { saleService, itemService } from '@/services/api';
import { SaleInvoice, Item } from '@/types';
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

export default function SalesPage() {
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ from: '', to: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleInvoice | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // New Sale states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [saleData, setSaleData] = useState({
    sellerName: '',
    quantity: 1,
    price: 0
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getAll(filter);
      if (response.status) {
        setSales(response.data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المبيعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filter]);

  const handleSearchProduct = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const response = await itemService.search(query);
        if (response.status) {
          setSearchResults(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectProduct = (product: Item) => {
    setSelectedProduct(product);
    setSaleData({
      ...saleData,
      price: product.price,
      quantity: 1
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      const response = await saleService.create({
        modelNumber: selectedProduct.modelNumber,
        name: selectedProduct.name,
        sellerName: saleData.sellerName,
        price: saleData.price,
        quantity: saleData.quantity,
        frontTotal: saleData.price * saleData.quantity
      });

      if (response.status) {
        toast.success('تمت عملية البيع بنجاح');
        setIsModalOpen(false);
        setSelectedProduct(null);
        setSaleData({ sellerName: '', quantity: 1, price: 0 });
        fetchSales();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشلت عملية البيع');
    }
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    try {
      const response = await saleService.update(editingSale._id, {
        price: saleData.price,
        quantity: saleData.quantity
      });

      if (response.status) {
        toast.success('تم تحديث الفاتورة بنجاح');
        setIsEditModalOpen(false);
        setEditingSale(null);
        fetchSales();
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    try {
      const response = await saleService.delete(id);
      if (response.status) {
        setSales(sales.filter(s => s._id !== id));
        toast.success('تم الحذف بنجاح');
      }
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} فاتورة؟`)) return;
    
    try {
      const response = await saleService.bulkDelete(selectedIds);
      if (response.status) {
        toast.success('تم حذف الفواتير المحددة بنجاح');
        setSelectedIds([]);
        fetchSales();
      }
    } catch (error) {
      toast.error('فشل حذف الفواتير المحددة');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sales.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sales.map(s => s._id));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await saleService.exportExcel(filter);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('حدث خطأ أثناء تصدير الملف');
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="text-purple-500" />
            فواتير المبيعات
          </h1>
          <p className="text-gray-400 mt-1">تتبع وإدارة كافة عمليات البيع</p>
        </div>
        
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button 
              variant="danger" 
              icon={<Trash2 size={20} />}
              onClick={handleBulkDelete}
            >
              حذف المحدد ({selectedIds.length})
            </Button>
          )}
          <Button 
            variant="outline" 
            icon={<Download size={20} />}
            onClick={handleExport}
          >
            تصدير Excel
          </Button>
          <Button 
            variant="primary" 
            icon={<Plus size={20} />}
            onClick={() => setIsModalOpen(true)}
          >
            إضافة بيع جديد
          </Button>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-gray-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Calendar size={16} />
              من تاريخ
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={filter.from}
              onChange={(e) => setFilter({ ...filter, from: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Calendar size={16} />
              إلى تاريخ
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={filter.to}
              onChange={(e) => setFilter({ ...filter, to: e.target.value })}
            />
          </div>
          <Button variant="secondary" onClick={() => setFilter({ from: '', to: '' })}>
            إعادة تعيين
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400">جاري تحميل الفواتير...</p>
        </div>
      ) : (
        <div className="w-full">
          <Table data={sales}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    checked={sales.length > 0 && selectedIds.length === sales.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>رقم الموديل</TableHead>
                <TableHead>اسم المشتري</TableHead>
                <TableHead>اسم القطعة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.includes(sale._id)}
                        onChange={() => toggleSelect(sale._id)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(sale.createdAt || '')}</TableCell>
                    <TableCell className="font-medium text-blue-400">{sale.modelNumber}</TableCell>
                    <TableCell>{sale.sellerName || '-'}</TableCell>
                    <TableCell>{sale.name}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{formatCurrency(sale.price)}</TableCell>
                    <TableCell className="font-bold text-green-400">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setEditingSale(sale);
                            setSaleData({
                              sellerName: sale.sellerName,
                              quantity: sale.quantity,
                              price: sale.price
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteSale(sale._id)}
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
                  <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                    لا توجد فواتير في هذه الفترة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl p-8 rounded-3xl shadow-2xl border border-gray-700 animate-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">عملية بيع جديدة</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن منتج بالاسم أو الموديل..."
                  className="w-full pr-12 pl-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={searchQuery}
                  onChange={(e) => handleSearchProduct(e.target.value)}
                />
                
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        className="w-full px-4 py-3 text-right hover:bg-gray-700 transition flex justify-between items-center"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <span className="text-white">{product.name} ({product.modelNumber})</span>
                        <span className="text-xs text-gray-400">متاح: {product.quantity}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <form onSubmit={handleAddSale} className="space-y-4 border-t border-gray-700 pt-6 animate-in">
                  <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                    <p className="text-sm text-blue-400 font-medium">المنتج المختار:</p>
                    <p className="text-lg font-bold text-white">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-400">الموديل: {selectedProduct.modelNumber}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">اسم العميل (اختياري)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={saleData.sellerName}
                      onChange={(e) => setSaleData({ ...saleData, sellerName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">الكمية</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={selectedProduct.quantity}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={saleData.quantity || ''}
                        onChange={(e) => setSaleData({ ...saleData, quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">السعر</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={saleData.price || ''}
                        onChange={(e) => setSaleData({ ...saleData, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl flex justify-between items-center">
                    <span className="text-gray-400">الإجمالي الكلي:</span>
                    <span className="text-2xl font-bold text-green-400">
                      {formatCurrency(saleData.price * saleData.quantity)}
                    </span>
                  </div>

                  <Button type="submit" variant="primary" className="w-full py-4 text-lg">
                    تأكيد عملية البيع
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Sale Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-700 animate-in">
            <h2 className="text-2xl font-bold text-white mb-6">تعديل فاتورة البيع</h2>
            
            <form onSubmit={handleUpdateSale} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">الكمية</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={saleData.quantity}
                  onChange={(e) => setSaleData({ ...saleData, quantity: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">السعر</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={saleData.price}
                  onChange={(e) => setSaleData({ ...saleData, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
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
          </div>
        </div>
      )}
    </div>
  );
}
