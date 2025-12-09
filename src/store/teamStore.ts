import { create } from 'zustand';
import api from '../api/axios';

interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'member';
    status: 'active' | 'inactive' | 'pending';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;

  fetchTeams: () => Promise<void>;
  fetchTeamById: (teamId: string) => Promise<void>;
  createTeam: (name: string, description?: string) => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;
  addTeamMember: (teamId: string, userId: string, role?: 'owner' | 'admin' | 'member') => Promise<any>;
  fetchTeamMembers: (teamId: string) => Promise<any>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,

  fetchTeams: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/teams');
      set({ teams: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching teams:', error);
      set({ error: 'Failed to fetch teams', isLoading: false });
    }
  },

  fetchTeamById: async (teamId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get(`/teams/${teamId}`);
      set({ currentTeam: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching team:', error);
      set({ error: 'Failed to fetch team', isLoading: false });
    }
  },

  createTeam: async (name, description = '') => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/teams', { name, description });
      set(state => ({
        teams: [...state.teams, data],
        isLoading: false
      }));
      return data;
    } catch (error) {
      console.error('Error creating team:', error);
      set({ error: 'Failed to create team', isLoading: false });
      throw error;
    }
  },

  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  },

  // Add team member functionality
  addTeamMember: async (teamId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member') => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post(`/teams/${teamId}/members`, { userId, role });
      set(state => ({
        teams: state.teams.map(team =>
          team._id === teamId ? { ...team, members: data.members } : team
        ),
        isLoading: false
      }));
      return data;
    } catch (error) {
      console.error('Error adding team member:', error);
      set({ error: 'Failed to add team member', isLoading: false });
      throw error;
    }
  },

  // Fetch team members
  fetchTeamMembers: async (teamId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get(`/teams/${teamId}/members`);
      set(state => ({
        teams: state.teams.map(team =>
          team._id === teamId ? { ...team, members: data } : team
        ),
        isLoading: false
      }));
      return data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      set({ error: 'Failed to fetch team members', isLoading: false });
      throw error;
    }
  },
}));