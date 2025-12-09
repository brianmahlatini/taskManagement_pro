import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { Search, X, Calendar } from 'lucide-react';
import { Board, Card } from '../../types';

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const { searchResults, searchBoards } = useBoardStore();

  useEffect(() => {
    if (query.trim()) {
      searchBoards(query);
    }
  }, [query, searchBoards]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search boards and cards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none text-lg"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Start typing to search boards and cards</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {searchResults.map((result) => (
                <div
                  key={result._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    // Handle navigation to board/card
                    onClose();
                  }}
                >
                  {'listId' in result ? (
                    // Card result
                    <CardSearchResult card={result as Card} />
                  ) : (
                    // Board result
                    <BoardSearchResult board={result as Board} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BoardSearchResult({ board }: { board: Board }) {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: board.settings.backgroundColor }}
        />
        <h3 className="font-medium text-gray-900">{board.title}</h3>
        <span className="text-xs text-gray-500">Board</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        {board.members.length} member{board.members.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function CardSearchResult({ card }: { card: Card }) {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-300 rounded" />
        <h3 className="font-medium text-gray-900">{card.title}</h3>
        <span className="text-xs text-gray-500">Card</span>
      </div>
      {card.description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {card.description}
        </p>
      )}
      {card.dueDate && (
        <div className="flex items-center space-x-1 mt-2">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            Due {card.dueDate.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}