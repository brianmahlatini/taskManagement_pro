import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Droppable, DropResult } from 'react-beautiful-dnd';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { BoardHeader } from './BoardHeader';
import { ListColumn } from './ListColumn';
import { CardModal } from './CardModal';
import { ActivityPanel } from './ActivityPanel';
import { MembersPanel } from './MembersPanel';
import { Plus } from 'lucide-react';
import { Card } from '../../types';
import { DragDropContextWrapper } from '../../components/common/DragDropContextWrapper';
import api from '../../api/axios';

export function BoardView() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const {
    boards,
    currentBoard,
    setCurrentBoard,
    fetchBoard,
    lists,
    cards,
    createList,
    moveCard,
    reorderLists,
    initializeStore,
    updateCard
  } = useBoardStore();
  const { user, isAuthenticated, debugState } = useAuthStore();
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (boardId) {
      const loadBoard = async () => {
        try {
          // First try to find the board in our existing boards array
          const board = boards.find(b => b._id === boardId);

          if (board) {
            // If we have the board, set it immediately
            setCurrentBoard(board);
          } else {
            // If not found, fetch it from the API
            await fetchBoard(boardId);

            // After fetching, try to find it again (it should be in boards now)
            const fetchedBoard = boards.find(b => b._id === boardId);
            if (fetchedBoard) {
              setCurrentBoard(fetchedBoard);
            } else {
              // Still not found, redirect to dashboard
              navigate('/dashboard');
            }
          }
        } catch (error) {
          console.error('Error loading board:', error);
          navigate('/dashboard');
        }
      };

      loadBoard();
    }
  }, [boardId, boards, setCurrentBoard, navigate, fetchBoard]);

  console.log('BoardView render - currentBoard:', currentBoard ? 'loaded' : 'null');
  console.log('BoardView render - user:', user ? 'loaded' : 'null');
  console.log('BoardView render - isAuthenticated:', isAuthenticated);

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
          <p className="text-sm text-gray-500 mt-2">Board data not loaded yet</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
          <p className="text-sm text-gray-500 mt-2">User data not loaded yet</p>
          <p className="text-sm text-gray-500 mt-1">Authentication status: {isAuthenticated ? 'authenticated' : 'not authenticated'}</p>
          <button
            onClick={() => debugState()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Debug Zustand State
          </button>
        </div>
      </div>
    );
  }

  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (type === 'list') {
      // Handle list reordering using the store's reorderLists function
      reorderLists(source.index, destination.index);

      // Call backend to persist the reordering
      try {
        await api.put(`/boards/${currentBoard._id}/lists/reorder`, {
          listId: result.draggableId,
          newPosition: destination.index
        });
      } catch (error) {
        console.error('Error reordering lists:', error);
        // Optionally revert the optimistic update on error
      }

      return;
    }

    if (type === 'card') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;
      const cardId = result.draggableId;

      moveCard(cardId, sourceListId, destListId, destination.index);
    }
  };

  const handleCreateList = () => {
    if (newListTitle.trim()) {
      createList(currentBoard._id, newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BoardHeader
        board={currentBoard}
        onShowActivity={() => setShowActivityPanel(true)}
        onShowMembers={() => setShowMembersPanel(true)}
      />

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <div className="p-6">
            <DragDropContextWrapper onDragEnd={handleDragEnd}>
              <Droppable droppableId="board" type="list" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex space-x-6 min-h-full"
                  >
                    {sortedLists.length === 0 ? (
                      <div className="flex items-center justify-center flex-1">
                        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to your new board!</h3>
                          <p className="text-gray-600 mb-4">This board is empty. Start by adding your first list.</p>
                          <button
                            onClick={() => setIsAddingList(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add First List</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      sortedLists.map((list, index) => (
                        <ListColumn
                          key={list._id}
                          list={list}
                          cards={cards.filter(card => card.listId === list._id)}
                          index={index}
                          onCardClick={setSelectedCard}
                        />
                      ))
                    )}

                    {/* Add List Column */}
                    <div className="flex-shrink-0 w-80">
                      {isAddingList ? (
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          <input
                            type="text"
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            placeholder="Enter list title..."
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateList();
                              } else if (e.key === 'Escape') {
                                setIsAddingList(false);
                                setNewListTitle('');
                              }
                            }}
                          />
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={handleCreateList}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Add List
                            </button>
                            <button
                              onClick={() => {
                                setIsAddingList(false);
                                setNewListTitle('');
                              }}
                              className="text-gray-600 hover:text-gray-800 px-3 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingList(true)}
                          className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Add another list</span>
                        </button>
                      )}
                    </div>
                    
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContextWrapper>
          </div>
        </div>

        {/* Activity Panel */}
        {showActivityPanel && (
          <ActivityPanel
            boardId={currentBoard._id}
            onClose={() => setShowActivityPanel(false)}
          />
        )}

        {/* Members Panel */}
        {showMembersPanel && (
          <MembersPanel
            board={currentBoard}
            onClose={() => setShowMembersPanel(false)}
          />
        )}
      </div>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={async (updates) => {
            console.log('Updating card:', selectedCard._id, updates);
            // Update card in store
            await updateCard(selectedCard._id, updates);
            // Update local selected card state to reflect changes
            const updatedCard = { ...selectedCard, ...updates };
            console.log('Updated card state:', updatedCard);
            setSelectedCard(updatedCard);
          }}
        />
      )}
    </div>
  );
}