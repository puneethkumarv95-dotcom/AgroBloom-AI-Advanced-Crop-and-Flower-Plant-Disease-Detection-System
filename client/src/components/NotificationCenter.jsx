import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle,
  Clock,
  Trash2,
  Calendar,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Sprout,
  Activity
} from 'lucide-react';

const NotificationCenter = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Non-fatal
    }
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get(`/notifications?unreadOnly=${filterUnread}&limit=25`);
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('[NotificationCenter Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 45000); // Polling every 45s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filterUnread]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncReminders = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/notifications/sync-reminders');
      if (res.data.success) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const requestBrowserPush = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        try {
          await api.put('/notifications/preferences', { browserAlerts: true });
        } catch (e) {
          // Non-fatal
        }
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications center"
        className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-agro-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
      >
        <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-100">
          
          {/* Unauthenticated View */}
          {!isAuthenticated ? (
            <div className="p-6 text-center text-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-agro-100 dark:bg-agro-950 text-agro-700 dark:text-agro-300 mx-auto flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('notifications')}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                  Log in to receive personalized plant care reminders, inspection alerts, and recovery tracking updates.
                </p>
              </div>
              <button
                onClick={() => { setIsOpen(false); navigate('/login'); }}
                className="w-full py-2 bg-agro-700 hover:bg-agro-800 text-white rounded-xl font-bold shadow-xs transition"
              >
                {t('login')}
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-agro-600 dark:text-agro-400" />
                  <span className="font-bold text-sm">{t('notifications')}</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-agro-100 dark:bg-agro-900 text-agro-800 dark:text-agro-200 px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleSyncReminders}
                disabled={syncing}
                title={t('syncReminders')}
                className="p-1 rounded text-slate-400 hover:text-agro-600 dark:hover:text-agro-400 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] text-agro-700 dark:text-agro-300 hover:underline font-semibold"
                >
                  {t('markAllRead')}
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex space-x-1.5">
              <button
                onClick={() => setFilterUnread(false)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  !filterUnread ? 'bg-agro-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterUnread(true)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  filterUnread ? 'bg-agro-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Unread
              </button>
            </div>

            {'Notification' in window && Notification.permission !== 'granted' && (
              <button
                onClick={requestBrowserPush}
                className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Enable Push
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Checking notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-agro-500 opacity-60" />
                <p>{t('noNotifications')}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id, n.link)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition cursor-pointer flex items-start space-x-3 ${
                    !n.isRead ? 'bg-agro-50/40 dark:bg-agro-950/20' : ''
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    n.type === 'care_reminder'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : n.type === 'inspection'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {n.type === 'care_reminder' ? (
                      <Sprout className="w-3.5 h-3.5" />
                    ) : n.type === 'inspection' ? (
                      <Activity className="w-3.5 h-3.5" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {n.title}
                      </p>
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="text-slate-400 hover:text-red-500 p-0.5 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                      {n.message}
                    </p>

                    <div className="flex items-center space-x-2 mt-1.5 text-[9px] text-slate-400">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-agro-600 inline-block"></span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )}
</div>
  );
};

export default NotificationCenter;
