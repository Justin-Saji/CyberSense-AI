import React, { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Zero-Day Vulnerability Shield Active',
      message: 'Autonomous behavioral engine mitigated 3 suspicious outbound traffic requests.',
      timestamp: '10 mins ago',
      type: 'warning',
      unread: true,
    },
    {
      id: 2,
      title: 'SMS Phishing Pattern Identified',
      message: 'New credential harvesting vector flagged in regional telecom node.',
      timestamp: '1 hour ago',
      type: 'danger',
      unread: true,
    },
    {
      id: 3,
      title: 'Security Compliance Audit Passed',
      message: 'ISO 27001 & SOC-2 compliance check automated verification scored 99.4%.',
      timestamp: '3 hours ago',
      type: 'success',
      unread: false,
    },
  ]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        notifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
