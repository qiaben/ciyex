import React, { useState, useEffect } from 'react';
import { Bell, X, MapPin, FileText, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'result' | 'promotion' | 'location' | 'general';
  read: boolean;
  date: Date;
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Test Results Available',
    message: 'Your Complete Blood Count results are now available to view.',
    type: 'result',
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    title: 'Weekend Special: 15% Off',
    message: 'Get 15% off on all wellness packages this weekend!',
    type: 'promotion',
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    title: 'New Lab Location',
    message: 'We have opened a new collection center near your location.',
    type: 'location',
    read: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  }
];

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Calculate unread notifications
    const count = notifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'result':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'promotion':
        return <Info className="h-4 w-4 text-green-500" />;
      case 'location':
        return <MapPin className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    // Less than an hour
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min ago`;
    }
    // Less than a day
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    }
    // Otherwise show the date
    return date.toLocaleDateString();
  };

  return (
    <div className="relative z-20">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleToggle}
        className="relative"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead} 
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h4 className={`text-sm font-medium ${!notif.read ? 'text-blue-800' : 'text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          <button onClick={() => deleteNotification(notif.id)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{formatDate(notif.date)}</span>
                          {!notif.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notif.id)} 
                              className="text-xs text-blue-600 hover:text-blue-800 h-6 px-2"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
