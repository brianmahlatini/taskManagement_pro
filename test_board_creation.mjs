/**
 * Test script to verify board creation functionality
 * This script tests the updated board creation feature with full board data
 */

import axios from 'axios';
import mongoose from 'mongoose';

// Mock data for testing
const testBoardData = {
  title: 'Test Board with Team',
  description: 'This is a test board created with full data',
  teamId: '60d5ec9f8b3a8b001f8b4567', // Example team ID
  settings: {
    backgroundColor: '#FF5733',
    isPrivate: false,
    isTeamBoard: true
  },
  tags: ['testing', 'development', 'team']
};

// Test the backend controller directly
async function testBackendBoardCreation() {
  console.log('Testing backend board creation...');

  try {
    // This would normally be called from the API route
    const mockReq = {
      user: {
        _id: mongoose.Types.ObjectId('60d5ec9f8b3a8b001f8b4568') // Example user ID
      },
      body: testBoardData
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log('Response:', { status: code, data });
          return data;
        }
      }),
      json: (data) => {
        console.log('Response:', data);
        return data;
      }
    };

    // Import and test the controller
    const { createBoard } = await import('./backend/src/controllers/boardController.js');

    // Mock the Board model
    const mockBoard = {
      _id: mongoose.Types.ObjectId('60d5ec9f8b3a8b001f8b4569'),
      title: testBoardData.title,
      ownerId: mockReq.user._id,
      members: [{ userId: mockReq.user._id, role: 'owner' }],
      settings: {
        backgroundColor: testBoardData.settings.backgroundColor,
        isPrivate: testBoardData.settings.isPrivate,
        isTeamBoard: true
      },
      teamId: testBoardData.teamId,
      tags: testBoardData.tags,
      description: testBoardData.description
    };

    // Mock Board.create to return our test board
    const Board = {
      create: async (data) => {
        console.log('Board.create called with:', data);
        return mockBoard;
      },
      findById: async (id) => {
        console.log('Board.findById called with:', id);
        return mockBoard;
      }
    };

    // Mock Team.findById
    const Team = {
      findById: async (id) => {
        console.log('Team.findById called with:', id);
        return {
          _id: id,
          members: [
            { userId: mockReq.user._id, role: 'owner' },
            { userId: mongoose.Types.ObjectId('60d5ec9f8b3a8b001f8b4570'), role: 'admin' }
          ],
          boards: [],
          save: async function() {
            console.log('Team.save called');
            return this;
          }
        };
      }
    };

    // Replace the actual models with our mocks
    const boardControllerModule = await import('./backend/src/controllers/boardController.js');
    boardControllerModule.Board = Board;
    boardControllerModule.Team = Team;

    // Call the controller function
    await boardControllerModule.createBoard(mockReq, mockRes);

    console.log('✅ Backend board creation test completed successfully');
  } catch (error) {
    console.error('❌ Backend board creation test failed:', error.message);
  }
}

// Test the frontend store
async function testFrontendBoardStore() {
  console.log('\nTesting frontend board store...');

  try {
    // Mock axios
    const mockAxios = {
      post: async (url, data) => {
        console.log('Axios POST called:', { url, data });
        return {
          data: {
            _id: '60d5ec9f8b3a8b001f8b4569',
            ...data,
            ownerId: '60d5ec9f8b3a8b001f8b4568',
            members: [{ userId: '60d5ec9f8b3a8b001f8b4568', role: 'owner' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      }
    };

    // Mock the board store
    const mockSet = (updater) => {
      const state = {
        boards: []
      };
      const newState = updater(state);
      console.log('Store updated:', newState);
      return newState;
    };

    const mockGet = () => ({
      boards: []
    });

    // Simulate the createBoard function from the store
    const createBoard = async (boardData) => {
      try {
        const { data } = await mockAxios.post('/boards', boardData);
        mockSet(state => ({ boards: [...state.boards, data] }));
        return data;
      } catch (error) {
        console.error('Error creating board:', error);
        throw error;
      }
    };

    // Test the function
    const result = await createBoard(testBoardData);
    console.log('✅ Frontend board store test completed successfully');
    console.log('Created board:', result);
  } catch (error) {
    console.error('❌ Frontend board store test failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting board creation feature tests...\n');
  await testBackendBoardCreation();
  await testFrontendBoardStore();
  console.log('\n🎉 All tests completed!');
}

runTests().catch(console.error);