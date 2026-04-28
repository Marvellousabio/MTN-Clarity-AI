import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, ArrowRight, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatTimeAgo, getNotificationColor } from '../services/notificationService';
import type { Notification } from '../types';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.action) {
      navigate(`/app/${notification.action}`);
    }
    setIsOpen(false);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons: Record<string, string> = {
      savings: '💰',
      plan_update: '🔄',
      reminder: '⏰',
      system: '⚙️',
      message: '💬',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors relative group"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-slate-400 group-hover:text-mtn-blue transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-mtn-blue">Notifications</h3>
                <p className="text-[10px] font-medium text-slate-400">
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>
              {notifications.length > 0 && (
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => handleAction(e, markAllAsRead)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label="Mark all as read"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4 text-slate-400 hover:text-mtn-blue" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleAction(e, clearAllNotifications)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Clear all notifications"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">All caught up!</p>
                  <p className="text-[10px] text-slate-300">No new notifications</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left ${
                        !notification.read ? 'bg-mtn-yellow/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs font-bold truncate ${!notification.read ? 'text-mtn-blue' : 'text-slate-600'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-1.5 h-1.5 bg-mtn-yellow rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-[9px] text-slate-300 font-medium mt-1 block">
                            {formatTimeAgo(notification.time)}
                          </span>
                        </div>
                        {notification.action && (
                          <ArrowRight className="w-4 h-4 text-mtn-blue shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => {}}
                  className="w-full p-2 text-center text-xs font-bold text-mtn-blue hover:bg-mtn-yellow/10 rounded-lg transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
