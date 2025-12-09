import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface CRDTOperation {
    id: string;
    timestamp: number;
    actor: string;
    field: string;
    value: any;
    boardId: string;
    cardId?: string;
}

interface CRDTState {
    [boardId: string]: {
        [field: string]: {
            value: any;
            version: number;
            lastUpdatedBy: string;
            lastUpdatedAt: number;
        };
    };
}

export class CRDTManager {
    private state: CRDTState = {};
    private pendingOperations: CRDTOperation[] = [];
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.setupSocketHandlers();
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log('CRDT: User connected:', socket.id);

            // Handle CRDT operations
            socket.on('crdt_operation', (operation: CRDTOperation) => {
                this.handleOperation(operation, socket);
            });

            // Request current state
            socket.on('request_crdt_state', (boardId: string) => {
                this.sendCurrentState(boardId, socket);
            });

            socket.on('disconnect', () => {
                console.log('CRDT: User disconnected:', socket.id);
            });
        });
    }

    public handleOperation(operation: CRDTOperation, socket: Socket) {
        // Validate operation
        if (!operation.id || !operation.timestamp || !operation.actor ||
            !operation.field || !operation.boardId) {
            console.error('Invalid CRDT operation:', operation);
            return;
        }

        // Add to pending operations
        this.pendingOperations.push(operation);

        // Apply operation to state
        this.applyOperation(operation);

        // Broadcast to all clients in the board room
        socket.to(operation.boardId).emit('crdt_operation', operation);

        // Acknowledge receipt
        socket.emit('crdt_ack', { operationId: operation.id });
    }

    private applyOperation(operation: CRDTOperation) {
        if (!this.state[operation.boardId]) {
            this.state[operation.boardId] = {};
        }

        if (!this.state[operation.boardId][operation.field]) {
            this.state[operation.boardId][operation.field] = {
                value: operation.value,
                version: 1,
                lastUpdatedBy: operation.actor,
                lastUpdatedAt: operation.timestamp
            };
        } else {
            // Conflict resolution: last-write-wins based on timestamp
            if (operation.timestamp > this.state[operation.boardId][operation.field].lastUpdatedAt) {
                this.state[operation.boardId][operation.field] = {
                    value: operation.value,
                    version: this.state[operation.boardId][operation.field].version + 1,
                    lastUpdatedBy: operation.actor,
                    lastUpdatedAt: operation.timestamp
                };
            }
        }
    }

    public sendCurrentState(boardId: string, socket: Socket) {
        if (this.state[boardId]) {
            socket.emit('crdt_state', {
                boardId,
                state: this.state[boardId]
            });
        } else {
            socket.emit('crdt_state', {
                boardId,
                state: {}
            });
        }
    }

    public getCurrentState(boardId: string): any {
        return this.state[boardId] || {};
    }

    public createOperation(boardId: string, field: string, value: any, actor: string, cardId?: string): CRDTOperation {
        return {
            id: uuidv4(),
            timestamp: Date.now(),
            actor,
            field,
            value,
            boardId,
            cardId
        };
    }
}