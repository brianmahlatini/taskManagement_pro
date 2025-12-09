import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

interface NotificationsBubbleProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationsBubble({ onClick, className = '' }: NotificationsBubbleProps) {
  const { unreadCount } = useNotificationStore();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onClick}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}