import { create } from 'zustand';
import api from '../api/axios';

interface Document {
  _id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  fileUrl?: string;
  createdBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentState {
  documents: Document[];
  currentFolder: string | null;
  isLoading: boolean;
  error: string | null;

  fetchDocuments: (parentId?: string) => Promise<void>;
  uploadDocument: (file: File, parentId?: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  setCurrentFolder: (folderId: string | null) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentFolder: null,
  isLoading: false,
  error: null,

  fetchDocuments: async (parentId) => {
    try {
      set({ isLoading: true, error: null });
      const url = parentId ? `/documents?parentId=${parentId}` : '/documents';
      const { data } = await api.get(url);
      set({ documents: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching documents:', error);
      set({ error: 'Failed to fetch documents', isLoading: false });
    }
  },

  uploadDocument: async (file, parentId) => {
    try {
      set({ isLoading: true, error: null });

      const formData = new FormData();
      formData.append('file', file);
      if (parentId) {
        formData.append('parentId', parentId);
      }

      const { data } = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh documents list
      await get().fetchDocuments(parentId || undefined);
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      set({ error: 'Failed to upload document', isLoading: false });
      throw error;
    }
  },

  createFolder: async (name, parentId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/documents/folders', {
        name,
        parentId: parentId || null
      });

      // Refresh documents list
      await get().fetchDocuments(parentId || undefined);
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      set({ error: 'Failed to create folder', isLoading: false });
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/documents/${documentId}`);

      // Refresh documents list
      await get().fetchDocuments(get().currentFolder || undefined);
    } catch (error) {
      console.error('Error deleting document:', error);
      set({ error: 'Failed to delete document', isLoading: false });
    }
  },

  setCurrentFolder: (folderId) => {
    set({ currentFolder: folderId });
  },
}));