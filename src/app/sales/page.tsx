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
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Printer
} from 'lucide-react';
import { saleService, itemService, returnService, representativeService, authService, clientService } from '@/services/api';
import { SaleInvoice, Item, Representative, Client } from '@/types';
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
import { PrintInvoice } from '@/components/PrintInvoice';


export default function SalesPage() {
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleInvoice | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returningSale, setReturningSale] = useState<SaleInvoice | null>(null);
  const [returnData, setReturnData] = useState({
    quantity: 1,
    reason: ''
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [totalSalesValue, setTotalSalesValue] = useState(0);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printingData, setPrintingData] = useState<SaleInvoice | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedSaleForAudit, setSelectedSaleForAudit] = useState<SaleInvoice | null>(null);
  const [editReason, setEditReason] = useState('');
  
  // New Sale states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [saleData, setSaleData] = useState({
    sellerName: '', 
    representativeId: '',
    clientId: '',
    clientName: '', 
    quantity: 1,
    price: 0,
    paidAmount: 0
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getAll({ ...filter, page, limit: 10 });
      if (response.status) {
        setSales(response.data);
        setPagination(response.pagination);
        setTotalSalesValue(response.totalSalesValue || 0);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المبيعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filter, page]);

  const fetchRepresentatives = async () => {
    try {
      const response = await representativeService.getAll({ page: 1, limit: 200, includeInactive: false });
      if (response.status) {
        setRepresentatives(response.data || []);
      }
    } catch (error) {}
  };

  const fetchClients = async () => {
    try {
      const response = await clientService.getAll({ page: 1, limit: 200, includeInactive: false });
      if (response.status) {
        setClients(response.data || []);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchRepresentatives();
    fetchClients();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.status) {
        setCompanyName(response.data.companyName);
      }
    } catch (error) {}
  };

  const handlePrint = (sale: SaleInvoice) => {
    setPrintingData(sale);
    setIsPrinting(true);
  };

  React.useEffect(() => {
    if (!isPrinting || !printingData) return;

    const handleAfterPrint = () => {
      setIsPrinting(false);
      setPrintingData(null);
    };

    const printAfterRender = () => {
      requestAnimationFrame(() => {
        window.print();
      });
    };

    const timeoutId = window.setTimeout(printAfterRender, 500);
    window.addEventListener('afterprint', handleAfterPrint);

    const fallbackId = window.setTimeout(() => {
      if (isPrinting) {
        handleAfterPrint();
      }
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(fallbackId);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isPrinting, printingData]);

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
      const total = saleData.price * saleData.quantity;
      const response = await saleService.create({
        modelNumber: selectedProduct.modelNumber,
        name: selectedProduct.name,
        sellerName: saleData.sellerName,
        representativeId: saleData.representativeId || undefined,
        clientId: saleData.clientId || undefined,
        clientName: saleData.clientName || undefined,
        price: saleData.price,
        quantity: saleData.quantity,
        total,
        paidAmount: saleData.paidAmount
      });

      if (response.status) {
        toast.success('تمت عملية البيع بنجاح');
        setIsModalOpen(false);
        setSelectedProduct(null);
        setSaleData({ sellerName: '', representativeId: '', clientId: '', clientName: '', quantity: 1, price: 0, paidAmount: 0 });
        fetchSales();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشلت عملية البيع');
    }
  };

  type SaleUpdatePayload = {
    price: number;
    quantity: number;
    sellerName?: string;
    clientName?: string;
    representativeId?: string | null;
    clientId?: string | null;
    paidAmount: number;
    reason?: string;
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSale) return;

    try {
      const updatePayload: SaleUpdatePayload = {
        price: saleData.price,
        quantity: saleData.quantity,
        sellerName: saleData.sellerName,
        clientName: saleData.clientName || undefined,
        representativeId: saleData.representativeId || null,
        clientId: saleData.clientId || null,
        paidAmount: saleData.paidAmount,
        reason: editReason || undefined
      };
      const response = await saleService.update(editingSale?._id, updatePayload);

      if (response.status) {
        toast.success('تم تحديث الفاتورة بنجاح');
        setIsEditModalOpen(false);
        setEditingSale(null);
        setEditReason('');
        fetchSales();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    }
  };

  const handleOpenAuditLogs = async (sale: SaleInvoice) => {
    setSelectedSaleForAudit(sale);
    setAuditLogs([]);
    setIsAuditModalOpen(true);
    try {
      const response = await saleService.getAuditLogs(sale._id);
      if (response.status) {
        setAuditLogs(response.data || []);
      }
    } catch (error) {
      toast.error('فشل جلب سجل التدقيق');
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

  const handleReturnSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningSale) return;

    try {
      const response = await returnService.create({
        saleInvoiceId: returningSale._id,
        quantity: returnData.quantity,
        reason: returnData.reason
      });

      if (response.status) {
        toast.success('تم تسجيل المرتجع بنجاح');
        setIsReturnModalOpen(false);
        setReturningSale(null);
        setReturnData({ quantity: 1, reason: '' });
        fetchSales();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تسجيل المرتجع');
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
            <span className="text-sm font-medium text-gray-400 mr-2 bg-gray-800/50 px-2 py-0.5 rounded-full border border-gray-700/50">
              (إجمالي المبيعات: {formatCurrency(totalSalesValue)})
            </span>
          </h1>
          <p className="text-gray-400 mt-1">تتبع وإدارة كافة عمليات البيع</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
            variant="outline" 
            icon={<Printer size={20} />}
            onClick={() => window.print()}
          >
            طباعة الصفحة
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
            <h3 className="text-lg font-semibold text-white">تصنيف حسب التاريخ</h3>
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Calendar size={16} />
              من تاريخ
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition [&::-webkit-calendar-picker-indicator]:invert"
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
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition [&::-webkit-calendar-picker-indicator]:invert"
              value={filter.to}
              onChange={(e) => setFilter({ ...filter, to: e.target.value })}
            />
          </div>
          <Button variant="secondary" onClick={() => {
            setFilter({ from: '', to: '' });
            setPage(1);
          }}>
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
                <TableHead>المندوب</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>اسم القطعة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المبلغ المدفوع</TableHead>
                <TableHead>حالة الدفع</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => {
                  let statusClass = '';
                  let statusLabel = '';
                  switch(sale.paymentStatus) {
                    case 'paid':
                      statusClass = 'bg-green-100 text-green-800 border-green-300';
                      statusLabel = 'مدفوعة';
                      break;
                    case 'partial':
                      statusClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                      statusLabel = 'جزئية';
                      break;
                    default:
                      statusClass = 'bg-red-100 text-red-800 border-red-300';
                      statusLabel = 'غير مدفوعة';
                  }
                  return (
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
                     <TableCell className="text-gray-300">{representatives.find(r => r._id === sale.representativeId)?.name || sale.sellerName || '-'}</TableCell>
                      <TableCell className="text-gray-300">{(sale.clientId as any)?.name || clients.find(c => c._id === sale.clientId)?.name || (sale as any).clientName || '-'}</TableCell>
                    <TableCell>{sale.name}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{formatCurrency(sale.price)}</TableCell>
                    <TableCell className="font-bold text-green-400">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell>{formatCurrency(sale.paidAmount || 0)}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handlePrint(sale)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          title="طباعة الفاتورة"
                        >
                          <Printer size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenAuditLogs(sale)}
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                          title="سجل التعديلات"
                        >
                          <Search size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setReturningSale(sale);
                            setReturnData({ quantity: sale.quantity, reason: '' });
                            setIsReturnModalOpen(true);
                          }}
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                          title="مرتجع"
                        >
                          <RotateCcw size={16} />
                        </Button>
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setEditingSale(sale);
                          setEditReason('');
                           setSaleData({
                              sellerName: sale.sellerName || '',
                              clientId: typeof sale.clientId === 'object' && sale.clientId !== null ? (sale.clientId as any)._id : (sale.clientId as string) || '',
                              clientName: typeof sale.clientId === 'object' ? '' : sale.clientName || '',
                              quantity: sale.quantity,
                              price: sale.price,
                              representativeId: sale.representativeId || '',
                              paidAmount: sale.paidAmount || 0
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
                );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-gray-500">
                    لا توجد فواتير في هذه الفترة
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

      {/* Add Sale Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
            setSaleData({ sellerName: '', representativeId: '', clientId: '', clientName: '', quantity: 1, price: 0, paidAmount: 0 });
          }}
          title="عملية بيع جديدة"
          maxWidth="xl"
        >
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن منتج بالاسم أو الموديل..."
              className="w-full pr-12 pl-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchQuery}
              onChange={(e) => handleSearchProduct(e.target.value)}
            />
            
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">اختيار عميل (اختياري)</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={saleData.clientId}
                    onChange={(e) => {
                      const clientId = e.target.value;
                      if (!clientId) {
                        setSaleData((prev) => ({ ...prev, clientId: '', clientName: '' }));
                        return;
                      }
                      const client = clients.find((c) => c._id === clientId);
                      setSaleData((prev) => ({ ...prev, clientId, clientName: client?.name || '' }));
                    }}
                  >
                    <option value="">بدون اختيار (إدخال يدوي)</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">اسم العميل (يدوي)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={saleData.clientName}
                      onChange={(e) => setSaleData({ ...saleData, clientName: e.target.value })}
                      disabled={Boolean(saleData.clientId)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">اختيار مندوب (اختياري)</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={saleData.representativeId}
                    onChange={(e) => {
                      const repId = e.target.value;
                      if (!repId) {
                        setSaleData((prev) => ({ ...prev, representativeId: '', sellerName: '' }));
                        return;
                      }
                      const rep = representatives.find((r) => r._id === repId);
                      setSaleData((prev) => ({ ...prev, representativeId: repId, sellerName: rep?.name || '' }));
                    }}
                  >
                    <option value="">بدون اختيار (إدخال يدوي)</option>
                    {representatives.map((rep) => (
                      <option key={rep._id} value={rep._id}>
                        {rep.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">اسم المندوب (يدوي)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={saleData.sellerName}
                      onChange={(e) => setSaleData({ ...saleData, sellerName: e.target.value })}
                      disabled={Boolean(saleData.representativeId)}
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleAddSale} className="space-y-4 border-t border-gray-700 pt-6 animate-in">
              <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                <p className="text-sm text-blue-400 font-medium">المنتج المختار:</p>
                <p className="text-lg font-bold text-white">{selectedProduct?.name ?? ''}</p>
                <p className="text-sm text-gray-400">الموديل: {selectedProduct?.modelNumber ?? ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">الكمية</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedProduct?.quantity ?? 0}
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={saleData.price || ''}
                    onChange={(e) => setSaleData({ ...saleData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">المبلغ المدفوع</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={saleData.price * saleData.quantity}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={saleData.paidAmount || ''}
                  onChange={(e) => setSaleData({ ...saleData, paidAmount: parseFloat(e.target.value) || 0 })}
                />
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
          </div>

      </Modal>


      {/* Edit Sale Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل فاتورة البيع"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateSale} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">اختيار مندوب (اختياري)</label>
            <select
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={saleData.representativeId}
              onChange={(e) => {
                const repId = e.target.value;
                if (!repId) {
                  setSaleData((prev) => ({ ...prev, representativeId: '', sellerName: '' }));
                  return;
                }
                const rep = representatives.find((r) => r._id === repId);
                setSaleData((prev) => ({ ...prev, representativeId: repId, sellerName: rep?.name || '' }));
              }}
            >
              <option value="">بدون اختيار (إدخال يدوي)</option>
              {representatives.map((rep) => (
                <option key={rep._id} value={rep._id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">اسم المندوب (يدوي)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={saleData.sellerName}
              onChange={(e) => setSaleData({ ...saleData, sellerName: e.target.value })}
              disabled={Boolean(saleData.representativeId)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">اختيار عميل (اختياري)</label>
            <select
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={saleData.clientId}
              onChange={(e) => {
                const clientId = e.target.value;
                if (!clientId) {
                  setSaleData((prev) => ({ ...prev, clientId: '', clientName: '' }));
                  return;
                }
                const client = clients.find((c) => c._id === clientId);
                setSaleData((prev) => ({ ...prev, clientId, clientName: client?.name || '' }));
              }}
            >
              <option value="">بدون اختيار (إدخال يدوي)</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">اسم العميل (يدوي)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={saleData.clientName}
              onChange={(e) => setSaleData({ ...saleData, clientName: e.target.value })}
              disabled={Boolean(saleData.clientId)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">الكمية</label>
            <input
              type="number"
              required
              min="1"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={saleData.price || ''}
              onChange={(e) => setSaleData({ ...saleData, price: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">المبلغ المدفوع</label>
            <input
              type="number"
              min="0"
              step="0.01"
              max={saleData.price * saleData.quantity}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={saleData.paidAmount || ''}
              onChange={(e) => setSaleData({ ...saleData, paidAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">سبب التعديل (اختياري)</label>
            <textarea
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="اكتب سبب التعديل هنا..."
            />
          </div>

          <div className="p-4 bg-gray-800/50 rounded-xl flex justify-between items-center">
            <span className="text-gray-400">الإجمالي الكلي:</span>
            <span className="text-2xl font-bold text-green-400">
              {formatCurrency(saleData.price * saleData.quantity)}
            </span>
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
      </Modal>

      {/* Return Sale Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="سجل التعديلات"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700">
            <p className="text-sm text-gray-400">فاتورة مبيعات</p>
            <p className="text-lg font-bold text-white">{selectedSaleForAudit?.name || '-'}</p>
            <p className="text-sm text-gray-400">الموديل: {selectedSaleForAudit?.modelNumber || '-'}</p>
            <p className="text-sm text-gray-400">رقم الفاتورة: {selectedSaleForAudit?._id || '-'}</p>
          </div>
          {auditLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-10">لا توجد سجلات تعديل لهذه الفاتورة</p>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log._id} className="p-4 bg-gray-900 rounded-2xl border border-gray-700">
                  <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <p className="text-sm text-gray-400">التاريخ</p>
                      <p className="text-white">{formatDate(log.at || log.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">المستخدم</p>
                      <p className="text-white">{log.performedBy || 'غير معروف'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">نوع السجل</p>
                      <p className="text-white">
                        {log.action === 'return_sale_invoice' ? 'مرتجع' : log.action === 'update_sale_invoice' ? 'تعديل فاتورة' : log.action}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">سبب التعديل</p>
                      <p className="text-white">{log.details?.reason || 'غير محدد'}</p>
                    </div>
                  </div>
                  {log.action === 'return_sale_invoice' ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase mb-2">تفاصيل المرتجع</p>
                        <p className="text-sm text-gray-300">الموديل: {log.details?.item?.modelNumber || '-'}</p>
                        <p className="text-sm text-gray-300">المنتج: {log.details?.item?.name || '-'}</p>
                        <p className="text-sm text-gray-300">الكمية المرتجعة: {log.details?.quantity || 0}</p>
                        <p className="text-sm text-gray-300">المبلغ المسترد: {formatCurrency(log.details?.refundAmount || 0)}</p>
                        <p className="text-sm text-gray-300">معرف المرتجع: {log.details?.returnId || '-'}</p>
                      </div>
                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase mb-2">حالة الفاتورة الأصلية</p>
                        <p className="text-sm text-gray-300">رقم الفاتورة: {selectedSaleForAudit?._id || '-'}</p>
                        <p className="text-sm text-gray-300">اسم العميل: {selectedSaleForAudit?.clientName || selectedSaleForAudit?.sellerName || '-'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase mb-2">قبل التعديل</p>
                        <p className="text-sm text-gray-300">الكمية: {log.changes?.before?.quantity}</p>
                        <p className="text-sm text-gray-300">السعر: {formatCurrency(log.changes?.before?.price)}</p>
                        <p className="text-sm text-gray-300">المدفوع: {formatCurrency(log.changes?.before?.paidAmount)}</p>
                      </div>
                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase mb-2">بعد التعديل</p>
                        <p className="text-sm text-gray-300">الكمية: {log.changes?.after?.quantity}</p>
                        <p className="text-sm text-gray-300">السعر: {formatCurrency(log.changes?.after?.price)}</p>
                        <p className="text-sm text-gray-300">المدفوع: {formatCurrency(log.changes?.after?.paidAmount)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="تسجيل مرتجع"
        maxWidth="md"
      >
        {returningSale && (
          <form onSubmit={handleReturnSale} className="space-y-4">
            <div className="p-4 bg-orange-900/20 rounded-xl border border-orange-500/30">
              <p className="text-sm text-orange-400 font-medium">فاتورة رقم:</p>
              <p className="text-white font-bold">{returningSale._id}</p>
              <p className="text-sm text-gray-400 mt-1">
                المنتج: {returningSale.name} ({returningSale.modelNumber})
              </p>
              <p className="text-sm text-gray-400">الكمية المباعة: {returningSale.quantity}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">الكمية المرتجعة</label>
              <input
                type="number"
                required
                min="1"
                max={returningSale.quantity}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={returnData.quantity}
                onChange={(e) => setReturnData({ ...returnData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">سبب المرتجع (اختياري)</label>
              <textarea
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-orange-500 outline-none min-h-[100px]"
                placeholder="اذكر سبب الإرجاع هنا..."
                value={returnData.reason}
                onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                تأكيد المرتجع
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsReturnModalOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {isPrinting && printingData && (
        <PrintInvoice 
          type="sale"
          invoice={printingData}
          companyName={companyName} 
        />
      )}
    </div>
  );
}
