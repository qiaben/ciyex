import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Error fetching notifications:', errorData.error);
          return;
        }
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleView = async (id: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error marking notification as read:', errorData.error);
        return;
      }
      
      setOpen(false);
      router.push('/my-tests');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative focus:outline-none">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 font-semibold border-b">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 ${!n.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex-1 text-sm">
                    {n.message}
                  </div>
                  {n.testId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => handleView(n.id)}
                    >
                      View
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 