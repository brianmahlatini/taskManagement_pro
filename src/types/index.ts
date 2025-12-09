export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  lastSeen: Date;
  createdAt: Date;
}

export interface BoardMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  user?: User;
}

export interface Board {
  _id: string;
  title: string;
  ownerId: string;
  members: BoardMember[];
  settings: {
    backgroundColor?: string;
    isPrivate: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  _id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: Date;
}

export interface Label {
  _id: string;
  name: string;
  color: string;
}

export interface Attachment {
  _id: string;
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
}

export interface Card {
  _id: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  position: number;
  labels: Label[];
  dueDate?: Date;
  assignees: string[];
  attachments: Attachment[];
  commentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  cardId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  mentions?: string[];
  createdAt: Date;
  user?: User;
  replies?: Comment[];
}

export interface Activity {
  _id: string;
  boardId: string;
  actorId: string;
  actionType: 'card_created' | 'card_updated' | 'card_moved' | 'card_deleted' | 'member_added' | 'member_removed' | 'board_updated';
  meta: Record<string, any>;
  createdAt: Date;
  actor?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'mention' | 'card_due' | 'member_added' | 'comment_added';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  meta?: Record<string, any>;
}

export interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
}