import { create } from 'zustand';
import api from '../api/axios';

interface ActivityItem {
  _id: string;
  type: 'comment' | 'file' | 'member' | 'deadline' | 'completion' | 'board' | 'card';
  user: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  action: string;
  target: string;
  boardId?: string;
  cardId?: string;
  createdAt: Date;
  isRead: boolean;
}

interface ActivityState {
  activities: ActivityItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchActivities: (limit?: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (activityId: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchActivities: async (limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get(`/activities?limit=${limit}&sort=-createdAt`);
      set({ activities: data.activities, unreadCount: data.unreadCount, isLoading: false });
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ error: 'Failed to fetch activities', isLoading: false });
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post('/activities/mark-all-read');
      set(state => ({
        activities: state.activities.map(activity => ({ ...activity, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking activities as read:', error);
      set({ error: 'Failed to mark activities as read' });
    }
  },

  markAsRead: async (activityId) => {
    try {
      await api.post(`/activities/${activityId}/read`);
      set(state => ({
        activities: state.activities.map(activity =>
          activity._id === activityId ? { ...activity, isRead: true } : activity
        ),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0
      }));
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/activities/unread-count');
      set({ unreadCount: data.count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },
}));