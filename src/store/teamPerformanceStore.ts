import { create } from 'zustand';
import api from '../api/axios';

interface TeamMemberPerformance {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatarUrl?: string;
    email: string;
  };
  tasksCompleted: number;
  efficiencyScore: number;
  status: 'online' | 'away' | 'offline';
  lastActive: Date;
  performanceTrend: 'up' | 'down' | 'stable';
}

interface TeamPerformanceState {
  teamMembers: TeamMemberPerformance[];
  topPerformer: TeamMemberPerformance | null;
  averageResponseTime: string;
  isLoading: boolean;
  error: string | null;

  fetchTeamPerformance: (teamId?: string) => Promise<void>;
  fetchTopPerformer: (teamId?: string) => Promise<void>;
  fetchAverageResponseTime: (teamId?: string) => Promise<void>;
}

export const useTeamPerformanceStore = create<TeamPerformanceState>((set, get) => ({
  teamMembers: [],
  topPerformer: null,
  averageResponseTime: '0 hours',
  isLoading: false,
  error: null,

  fetchTeamPerformance: async (teamId) => {
    try {
      // Check authentication state first
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found - cannot fetch team performance');
        set({
          teamMembers: [],
          topPerformer: null,
          averageResponseTime: 'N/A',
          isLoading: false
        });
        return;
      }

      set({ isLoading: true, error: null });
      const url = teamId ? `/team-performance?teamId=${teamId}` : '/team-performance';
      console.log('Fetching team performance from URL:', url);
      console.log('Full URL will be:', api.defaults.baseURL + url);
      console.log('Using auth token:', token ? 'YES' : 'NO');

      const { data } = await api.get(url);

      // Handle "no teams found" as empty state, not error
      if (data.message === 'No teams found') {
        set({
          teamMembers: [],
          topPerformer: null,
          averageResponseTime: 'N/A',
          isLoading: false
        });
        return;
      }

      set({
        teamMembers: data.members || [],
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error fetching team performance:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication required for team performance');
        set({ error: 'Please log in to view team performance', isLoading: false });
      } else if (error.response && error.response.status === 404) {
        console.warn('Team performance endpoint not found');
        set({ error: 'Team performance service unavailable', isLoading: false });
      } else {
        set({ error: 'Failed to fetch team performance', isLoading: false });
      }
    }
  },

  fetchTopPerformer: async (teamId) => {
    try {
      // Check authentication state first
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found - cannot fetch top performer');
        set({ topPerformer: null });
        return;
      }

      const url = teamId ? `/team-performance/top-performer?teamId=${teamId}` : '/team-performance/top-performer';
      console.log('Fetching top performer from URL:', url);
      console.log('Full URL will be:', api.defaults.baseURL + url);
      console.log('Using auth token:', token ? 'YES' : 'NO');

      const { data } = await api.get(url);

      // Handle "no teams found" gracefully
      if (data.message === 'No teams found' || data.message === 'Not found' || !data._id) {
        set({ topPerformer: null });
        return;
      }

      set({ topPerformer: data });
    } catch (error: any) {
      console.error('Error fetching top performer:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication required for top performer');
        set({ error: 'Please log in to view top performer' });
      } else if (error.response && error.response.status === 404) {
        console.warn('Top performer endpoint not found');
        // Don't set error for 404 - it's expected if no teams exist
      } else {
        set({ error: 'Failed to fetch top performer' });
      }
    }
  },

  fetchAverageResponseTime: async (teamId) => {
    try {
      // Check authentication state first
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found - cannot fetch response time');
        set({ averageResponseTime: 'N/A' });
        return;
      }

      const url = teamId ? `/team-performance/response-time?teamId=${teamId}` : '/team-performance/response-time';
      console.log('Fetching response time from URL:', url);
      console.log('Full URL will be:', api.defaults.baseURL + url);
      console.log('Using auth token:', token ? 'YES' : 'NO');

      const { data } = await api.get(url);

      // Handle "no teams found" gracefully
      if (data.message === 'No teams found' || data.message === 'Not found' || data.averageResponseTime === 'N/A') {
        set({ averageResponseTime: 'N/A' });
        return;
      }

      set({ averageResponseTime: data.averageResponseTime || 'N/A' });
    } catch (error: any) {
      console.error('Error fetching average response time:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication required for response time');
        set({ error: 'Please log in to view response time' });
      } else if (error.response && error.response.status === 404) {
        console.warn('Response time endpoint not found');
        // Don't set error for 404 - it's expected if no teams exist
      } else {
        set({ error: 'Failed to fetch response time' });
      }
    }
  },

  // Debug function to check user's team memberships
  debugUserTeams: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found - cannot debug team memberships');
        return { error: 'Not authenticated' };
      }

      console.log('Calling debug endpoint to check team memberships...');
      const { data } = await api.get('/team-performance/debug-teams');
      console.log('Debug result:', data);
      return data;
    } catch (error: any) {
      console.error('Error calling debug endpoint:', error);
      return { error: 'Failed to fetch debug info', details: error.message };
    }
  },
}));