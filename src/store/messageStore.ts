import { create } from 'zustand';
import api from '../api/axios';

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  sender?: {
    name: string;
    avatarUrl?: string;
  };
}

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  users: any[];

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  createConversation: (participantId: string) => Promise<Conversation>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  fetchUsers: () => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  users: [],

  fetchUsers: async () => {
    try {
      const { data } = await api.get('/messages/users');
      set({ users: data });
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ error: 'Failed to fetch users' });
    }
  },

  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/messages/conversations');
      set({ conversations: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ error: 'Failed to fetch conversations', isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
      set({ messages: data, isLoading: false });

      // Mark messages as read
      await api.post(`/messages/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: 'Failed to fetch messages', isLoading: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post(`/messages/conversations/${conversationId}/messages`, { content });

      // Add new message to local state
      set(state => ({
        messages: [...state.messages, data],
        isLoading: false
      }));

      // Update conversation last message
      get().fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: 'Failed to send message', isLoading: false });
    }
  },

  markAsRead: async (conversationId) => {
    try {
      await api.post(`/messages/conversations/${conversationId}/read`);
      // Update local state to mark messages as read
      set(state => ({
        messages: state.messages.map(msg =>
          msg.conversationId === conversationId ? { ...msg, isRead: true } : msg
        )
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  createConversation: async (participantId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/messages/conversations', { participantId });
      set(state => ({ conversations: [...state.conversations, data], isLoading: false }));
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      set({ error: 'Failed to create conversation', isLoading: false });
      throw error;
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },
}));