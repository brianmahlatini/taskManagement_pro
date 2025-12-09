import { Server, Socket } from 'socket.io';
import { CRDTManager } from '../crdt/crdtManager';

export const socketHandler = (io: Server) => {
    // Initialize CRDT Manager
    const crdtManager = new CRDTManager(io);

    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Join board room
        socket.on('join_board', (boardId: string) => {
            socket.join(boardId);
            console.log(`User ${socket.id} joined board ${boardId}`);

            // Send current CRDT state when joining a board
            crdtManager.createOperation(boardId, 'user_joined', {
                userId: socket.id,
                timestamp: Date.now()
            }, socket.id);
        });

        // Leave board room
        socket.on('leave_board', (boardId: string) => {
            socket.leave(boardId);
            console.log(`User ${socket.id} left board ${boardId}`);
        });

        // Card events with CRDT support
        socket.on('card_created', (data) => {
            // Create CRDT operation for card creation
            const operation = crdtManager.createOperation(
                data.boardId,
                `card_${data.cardId}_created`,
                data,
                socket.id
            );

            // Apply and broadcast the operation
            crdtManager.handleOperation(operation, socket);
            socket.to(data.boardId).emit('card_created', data);
        });

        socket.on('card_updated', (data) => {
            // Create CRDT operation for card update
            const operation = crdtManager.createOperation(
                data.boardId,
                `card_${data.cardId}_${data.field}`,
                data.updates,
                socket.id,
                data.cardId
            );

            // Apply and broadcast the operation
            crdtManager.handleOperation(operation, socket);
            socket.to(data.boardId).emit('card_updated', data);
        });

        socket.on('card_moved', (data) => {
            // Create CRDT operation for card move
            const operation = crdtManager.createOperation(
                data.boardId,
                `card_${data.cardId}_position`,
                { fromList: data.fromList, toList: data.toList, position: data.position },
                socket.id,
                data.cardId
            );

            // Apply and broadcast the operation
            crdtManager.handleOperation(operation, socket);
            socket.to(data.boardId).emit('card_moved', data);
        });

        socket.on('card_deleted', (data) => {
            // Create CRDT operation for card deletion
            const operation = crdtManager.createOperation(
                data.boardId,
                `card_${data.cardId}_deleted`,
                { deleted: true },
                socket.id,
                data.cardId
            );

            // Apply and broadcast the operation
            crdtManager.handleOperation(operation, socket);
            socket.to(data.boardId).emit('card_deleted', data);
        });

        // Comment events
        socket.on('comment_added', (data) => {
            socket.to(data.boardId).emit('comment_added', data);
        });

        // Typing indicator
        socket.on('typing', (data) => {
            console.log('Typing event received:', data);
            // Broadcast typing indicator to other users in the same board
            socket.to(data.boardId).emit('typing', {
                userId: socket.id,
                userName: data.userName,
                isTyping: data.isTyping,
                cardId: data.cardId,
            });
        });

        // Presence update
        socket.on('presence_update', (data) => {
            console.log('Presence update received:', data);
            socket.to(data.boardId).emit('presence_update', {
                userId: socket.id,
                userName: data.userName,
                status: data.status,
            });
        });

        // Cursor position for collaborative editing
        socket.on('cursor_position', (data) => {
            console.log('Cursor position received:', data);
            // Broadcast cursor position to other users in the same board
            socket.to(data.boardId).emit('cursor_position', {
                userId: socket.id,
                userName: data.userName,
                position: data.position,
                cardId: data.cardId,
            });
        });

        // CRDT-specific events
        socket.on('request_crdt_state', (boardId: string) => {
            crdtManager.createOperation(boardId, 'state_request', {
                userId: socket.id,
                timestamp: Date.now()
            }, socket.id);
        });

        socket.on('crdt_operation', (operation) => {
            crdtManager.handleOperation(operation, socket);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
