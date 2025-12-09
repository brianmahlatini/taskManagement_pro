import React, { useEffect } from 'react';
import { MessageSquare, FileText, Users, Calendar, CheckCircle } from 'lucide-react';
import { useActivityStore } from '../../store/activityStore';

export function ActivityFeed() {
  const {
    activities,
    unreadCount,
    isLoading,
    error,
    fetchActivities,
    markAllAsRead
  } = useActivityStore();

  useEffect(() => {
    fetchActivities(10);
  }, [fetchActivities]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return { icon: MessageSquare, color: 'text-blue-600 bg-blue-100' };
      case 'file': return { icon: FileText, color: 'text-green-600 bg-green-100' };
      case 'member': return { icon: Users, color: 'text-purple-600 bg-purple-100' };
      case 'deadline': return { icon: Calendar, color: 'text-orange-600 bg-orange-100' };
      case 'completion': return { icon: CheckCircle, color: 'text-green-600 bg-green-100' };
      default: return { icon: MessageSquare, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        </div>
        <div className="text-center py-4 text-red-500">
          {error}
          <button
            onClick={() => fetchActivities(10)}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          disabled={unreadCount === 0}
        >
          {unreadCount > 0 ? `Mark all as read (${unreadCount})` : 'No unread activities'}
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => {
            const { icon: Icon, color } = getActivityIcon(activity.type);
            return (
              <div key={activity._id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user.name}</span>
                    {' '}
                    <span className="text-gray-600">{activity.action}</span>
                    {' '}
                    <span className="font-medium text-blue-600">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(activity.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}