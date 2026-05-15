import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, Clock, Calendar, FileText, Info, Shield, CheckCircle2, ChevronRight } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const cachedData = localStorage.getItem(`notifications_list_${user?.id}`);
  const [notifications, setNotifications] = useState(cachedData ? JSON.parse(cachedData) : []);
  const [loading, setLoading] = useState(!cachedData);


  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      const data = response.data.data || response.data || [];
      setNotifications(data);
      localStorage.setItem(`notifications_list_${user?.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      // Refetch to ensure everything is in sync
      fetchNotifications();
      // Also trigger a global event for the header count if needed
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      console.error('Failed to mark as read', error);
      alert('Error updating notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      console.error('Failed to mark all as read', error);
      alert('Error updating notifications');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'hearing': return <Calendar className="h-6 w-6 text-blue-400" />;
      case 'document': return <FileText className="h-6 w-6 text-emerald-400" />;
      case 'security': return <Shield className="h-6 w-6 text-rose-400" />;
      default: return <Info className="h-6 w-6 text-primary-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Intelligence Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Real-time updates on your judicial portfolio</p>
        </div>
        <button 
          onClick={handleMarkAllAsRead}
          className="flex items-center px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-primary-600 dark:text-primary-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-200 dark:border-white/10 transition-all shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card p-6 flex items-center space-x-6 animate-pulse">
                <div className="h-14 w-14 bg-white/5 rounded-2xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-1/4"></div>
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-32 glass-card">
            <div className="p-8 bg-gray-100 dark:bg-white/5 inline-block rounded-full mb-6">
              <Bell className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Zero Notifications</h3>
            <p className="text-gray-500 mt-2 font-medium">You are completely up to date with the registry.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`glass-card group flex items-start p-6 transition-all duration-300 relative overflow-hidden ${
                notif.read_at ? 'opacity-60 grayscale-[0.5]' : 'border-l-4 border-l-primary-500 shadow-2xl shadow-primary-500/10'
              }`}
            >
              {!notif.read_at && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 blur-3xl rounded-full"></div>
              )}
              
              <div className={`flex-shrink-0 mr-6 p-4 rounded-2xl transition-all ${
                notif.read_at ? 'bg-gray-100 dark:bg-white/5' : 'bg-primary-50 dark:bg-primary-600/10 shadow-inner'
              }`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-3 mb-1">
                  <p className={`text-lg font-black tracking-tight ${notif.read_at ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {notif.title}
                  </p>
                  {!notif.read_at && (
                     <span className="h-2 w-2 bg-primary-500 rounded-full animate-ping"></span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${notif.read_at ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                  {notif.message}
                </p>
                <div className="flex items-center mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {new Date(notif.created_at).toLocaleString()}
                </div>
              </div>

              <div className="ml-4 flex-shrink-0 flex items-center h-full self-center">
                <button 
                  onClick={() => !notif.read_at && markAsRead(notif.id)}
                  disabled={!!notif.read_at}
                  className={`p-3 rounded-xl transition-all shadow-sm ${
                    notif.read_at 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 cursor-default' 
                      : 'bg-gray-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 group-hover:scale-110 border border-gray-200 dark:border-transparent'
                  }`}
                  title={notif.read_at ? "Marked as Read" : "Mark as Read"}
                >
                  <Check className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
