import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';
import api from '../api/axios';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<string>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  debugState: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // Debug function to check current state
      debugState: () => {
        const state = get();
        console.log('Current auth state:', {
          user: state.user,
          token: state.token ? 'present' : 'null',
          isAuthenticated: state.isAuthenticated
        });
        return state;
      },

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { data } = response;

          // Validate API response structure
          if (!data || !data.token) {
            throw new Error('Invalid API response: missing token');
          }

          // Check if user data is nested (data.user) or at root level
          const userResponse = data.user || data;

          if (!userResponse || !userResponse._id) {
            throw new Error('Invalid API response: missing user data');
          }

          console.log('Login successful, setting user data:', userResponse);
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Set user data with explicit type handling including required fields
          const userData = {
            _id: userResponse._id,
            name: userResponse.name,
            email: userResponse.email,
            roles: userResponse.roles || ['member'],
            permissions: userResponse.permissions || [],
            isSuperAdmin: userResponse.isSuperAdmin || false,
            status: userResponse.status || 'active',
            lastSeen: new Date(),
            createdAt: new Date()
          };

          set({ user: userData, token: data.token, refreshToken: data.refreshToken, isAuthenticated: true });

          // Verify the state was set correctly
          setTimeout(() => {
            const state = get();
            console.log('Post-login state verification:', {
              user: state.user,
              token: state.token ? 'present' : 'null',
              isAuthenticated: state.isAuthenticated
            });
          }, 1000);
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      register: async (name, email, password) => {
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({ user: data.user, token: data.token, refreshToken: data.refreshToken, isAuthenticated: true });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      refreshAuthToken: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await api.post('/auth/refresh', { refreshToken });
          const { data } = response;

          if (!data || !data.token || !data.refreshToken) {
            throw new Error('Invalid refresh token response');
          }

          // Update tokens
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);

          set({ token: data.token, refreshToken: data.refreshToken, isAuthenticated: true });

          return data.token;
        } catch (error) {
          console.error('Refresh token failed:', error);
          // Clear tokens on failure
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('Checking auth, token:', token ? 'present' : 'missing', 'refreshToken:', refreshToken ? 'present' : 'missing');

        if (token) {
          try {
            console.log('Token found, fetching user data...');
            // Set authenticated state immediately to avoid UI delay
            set({ isAuthenticated: true, token, refreshToken: refreshToken || null });

            // Fetch user data in background
            const response = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const { data } = response;

            // Check if user data is nested (data.user) or at root level
            const userResponse = data.user || data;

            if (!userResponse || !userResponse._id) {
              throw new Error('Invalid API response: missing user data');
            }

            console.log('User data received:', userResponse);

            // Set user data explicitly with proper type handling
            const userData = {
              _id: userResponse._id,
              name: userResponse.name,
              email: userResponse.email,
              roles: userResponse.roles || ['member'],
              permissions: userResponse.permissions || [],
              isSuperAdmin: userResponse.isSuperAdmin || false,
              status: userResponse.status || 'active',
              lastSeen: new Date(),
              createdAt: new Date()
            };

            console.log('Setting user data in store:', userData);
            set({ user: userData, isAuthenticated: true, token, refreshToken: refreshToken || null });

            // Verify the state was set correctly
            setTimeout(() => {
              const state = get();
              console.log('Post-checkAuth state verification:', {
                user: state.user,
                token: state.token ? 'present' : 'null',
                refreshToken: state.refreshToken ? 'present' : 'null',
                isAuthenticated: state.isAuthenticated
              });
            }, 1000);
          } catch (error) {
            console.error('Auth check failed:', error);
            // Try to refresh token if available
            if (refreshToken) {
              try {
                console.log('Attempting to refresh token...');
                const newToken = await get().refreshAuthToken();
                console.log('Token refreshed successfully, retrying auth check');
                // Retry auth check with new token
                await get().checkAuth();
                return;
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }
            // Clear tokens on failure
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          }
        } else if (refreshToken) {
          console.log('No token but refresh token available, attempting to refresh...');
          try {
            const newToken = await get().refreshAuthToken();
            console.log('Token refreshed successfully, retrying auth check');
            // Retry auth check with new token
            await get().checkAuth();
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Clear tokens on failure
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          }
        } else {
          console.log('No token found, setting unauthenticated state');
          // No token, immediately set unauthenticated
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // Don't persist user data - we'll fetch it fresh on app load
      }),
    }
  )
);