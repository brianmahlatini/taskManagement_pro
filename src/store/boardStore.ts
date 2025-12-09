import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Board, List, Card, Activity, Comment, UploadResult } from '../types';
import api from '../api/axios';
import { useAuthStore } from './authStore';
import OfflineQueue from '../utils/offlineQueue';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  cards: Card[];
  activities: Activity[];
  comments: Comment[];
  searchResults: (Board | Card)[];
  users: any[]; // User data with stats
  socket: Socket | null;

  // Board actions
  fetchBoards: () => Promise<void>;
  createBoard: (boardData: any) => Promise<void>;
  fetchBoard: (boardId: string) => Promise<void>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>; // Not implemented in backend yet but good to have
  setCurrentBoard: (board: Board | null) => void;

  // List actions
  createList: (boardId: string, title: string) => Promise<void>;
  updateList: (listId: string, updates: Partial<List>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  reorderLists: (startIndex: number, endIndex: number) => void; // Optimistic

  // Card actions
  createCard: (listId: string, title: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, sourceListId: string, destListId: string, destIndex: number) => Promise<void>;

  // Comment actions
  getComments: (cardId: string) => Promise<void>;
  addComment: (cardId: string, content: string, parentCommentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Search
  searchBoards: (query: string, filters?: any) => Promise<void>;

  // Activity
  fetchActivities: (boardId: string) => Promise<void>;

  // Analytics
  fetchAnalytics: (boardId: string) => Promise<any>;

  // Upload
  uploadFile: (file: File) => Promise<UploadResult>;

  // User management
  fetchUsers: () => Promise<void>;
  fetchUserStats: (userId: string) => Promise<any>;

  // Initialization
  initializeSocket: () => void;
  disconnectSocket: () => void;
  initializeStore: () => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  activities: [],
  comments: [],
  searchResults: [],
  users: [],
  socket: null,

  fetchBoards: async () => {
    try {
      const { data } = await api.get('/boards');
      set({ boards: data });
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  },

  createBoard: async (boardData: any) => {
    try {
      // Send all board data in a single API call
      const { data } = await api.post('/boards', boardData);

      // Optimistic update - add the complete board immediately
      set(state => ({ boards: [...state.boards, data] }));

      return data;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  },

  fetchBoard: async (boardId: string) => {
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      set({ currentBoard: data });

      // Fetch lists and activities using the correct API routes
      const [listsRes, activitiesRes] = await Promise.all([
        api.get(`/boards/${boardId}/lists`),
        api.get(`/activities/${boardId}`),
      ]);

      set({
        lists: listsRes.data || [],
        activities: activitiesRes.data || []
      });

      // Fetch cards for all lists
      const cardPromises = (listsRes.data || []).map((list: List) =>
        api.get(`/lists/${list._id}/cards`)
      );

      const cardResults = await Promise.all(cardPromises);
      const allCards = cardResults.flatMap(result => result.data || []);

      set({ cards: allCards });

    } catch (error) {
      console.error('Error fetching board:', error);
    }
  },

  updateBoard: async (boardId, updates) => {
    try {
      const { data } = await api.put(`/boards/${boardId}`, updates);
      set(state => ({
        boards: state.boards.map(b => b._id === boardId ? { ...b, ...data } : b),
        currentBoard: state.currentBoard?._id === boardId ? { ...state.currentBoard, ...data } : state.currentBoard
      }));
    } catch (error) {
      console.error('Error updating board:', error);
    }
  },

  deleteBoard: async (boardId) => {
    // Implement if API exists
  },

  setCurrentBoard: (board) => {
    set({ currentBoard: board });
    if (board) {
      get().fetchBoard(board._id);
      get().socket?.emit('join_board', board._id);
    } else {
      get().socket?.emit('leave_board', get().currentBoard?._id);
    }
  },

  createList: async (boardId, title) => {
    try {
      const { data } = await api.post(`/boards/${boardId}/lists`, { title });
      set(state => ({ lists: [...state.lists, data] }));
    } catch (error) {
      console.error('Error creating list:', error);
    }
  },

  updateList: async (listId, updates) => {
    try {
      const { data } = await api.put(`/lists/${listId}`, updates);
      set(state => ({
        lists: state.lists.map(l => l._id === listId ? { ...l, ...data } : l)
      }));
    } catch (error) {
      console.error('Error updating list:', error);
    }
  },

  deleteList: async (listId) => {
    try {
      await api.delete(`/lists/${listId}`);
      set(state => ({
        lists: state.lists.filter(l => l._id !== listId),
        cards: state.cards.filter(c => c.listId !== listId)
      }));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  },

  reorderLists: (startIndex, endIndex) => {
    set(state => {
      const lists = [...state.lists];
      const [removed] = lists.splice(startIndex, 1);
      lists.splice(endIndex, 0, removed);
      return { lists };
    });
    // TODO: Sync with backend
  },

  createCard: async (listId, title) => {
    try {
      const { data } = await api.post(`/lists/${listId}/cards`, { title });
      set(state => ({ cards: [...state.cards, data] }));
      get().socket?.emit('card_created', { ...data, boardId: get().currentBoard?._id });
    } catch (error) {
      console.error('Error creating card:', error);
    }
  },

  updateCard: async (cardId, updates) => {
    try {
      const { data } = await api.put(`/cards/${cardId}`, updates);
      set(state => ({
        cards: state.cards.map(c => c._id === cardId ? { ...c, ...data } : c)
      }));
      get().socket?.emit('card_updated', { ...data, boardId: get().currentBoard?._id });

      // Log activity for card update
      if (updates.title || updates.description || updates.position) {
        try {
          await api.post('/activities', {
            boardId: get().currentBoard?._id,
            actorId: useAuthStore.getState().user?._id,
            actionType: 'card_updated',
            meta: {
              cardId,
              updates: Object.keys(updates),
            }
          });
        } catch (activityError) {
          console.error('Error logging activity (will be queued for offline):', activityError);
          // Queue activity logging for offline
          OfflineQueue.addToQueue('CREATE', '/activities', {
            boardId: get().currentBoard?._id,
            actorId: useAuthStore.getState().user?._id,
            actionType: 'card_updated',
            meta: {
              cardId,
              updates: Object.keys(updates),
            }
          });
        }
      }
    } catch (error) {
      console.error('Error updating card:', error);
      // If offline, queue the update
      if (error instanceof Error && (error.message.includes('Network Error') || !navigator.onLine)) {
        OfflineQueue.addToQueue('UPDATE', `/cards/${cardId}`, updates);
      }
    }
  },

  deleteCard: async (cardId) => {
    try {
      await api.delete(`/cards/${cardId}`);
      set(state => ({
        cards: state.cards.filter(c => c._id !== cardId)
      }));
      get().socket?.emit('card_deleted', { _id: cardId, boardId: get().currentBoard?._id });
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  },

  moveCard: async (cardId, sourceListId, destListId, destIndex) => {
    // Store the previous state for rollback
    const previousState = get();
    const previousCards = previousState.cards;

    // Optimistic update with proper reordering
    set(state => {
      const cards = [...state.cards];
      
      // Find the card to move
      const cardIndex = cards.findIndex(c => c._id === cardId);
      if (cardIndex === -1) return state;

      const [movedCard] = cards.splice(cardIndex, 1);
      
      // Get all cards in the destination list
      const destListCards = cards
        .filter(c => c.listId === destListId)
        .sort((a, b) => a.position - b.position);

      // Insert the card at the destination index
      const updatedCard = { ...movedCard, listId: destListId, position: destIndex };
      
      // Update positions for all cards in destination list
      let insertPosition = 0;
      const reorderedCards = [];
      
      for (let i = 0; i < destListCards.length; i++) {
        if (insertPosition === destIndex) {
          reorderedCards.push(updatedCard);
        }
        const card = destListCards[i];
        reorderedCards.push({ ...card, position: i >= destIndex ? i + 1 : i });
        insertPosition++;
      }
      
      // If destination index is at the end
      if (insertPosition === destIndex) {
        reorderedCards.push(updatedCard);
      }

      // Replace all cards with updated ones
      const finalCards = cards.map(c => {
        const updated = reorderedCards.find(rc => rc._id === c._id);
        return updated || c;
      });
      
      // Add the moved card if it's not already in the cards array
      if (!finalCards.find(c => c._id === updatedCard._id)) {
        finalCards.push(updatedCard);
      }

      return { cards: finalCards };
    });

    try {
      await api.put(`/cards/${cardId}`, { listId: destListId, position: destIndex });
      get().socket?.emit('card_moved', { cardId, sourceListId, destListId, destIndex, boardId: get().currentBoard?._id });
    } catch (error) {
      console.error('Error moving card:', error);
      // Revert to previous state on error
      set({ cards: previousCards });
    }
  },

  getComments: async (cardId) => {
    try {
      const { data } = await api.get(`/cards/${cardId}/comments`);
      set({ comments: data });
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  },

  addComment: async (cardId, content, parentCommentId) => {
    try {
      const { data } = await api.post(`/cards/${cardId}/comments`, { content, parentCommentId });
      set(state => ({ comments: [...state.comments, data] }));
      get().socket?.emit('comment_added', { ...data, boardId: get().currentBoard?._id });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  },

  deleteComment: async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      set(state => ({ comments: state.comments.filter(c => c._id !== commentId) }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  },

  searchBoards: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const { data } = await api.get(`/search?${params}`);
      set({ searchResults: [...data.boards, ...data.cards] });
    } catch (error) {
      console.error('Error searching:', error);
    }
  },

  fetchActivities: async (boardId) => {
    try {
      const { data } = await api.get(`/activities/${boardId}`);
      set({ activities: data });
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  },

  fetchAnalytics: async (boardId) => {
    try {
      const { data } = await api.get(`/analytics/${boardId}`);
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  },

  uploadFile: async (file: File): Promise<UploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<UploadResult>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data; // Returns S3 file data (url, key, name, size, type)
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  initializeSocket: () => {
    const socket = io('http://localhost:5000'); // Should use env var

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('card_created', (data) => {
      set(state => ({ cards: [...state.cards, data] }));
    });

    socket.on('card_updated', (data) => {
      set(state => ({
        cards: state.cards.map(c => c._id === data._id ? data : c)
      }));
    });

    socket.on('card_moved', (data) => {
      // Handle move
    });

    // ... other events

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  initializeStore: async () => {
    await get().fetchBoards();
    await get().fetchUsers();
    // Fetch other initial data if needed
  },

  fetchUsers: async () => {
    try {
      const { data } = await api.get('/users');
      set({ users: data });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },

  fetchUserStats: async (userId: string) => {
    try {
      const { data } = await api.get(`/users/${userId}/stats`);
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  },
}));