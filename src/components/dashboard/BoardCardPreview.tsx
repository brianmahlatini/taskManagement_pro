import React from 'react';
import { Board } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface BoardCardPreviewProps {
  board: Board;
  onClick?: () => void;
  className?: string;
}

export function BoardCardPreview({ board, onClick, className = '' }: BoardCardPreviewProps) {
  const userRole = board.members.find(member => member.userId === '1')?.role; // Current user

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 overflow-hidden ${className}`}
    >
      <div
        className="h-20 flex items-center justify-center"
        style={{ backgroundColor: board.settings.backgroundColor }}
      >
        <h3 className="text-white font-semibold text-lg text-center px-4">
          {board.title}
        </h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{board.members.length} member{board.members.length !== 1 ? 's' : ''}</span>
          <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
            {userRole}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Updated {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}