import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { useNotificationStore } from '../store/notificationStore';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuthStore();
  const { currentBoard, updateCard } = useBoardStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!user || !token) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NODE_ENV === 'production' ? 'wss://api.taskflow.com' : 'ws://localhost:3001', {
      auth: {
        token,
      },
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Presence and cursor events
    socket.on('presence_update', (data) => {
      console.log('Presence update received:', data);
      // Handle presence updates (e.g., show user online status)
    });

    socket.on('cursor_position', (data) => {
      console.log('Cursor position received:', data);
      // Handle cursor position updates (e.g., show collaborative cursors)
    });

    // Board events
    socket.on('card_updated', (data) => {
      console.log('DEBUG: card_updated event received:', data);
      updateCard(data.cardId, data.updates);
      // addActivity(data.boardId, data.actorId, 'card_updated', data.meta);
    });

    socket.on('card_moved', (data) => {
      console.log('DEBUG: card_moved event received:', data);
      // addActivity(data.boardId, data.actorId, 'card_moved', data.meta);
    });

    socket.on('comment_added', (data) => {
      addNotification({
        userId: user._id,
        type: 'comment_added',
        title: 'New Comment',
        message: `${data.authorName} commented on "${data.cardTitle}"`,
        isRead: false,
        meta: { cardId: data.cardId, boardId: data.boardId },
      });
    });

    socket.on('user_presence', (data) => {
      // Handle user presence updates
      console.log('User presence:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token, updateCard, addNotification]);

  const joinBoard = (boardId: string) => {
    socketRef.current?.emit('join_board', { boardId });
  };

  const leaveBoard = (boardId: string) => {
    socketRef.current?.emit('leave_board', { boardId });
  };

  const emitCardUpdate = (cardId: string, updates: any) => {
    socketRef.current?.emit('card_updated', { cardId, updates });
  };

  const emitTyping = (boardId: string, userId: string, userName: string, isTyping: boolean, cardId?: string) => {
    socketRef.current?.emit('typing', { boardId, userId, userName, isTyping, cardId });
  };

  const emitPresenceUpdate = (boardId: string, userId: string, userName: string, status: string) => {
    socketRef.current?.emit('presence_update', { boardId, userId, userName, status });
  };

  const emitCursorPosition = (boardId: string, userId: string, userName: string, position: { x: number, y: number }, cardId?: string) => {
    socketRef.current?.emit('cursor_position', { boardId, userId, userName, position, cardId });
  };

  return {
    socket: socketRef.current,
    joinBoard,
    leaveBoard,
    emitCardUpdate,
    emitTyping,
    emitPresenceUpdate,
    emitCursorPosition,
  };
}