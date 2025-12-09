import React from 'react';
import { Board } from '../../types';
import { BoardCardPreview } from './BoardCardPreview';

interface BoardsListProps {
  boards: Board[];
  onBoardClick?: (board: Board) => void;
  className?: string;
}

export function BoardsList({ boards, onBoardClick, className = '' }: BoardsListProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {boards.map((board) => (
        <BoardCardPreview
          key={board._id}
          board={board}
          onClick={() => onBoardClick?.(board)}
        />
      ))}
    </div>
  );
}