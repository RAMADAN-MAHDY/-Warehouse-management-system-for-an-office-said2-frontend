'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Loader2,
  Calendar,
  Search
} from 'lucide-react';
import { excelService, itemService } from '@/services/api';
import { InvoiceFile } from '@/types';
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
import { formatDate } from '@/lib/utils';

export default function ExcelFilesPage() {
  const [files, setFiles] = useState<InvoiceFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await excelService.getAll();
      if (response.status) {
        setFiles(response.data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الملفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    try {
      const response = await excelService.delete(id);
      if (response.status) {
        setFiles(files.filter(f => f._id !== id));
        toast.success('تم حذف الملف بنجاح');
      }
    } catch (error) {
      toast.error('فشل حذف الملف');
    }
  };

  const handleDownload = async (id: string, date: string) => {
    try {
      const blob = await excelService.download(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${date.split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileSpreadsheet className="text-emerald-500" />
            ملفات الإكسل المحفوظة
          </h1>
          <p className="text-gray-400 mt-1">إدارة وتحميل كافة الملفات التي قمت بتصديرها سابقاً</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-400">جاري تحميل الملفات...</p>
        </div>
      ) : (
        <Table data={files}>
          <TableHeader>
            <TableRow>
              <TableHead>تاريخ التصدير</TableHead>
              <TableHead>اسم الملف</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => (
                <TableRow key={file._id}>
                  <TableCell className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDate(file.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    Inventory_Export_{file._id.slice(-6)}.xlsx
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        icon={<Download size={16} />}
                        onClick={() => handleDownload(file._id, file.createdAt)}
                      >
                        تحميل
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(file._id)}
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
                <TableCell colSpan={3} className="text-center py-10 text-gray-500">
                  لا توجد ملفات إكسل محفوظة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
