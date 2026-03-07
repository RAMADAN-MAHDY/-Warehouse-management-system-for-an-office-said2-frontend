'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, XCircle, Info, Clock, CheckCheck } from 'lucide-react';
import { notificationService } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      if (response.status) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'subscription_approval':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'subscription_rejection':
        return <XCircle className="text-red-500" size={18} />;
      case 'subscription_request':
        return <Clock className="text-blue-500" size={18} />;
      default:
        return <Info className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full transition-all duration-200"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-gray-800">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bell size={16} className="text-blue-400" />
              التنبيهات
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                جاري التحميل...
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-700/50">
                {notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                    className={cn(
                      "p-4 hover:bg-gray-700/50 transition-colors cursor-pointer group relative",
                      !notif.isRead && "bg-blue-600/5"
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-full"></div>
                    )}
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm leading-relaxed",
                          notif.isRead ? "text-gray-400" : "text-gray-100 font-medium"
                        )}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar })}
                          </span>
                          {!notif.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="bg-gray-700/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="text-gray-500" size={24} />
                </div>
                <p className="text-gray-500 text-sm">لا توجد تنبيهات حالياً</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-gray-900/50 border-t border-gray-700 text-center">
              <span className="text-[11px] text-gray-500">عرض أحدث 50 تنبيه</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
