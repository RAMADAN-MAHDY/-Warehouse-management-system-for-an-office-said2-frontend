'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { superAdminService } from '@/services/api';
import { 
  ListRestart, 
  Search, 
  Loader2,
  Calendar,
  ShieldCheck,
  User as UserIcon,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await superAdminService.getAuditLogs();
      if (response.status) setLogs(response.data);
    } catch (error: any) {
      toast.error('فشل في تحميل سجلات التدقيق');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="max-w-7xl mx-auto py-2 px-2 sm:py-8 sm:px-4 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">سجلات النظام (Audit Logs)</h1>
            <p className="text-gray-400">متابعة كافة العمليات الحساسة التي تمت في النظام</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="بحث بالإجراء أو كود العميل..."
              className="w-full pr-12 pl-4 py-3 bg-gray-800/50 border border-gray-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log._id} className="glass-card p-6 rounded-2xl border border-gray-700/50 bg-gray-800/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-gray-700/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  log.action.includes('delete') ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                  log.action.includes('update') ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' :
                  'bg-blue-500/20 border-blue-500/30 text-blue-400'
                }`}>
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{log.action}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <UserIcon size={12} />
                      <span className="font-mono">{log.customerId || 'System'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(log.createdAt).toLocaleString('ar-EG')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                 <div className="px-3 py-1 bg-gray-800 rounded-lg border border-gray-700 text-xs font-mono text-gray-400 overflow-hidden text-ellipsis max-w-xs md:max-w-md">
                    {JSON.stringify(log.details)}
                 </div>
                 <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Info size={12} />
                    <span>IP: {log.ipAddress || 'Unknown'}</span>
                 </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-20 text-center">
              <ListRestart size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-lg">لا توجد سجلات لعرضها</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
