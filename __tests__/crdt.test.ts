import { CRDTManager } from '../backend/src/crdt/crdtManager';
import { Server } from 'socket.io';
import { createServer } from 'http';

describe('CRDT Manager', () => {
  let crdtManager: CRDTManager;
  let mockIo: any;
  let mockSocket: any;

  beforeEach(() => {
    // Create a mock Socket.IO server
    const httpServer = createServer();
    mockIo = new Server(httpServer);
    crdtManager = new CRDTManager(mockIo);

    // Mock socket
    mockSocket = {
      id: 'test-socket-1',
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };
  });

  describe('Operation Creation', () => {
    it('should create a valid CRDT operation', () => {
      const operation = crdtManager.createOperation(
        'board-1',
        'card_title',
        'Test Card',
        'user-1',
        'card-1'
      );

      expect(operation).toHaveProperty('id');
      expect(operation.timestamp).toBeGreaterThan(0);
      expect(operation.actor).toBe('user-1');
      expect(operation.field).toBe('card_title');
      expect(operation.value).toBe('Test Card');
      expect(operation.boardId).toBe('board-1');
      expect(operation.cardId).toBe('card-1');
    });
  });

  describe('Operation Handling', () => {
    it('should handle valid operations and update state', () => {
      const operation = crdtManager.createOperation(
        'board-1',
        'card_title',
        'Test Card',
        'user-1'
      );

      crdtManager.handleOperation(operation, mockSocket);

      // Check that the operation was added to pending operations
      const state = crdtManager.getCurrentState('board-1');
      expect(state).toHaveProperty('card_title');
      expect(state.card_title.value).toBe('Test Card');
    });

    it('should resolve conflicts using last-write-wins', () => {
      // First operation
      const op1 = {
        id: 'op-1',
        timestamp: 1000,
        actor: 'user-1',
        field: 'card_title',
        value: 'First Title',
        boardId: 'board-1',
      };

      // Second operation with later timestamp
      const op2 = {
        id: 'op-2',
        timestamp: 2000,
        actor: 'user-2',
        field: 'card_title',
        value: 'Second Title',
        boardId: 'board-1',
      };

      crdtManager.handleOperation(op1, mockSocket);
      crdtManager.handleOperation(op2, mockSocket);

      const state = crdtManager.getCurrentState('board-1');
      expect(state.card_title.value).toBe('Second Title');
      expect(state.card_title.lastUpdatedBy).toBe('user-2');
    });
  });

  describe('State Management', () => {
    it('should return empty state for unknown board', () => {
      const state = crdtManager.getCurrentState('unknown-board');
      expect(state).toEqual({});
    });

    it('should maintain separate states for different boards', () => {
      const op1 = crdtManager.createOperation('board-1', 'field1', 'value1', 'user-1');
      const op2 = crdtManager.createOperation('board-2', 'field2', 'value2', 'user-2');

      crdtManager.handleOperation(op1, mockSocket);
      crdtManager.handleOperation(op2, mockSocket);

      const state1 = crdtManager.getCurrentState('board-1');
      const state2 = crdtManager.getCurrentState('board-2');

      expect(state1).toHaveProperty('field1');
      expect(state2).toHaveProperty('field2');
      expect(state1).not.toHaveProperty('field2');
      expect(state2).not.toHaveProperty('field1');
    });
  });
});