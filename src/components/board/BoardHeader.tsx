import React from 'react';
import { Board } from '../../types';
import { Star, Users, Activity, MoreHorizontal, Search, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../../store/boardStore';

interface BoardHeaderProps {
  board: Board;
  onShowActivity: () => void;
  onShowMembers: () => void;
}

export function BoardHeader({ board, onShowActivity, onShowMembers }: BoardHeaderProps) {
  const navigate = useNavigate();
  const { searchBoards } = useBoardStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    searchBoards(e.target.value);
  };

  return (
    <header
      className="border-b border-gray-200"
      style={{
        background: `linear-gradient(135deg, ${board.settings.backgroundColor}10, ${board.settings.backgroundColor}05)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Board Info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Back to Boards
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900">{board.title}</h1>
              <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                <Star className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => navigate(`/board/${board._id}/analytics`)}
              className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="text-sm">Analytics</span>
            </button>
            {/* Member Avatars */}
            <div className="flex items-center -space-x-2">
              {board.members.slice(0, 3).map((member, index) => (
                <div
                  key={member.userId}
                  className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                  style={{ zIndex: board.members.length - index }}
                >
                  {member.userId?.name ? member.userId.name.substring(0, 2).toUpperCase() : 'TM'}
                </div>
              ))}
              {board.members.length > 3 && (
                <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{board.members.length - 3}
                </div>
              )}
            </div>

            <button
              onClick={onShowMembers}
              className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">Members</span>
            </button>

            <button
              onClick={onShowActivity}
              className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm">Activity</span>
            </button>

            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}