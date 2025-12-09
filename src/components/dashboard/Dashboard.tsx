import React, { useEffect, useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { Plus, Clock, Users, Star } from 'lucide-react';
import { Board } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { CreateBoardModal } from './CreateBoardModal';
import { BoardsList } from './BoardsList';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { boards, initializeStore } = useBoardStore();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const userBoards = boards.filter(board => 
    board.members.some(member => member.userId === user?._id)
  );

  const recentBoards = [...userBoards]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const handleBoardClick = (board: Board) => {
    navigate(`/board/${board._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-8 h-8 mb-2" />
          <h3 className="font-semibold mb-1">Create Board</h3>
          <p className="text-sm opacity-90">Start a new project</p>
        </button>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{userBoards.length}</span>
          </div>
          <h3 className="font-medium text-gray-700">Active Boards</h3>
          <p className="text-sm text-gray-500">Boards you're part of</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {userBoards.reduce((acc, board) => acc + board.members.length, 0)}
            </span>
          </div>
          <h3 className="font-medium text-gray-700">Team Members</h3>
          <p className="text-sm text-gray-500">Across all boards</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {boards.filter(board => board.ownerId === user?._id).length}
            </span>
          </div>
          <h3 className="font-medium text-gray-700">Owned Boards</h3>
          <p className="text-sm text-gray-500">Boards you created</p>
        </div>
      </div>

      {/* Recent Boards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Boards</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentBoards.map((board) => (
            <div
              key={board._id}
              onClick={() => handleBoardClick(board)}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${board.settings.backgroundColor}20, ${board.settings.backgroundColor}10)`,
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: board.settings.backgroundColor }}
                  />
                  <span className="text-xs text-gray-500">
                    {board.members.length} member{board.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 truncate">
                  {board.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Updated {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Boards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Boards</h2>
        <BoardsList
          boards={userBoards}
          onBoardClick={handleBoardClick}
        />
      </div>

      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
