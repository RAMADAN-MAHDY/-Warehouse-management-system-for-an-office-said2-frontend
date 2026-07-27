'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  FileText,
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
  Printer,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Layers
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
import AddSalePaymentModal, { GroupPaymentTarget } from '@/components/sales/AddSalePaymentModal';

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
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<SaleInvoice | null>(null);
  const [groupPaymentTarget, setGroupPaymentTarget] = useState<GroupPaymentTarget | null>(null);
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);

  // Cart & New Sale states
  const [cartItems, setCartItems] = useState<Array<{ id: string; item: Item; quantity: number; price: number }>>([]);
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

  const toggleExpandGroup = (groupId: string) => {
    setExpandedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  type GroupedSaleEntry =
    | { type: 'single'; sale: SaleInvoice }
    | { type: 'group'; groupId: string; invoices: SaleInvoice[] };

  const groupedSales = useMemo<GroupedSaleEntry[]>(() => {
    const groups: Record<string, SaleInvoice[]> = {};

    sales.forEach((sale) => {
      if (sale.invoiceGroupId) {
        if (!groups[sale.invoiceGroupId]) {
          groups[sale.invoiceGroupId] = [];
        }
        groups[sale.invoiceGroupId].push(sale);
      }
    });

    const result: GroupedSaleEntry[] = [];
    const processedGroupIds = new Set<string>();

    sales.forEach((sale) => {
      if (sale.invoiceGroupId) {
        if (!processedGroupIds.has(sale.invoiceGroupId)) {
          processedGroupIds.add(sale.invoiceGroupId);
          const groupInvoices = groups[sale.invoiceGroupId];
          if (groupInvoices && groupInvoices.length > 1) {
            result.push({
              type: 'group',
              groupId: sale.invoiceGroupId,
              invoices: groupInvoices,
            });
          } else if (groupInvoices && groupInvoices.length === 1) {
            result.push({
              type: 'single',
              sale: groupInvoices[0],
            });
          }
        }
      } else {
        result.push({
          type: 'single',
          sale,
        });
      }
    });

    return result;
  }, [sales]);

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

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (saleData.quantity <= 0) {
      toast.error('الكمية يجب أن تكون أكبر من صفر');
      return;
    }
    if (saleData.quantity > selectedProduct.quantity) {
      toast.error(`الكمية المتاحة فقط ${selectedProduct.quantity}`);
      return;
    }

    setCartItems(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        item: selectedProduct,
        quantity: saleData.quantity,
        price: saleData.price
      }
    ]);
    setSelectedProduct(null);
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`تم إضافة (${selectedProduct.name}) إلى السلة`);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(c => c.id !== id));
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    let itemsToSubmit = [...cartItems];
    if (itemsToSubmit.length === 0 && selectedProduct) {
      itemsToSubmit = [
        {
          id: 'temp',
          item: selectedProduct,
          quantity: saleData.quantity,
          price: saleData.price
        }
      ];
    }

    if (itemsToSubmit.length === 0) {
      toast.error('يرجى اختيار منتج وإضافته للسلة');
      return;
    }

    try {
      const response = await saleService.createGroup({
        items: itemsToSubmit.map(c => ({
          modelNumber: c.item.modelNumber,
          name: c.item.name,
          quantity: c.quantity,
          price: c.price
        })),
        sellerName: saleData.sellerName,
        representativeId: saleData.representativeId || undefined,
        clientId: saleData.clientId || undefined,
        clientName: saleData.clientName || undefined,
        paidAmount: saleData.paidAmount
      });

      if (response.status) {
        toast.success('تمت عملية البيع بنجاح');
        setIsModalOpen(false);
        setCartItems([]);
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
    setIsAuditModalOpen(true);
    try {
      const response = await saleService.getAuditLogs(sale._id);
      if (response.status) {
        setAuditLogs(response.data || []);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب سجل التعديلات');
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
        toast.success('تم إرجاع البيع بنجاح');
        setIsReturnModalOpen(false);
        setReturningSale(null);
        fetchSales();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشلت عملية الإرجاع');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;

    try {
      const response = await saleService.delete(id);
      if (response.status) {
        toast.success('تم حذف الفاتورة بنجاح');
        fetchSales();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل حذف الفاتورة');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} فاتورة؟`)) return;

    try {
      const response = await saleService.bulkDelete(selectedIds);
      if (response.status) {
        toast.success(response.message);
        setSelectedIds([]);
        fetchSales();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل الحذف المجمع');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sales.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sales.map(s => s._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    try {
      const blob = await saleService.exportExcel(filter);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('حدث خطأ أثناء تصدير الملف');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="text-blue-500" />
            فواتير المبيعات
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
                <TableHead>رقم الموديل / النوع</TableHead>
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
              {groupedSales.length > 0 ? (
                groupedSales.map((entry) => {
                  if (entry.type === 'single' && entry.sale) {
                    const sale = entry.sale;
                    let statusClass = '';
                    let statusLabel = '';
                    switch (sale.paymentStatus) {
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
                              disabled={(sale.paidAmount || 0) >= sale.total}
                              onClick={() => {
                                setGroupPaymentTarget(null);
                                setSelectedSaleForPayment(sale);
                                setIsAddPaymentModalOpen(true);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 disabled:opacity-30"
                              title="تسجيل دفعة"
                            >
                              <CreditCard size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenAuditLogs(sale)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                              title="سجل التعديلات"
                            >
                              <FileText size={16} />
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
                  } else if (entry.type === 'group' && entry.invoices && entry.groupId) {
                    const invoices = entry.invoices;
                    const groupId = entry.groupId;
                    const isExpanded = expandedGroupIds.includes(groupId);
                    const totalGrand = invoices.reduce((sum, i) => sum + i.total, 0);
                    const totalPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
                    const groupStatus = totalPaid >= totalGrand ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';

                    let statusClass = '';
                    let statusLabel = '';
                    switch (groupStatus) {
                      case 'paid':
                        statusClass = 'bg-green-100 text-green-800 border-green-300';
                        statusLabel = 'مدفوعة بالكامل';
                        break;
                      case 'partial':
                        statusClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                        statusLabel = 'جزئية';
                        break;
                      default:
                        statusClass = 'bg-red-100 text-red-800 border-red-300';
                        statusLabel = 'غير مدفوعة';
                    }

                    const repName = representatives.find(r => r._id === invoices[0].representativeId)?.name || invoices[0].sellerName || '-';
                    const clientName = (invoices[0].clientId as any)?.name || clients.find(c => c._id === invoices[0].clientId)?.name || (invoices[0] as any).clientName || '-';
                    const totalQty = invoices.reduce((sum, i) => sum + i.quantity, 0);

                    return (
                      <React.Fragment key={`group-${groupId}`}>
                        {/* Group Master Row */}
                        <TableRow className="bg-gray-900/90 font-medium hover:bg-gray-900 border-b border-gray-800">
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => toggleExpandGroup(groupId)}
                              className="p-1 text-gray-400 hover:text-white rounded-lg transition"
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </TableCell>
                          <TableCell>{formatDate(invoices[0].createdAt || '')}</TableCell>
                          <TableCell>
                            <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1.5 w-fit">
                              <Layers size={13} /> مجموعة ({invoices.length} أصناف)
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300">{repName}</TableCell>
                          <TableCell className="text-gray-300">{clientName}</TableCell>
                          <TableCell className="text-gray-300 font-semibold">{invoices.map(i => i.name).join('، ')}</TableCell>
                          <TableCell className="font-semibold">{totalQty}</TableCell>
                          <TableCell className="text-gray-500">-</TableCell>
                          <TableCell className="font-bold text-green-400">{formatCurrency(totalGrand)}</TableCell>
                          <TableCell className="font-semibold text-green-300">{formatCurrency(totalPaid)}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={totalPaid >= totalGrand}
                                onClick={() => {
                                  setSelectedSaleForPayment(null);
                                  setGroupPaymentTarget({
                                    groupId,
                                    total: totalGrand,
                                    paidAmount: totalPaid,
                                    title: `مجموعة ${invoices.length} أصناف`
                                  });
                                  setIsAddPaymentModalOpen(true);
                                }}
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 disabled:opacity-30 flex items-center gap-1 px-2.5 py-1 text-xs"
                                title="تسجيل دفعة للمجموعة"
                              >
                                <CreditCard size={14} />
                                تسجيل دفعة
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleExpandGroup(groupId)}
                                className="text-gray-400 hover:text-white hover:bg-gray-800"
                                title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Sub-rows for group items */}
                        {isExpanded && invoices.map((inv) => {
                          let subStatusClass = '';
                          let subStatusLabel = '';
                          switch (inv.paymentStatus) {
                            case 'paid':
                              subStatusClass = 'bg-green-900/30 text-green-400 border-green-800/40';
                              subStatusLabel = 'مدفوعة';
                              break;
                            case 'partial':
                              subStatusClass = 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40';
                              subStatusLabel = 'جزئية';
                              break;
                            default:
                              subStatusClass = 'bg-red-900/30 text-red-400 border-red-800/40';
                              subStatusLabel = 'غير مدفوعة';
                          }
                          return (
                            <TableRow key={inv._id} className="bg-gray-950/70 hover:bg-gray-950 border-b border-gray-800/60 text-xs">
                              <TableCell className="text-gray-500 pl-6">↳</TableCell>
                              <TableCell className="text-gray-400">{formatDate(inv.createdAt || '')}</TableCell>
                              <TableCell className="font-medium text-blue-400">{inv.modelNumber}</TableCell>
                              <TableCell className="text-gray-500">-</TableCell>
                              <TableCell className="text-gray-500">-</TableCell>
                              <TableCell className="text-white font-medium">{inv.name}</TableCell>
                              <TableCell className="text-gray-200">{inv.quantity}</TableCell>
                              <TableCell className="text-gray-300">{formatCurrency(inv.price)}</TableCell>
                              <TableCell className="font-bold text-green-400">{formatCurrency(inv.total)}</TableCell>
                              <TableCell className="text-gray-300">{formatCurrency(inv.paidAmount || 0)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${subStatusClass}`}>
                                  {subStatusLabel}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePrint(inv)}
                                    className="text-green-400 hover:text-green-300 hover:bg-green-900/20 w-7 h-7"
                                    title="طباعة الصنف"
                                  >
                                    <Printer size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenAuditLogs(inv)}
                                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 w-7 h-7"
                                    title="سجل التعديلات"
                                  >
                                    <FileText size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setReturningSale(inv);
                                      setReturnData({ quantity: inv.quantity, reason: '' });
                                      setIsReturnModalOpen(true);
                                    }}
                                    className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 w-7 h-7"
                                    title="مرتجع"
                                  >
                                    <RotateCcw size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteSale(inv._id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-7 h-7"
                                    title="حذف المستند"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  }
                  return null;
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-10 text-gray-500">
                    لا توجد فواتير في هذه الفترة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-gray-900/60 p-4 rounded-xl border border-gray-800">
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
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1
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

      {/* Add Sale Modal (Cart Enabled) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCartItems([]);
          setSelectedProduct(null);
          setSaleData({ sellerName: '', representativeId: '', clientId: '', clientName: '', quantity: 1, price: 0, paidAmount: 0 });
        }}
        title="عملية بيع جديدة (يدعم أصناف متعددة)"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Search Product */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-300 mb-1 block">البحث عن منتج وإضافته للسلة</label>
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
                      <span className="text-white font-medium">{product.name} ({product.modelNumber})</span>
                      <span className="text-xs text-gray-400">المتاح: {product.quantity} قطعة - السعر: {formatCurrency(product.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Product Controls */}
          {selectedProduct && (
            <div className="bg-gray-900/90 p-4 rounded-xl border border-blue-900/50 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="font-semibold text-blue-400">{selectedProduct.name} ({selectedProduct.modelNumber})</span>
                <span className="text-xs text-gray-400">المتاح بالمخزن: {selectedProduct.quantity}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.quantity}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm"
                    value={saleData.quantity}
                    onChange={(e) => setSaleData({ ...saleData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">السعر الفردي</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white text-sm"
                    value={saleData.price}
                    onChange={(e) => setSaleData({ ...saleData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1"
                    onClick={handleAddToCart}
                  >
                    <Plus size={16} /> إضافة للسلة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          {cartItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-200">سلة المبيعات ({cartItems.length} أصناف):</label>
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-xs text-red-400 hover:underline"
                >
                  محي السلة
                </button>
              </div>
              <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-900 text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="p-2.5">الموديل</th>
                      <th className="p-2.5">الاسم</th>
                      <th className="p-2.5">الكمية</th>
                      <th className="p-2.5">السعر</th>
                      <th className="p-2.5">الإجمالي</th>
                      <th className="p-2.5 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {cartItems.map((c) => (
                      <tr key={c.id} className="text-gray-300">
                        <td className="p-2.5 font-mono text-blue-400">{c.item.modelNumber}</td>
                        <td className="p-2.5">{c.item.name}</td>
                        <td className="p-2.5">{c.quantity}</td>
                        <td className="p-2.5">{formatCurrency(c.price)}</td>
                        <td className="p-2.5 font-bold text-green-400">{formatCurrency(c.quantity * c.price)}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(c.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-gray-800 text-sm">
                <span className="font-bold text-white">إجمالي الطلب:</span>
                <span className="font-extrabold text-green-400 text-base">
                  {formatCurrency(cartItems.reduce((sum, c) => sum + c.quantity * c.price, 0))}
                </span>
              </div>
            </div>
          )}

          {/* Client & Representative & Paid Amount */}
          <form onSubmit={handleAddSale} className="space-y-4">
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

            <div className="space-y-2 pt-2 border-t border-gray-800">
              <label className="text-sm font-medium text-gray-300">المبلغ المدفوع الآن</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={saleData.paidAmount}
                onChange={(e) => setSaleData({ ...saleData, paidAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <Button type="submit" variant="primary" className="flex-1">
                تأكيد عملية البيع
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsModalOpen(false);
                  setCartItems([]);
                  setSelectedProduct(null);
                }}
              >
                إلغاء
              </Button>
            </div>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">سبب التعديل (مطلوب)</label>
            <textarea
              required
              rows={2}
              placeholder="اكتب سبب تعديل بيانات الفاتورة..."
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
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
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title={`إرجاع بيع - ${returningSale?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleReturnSale} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">الكمية المرجعة</label>
            <input
              type="number"
              min="1"
              max={returningSale?.quantity}
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={returnData.quantity}
              onChange={(e) => setReturnData({ ...returnData, quantity: parseInt(e.target.value) || 1 })}
            />
            <p className="text-xs text-gray-500">الكمية الأصلية: {returningSale?.quantity}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">سبب الإرجاع</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={returnData.reason}
              onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
              placeholder="أدخل سبب الإرجاع..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              تأكيد الإرجاع
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
      </Modal>

      {/* Audit Logs Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`سجل تعديلات الفاتورة - ${selectedSaleForAudit?.name || ''}`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          {auditLogs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log._id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-xs text-blue-400 font-semibold">{formatDate(log.createdAt)}</span>
                    <span className="text-xs text-gray-400">بواسطة: {log.createdBy?.name || log.createdBy?.username || 'المستخدم'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-sm text-gray-400">نوع السجل</p>
                      <p className="text-white">
                        {log.action === 'sale_invoice_payment' ? 'تسجيل دفعة' : log.action === 'return_sale_invoice' ? 'مرتجع' : log.action === 'update_sale_invoice' ? 'تعديل فاتورة' : log.action}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">سبب التعديل / الملاحظات</p>
                      <p className="text-white">{log.details?.note || log.details?.reason || 'غير محدد'}</p>
                    </div>
                  </div>
                  {log.action === 'sale_invoice_payment' ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-950 p-4 rounded-xl border border-emerald-900/40">
                        <p className="text-xs text-emerald-400 font-semibold uppercase mb-2">تفاصيل الدفعة</p>
                        <p className="text-sm text-gray-300">المبلغ المدفوع: <span className="font-bold text-green-400">{formatCurrency(log.details?.amount || 0)}</span></p>
                        <p className="text-sm text-gray-300">طريقة الدفع: {
                          log.details?.method === 'cash' ? 'نقدي' :
                            log.details?.method === 'bank_transfer' ? 'تحويل بنكي' :
                              log.details?.method === 'cheque' ? 'شيك' : 'أخرى'
                        }</p>
                        <p className="text-sm text-gray-300">الرقم المرجعي: {log.details?.referenceNumber || '-'}</p>
                        <p className="text-sm text-gray-300">الملاحظات: {log.details?.note || '-'}</p>
                      </div>
                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase mb-2">حالة الفاتورة بعد الدفعة</p>
                        <p className="text-sm text-gray-300">المبلغ المدفوع الكلي: {formatCurrency(log.changes?.after?.paidAmount || 0)}</p>
                        <p className="text-sm text-gray-300">إجمالي الفاتورة: {formatCurrency(log.changes?.after?.total || 0)}</p>
                        <p className="text-sm text-gray-300">حالة الدفع: {
                          log.changes?.after?.paymentStatus === 'paid' ? 'مدفوعة بالكامل' :
                            log.changes?.after?.paymentStatus === 'partial' ? 'مدفوعة جزئيًا' : 'غير مدفوعة'
                        }</p>
                      </div>
                    </div>
                  ) : log.action === 'return_sale_invoice' ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <p className="text-xs text-gray-500 uppercase mb-2">تفاصيل المرتجع</p>
                        <p className="text-sm text-gray-300">الكمية المرجعة: {log.details?.quantity}</p>
                        <p className="text-sm text-gray-300">المبلغ الإجمالي للمرتجع: {formatCurrency(log.details?.total || 0)}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">لا توجد سجلات تعديل لهذه الفاتورة</p>
          )}
        </div>
      </Modal>

      <AddSalePaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => {
          setIsAddPaymentModalOpen(false);
          setSelectedSaleForPayment(null);
          setGroupPaymentTarget(null);
        }}
        sale={selectedSaleForPayment}
        groupTarget={groupPaymentTarget}
        onSuccess={fetchSales}
      />

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
