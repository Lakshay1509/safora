
"use client";

import { useNotifications } from '@/hooks/useNotification'; 
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  

  return (
    <div className="relative">
     <button
  onClick={() => router.push('/community?view=notification')}
  className="relative flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-full p-2 hover:bg-gray-50 transition-all"
>
  <Bell className="h-4 w-4 text-gray-700 lg:h-5 lg:w-5" />
  

  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</button>


      {/* {isOpen && (
        <div className="absolute right-[-25px] lg:right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
  
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    notification.is_read === 0 ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-sm">{notification.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}
