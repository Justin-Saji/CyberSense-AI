import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldAlert, CheckCircle, Info, X, CheckCheck } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAllAsRead } = useToast();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl glass-card text-slate-300 hover:text-white hover:border-sky-400/40 transition-colors"
        aria-label="Notification Center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-cyber-glow">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 glass-card bg-slate-900/95 border border-sky-400/30 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-bold text-slate-100">Live AI Threat Alerts</h4>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto my-2 pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`py-3 flex items-start space-x-3 transition-colors ${
                      item.unread ? 'bg-sky-500/5 px-2 rounded-lg' : ''
                    }`}
                  >
                    {item.type === 'danger' && <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
                    {item.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                    {item.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                    {item.type === 'info' && <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />}
                    
                    <div className="space-y-0.5 flex-1">
                      <h5 className="text-xs font-bold text-slate-200">{item.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-snug">{item.message}</p>
                      <span className="text-[10px] text-slate-500 block pt-1">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
