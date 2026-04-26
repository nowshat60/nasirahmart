import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AxiosInstance from '../axios/AxiosInstance';

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await AxiosInstance.get('notifications/get_notifications.php');
        const data = Array.isArray(response.data) ? response.data : [];
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();

    const socket = io();

    socket.on('notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Browser notification if possible
      if (Notification.permission === "granted") {
        new Notification(newNotification.title, { body: newNotification.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      await AxiosInstance.post('notifications/mark_read.php');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
