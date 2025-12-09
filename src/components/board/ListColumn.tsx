import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { List, Card } from '../../types';
import { CardPreview } from './CardPreview';
import { Plus, MoreHorizontal } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';

interface ListColumnProps {
  list: List;
  cards: Card[];
  index: number;
  onCardClick: (card: Card) => void;
}

export function ListColumn({ list, cards, index, onCardClick }: ListColumnProps) {
  const { createCard } = useBoardStore();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  const handleCreateCard = () => {
    if (newCardTitle.trim()) {
      createCard(list._id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex-shrink-0 w-80"
        >
          <div className="bg-gray-100 rounded-lg p-4">
            {/* List Header */}
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between mb-4"
            >
              <h3 className="font-semibold text-gray-900">{list.title}</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Cards */}
            <Droppable droppableId={list._id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[100px] ${
                    snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                  }`}
                >
                  {sortedCards.map((card, cardIndex) => (
                    <Draggable key={card._id} draggableId={card._id} index={cardIndex}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg z-50' : ''}`}
                          style={{
                            ...provided.draggableProps.style,
                            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                            touchAction: 'manipulation'
                          }}
                        >
                          <CardPreview card={card} onClick={() => onCardClick(card)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Card */}
            <div className="mt-3">
              {isAddingCard ? (
                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Enter a title for this card..."
                    className="w-full resize-none border-none outline-none text-sm"
                    rows={3}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateCard();
                      } else if (e.key === 'Escape') {
                        setIsAddingCard(false);
                        setNewCardTitle('');
                      }
                    }}
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={handleCreateCard}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCard(false);
                        setNewCardTitle('');
                      }}
                      className="text-gray-600 hover:text-gray-800 px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="w-full text-left text-gray-500 hover:text-gray-700 text-sm flex items-center space-x-2 p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add a card</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}