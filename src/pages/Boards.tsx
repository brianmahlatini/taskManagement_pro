import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { TopBar } from '../components/layout/TopBar';
import { Plus, Search, Grid, List, Filter, Users, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { CreateBoardModal } from '../components/board/CreateBoardModal';

export function BoardsPage() {
  const { boards, fetchBoards, createBoard } = useBoardStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'mine' | 'shared' | 'recent'>('all');

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const filteredBoards = boards.filter(board => {
    // Filter by search term
    const matchesSearch = board.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by filter mode
    let matchesFilter = true;
    if (filter === 'mine') {
      matchesFilter = board.ownerId === user?._id;
    } else if (filter === 'shared') {
      matchesFilter = board.ownerId !== user?._id;
    } else if (filter === 'recent') {
      // Show boards from last 30 days
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      matchesFilter = new Date(board.createdAt) >= recentDate;
    }

    return matchesSearch && matchesFilter;
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateBoard = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Boards"
        subtitle="Manage your project boards"
      />

      {/* Controls */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleCreateBoard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Board</span>
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600'}`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'mine' | 'shared' | 'recent')}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Boards</option>
                <option value="mine">My Boards</option>
                <option value="shared">Shared with Me</option>
                <option value="recent">Recent</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Boards Content */}
      <div className="p-6">
        {filteredBoards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No boards found</p>
            <button
              onClick={handleCreateBoard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Board</span>
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredBoards.map((board) => (
              viewMode === 'grid' ? (
                <div key={board._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <Link to={`/board/${board._id}`} className="block p-6 h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="w-6 h-6 rounded flex-shrink-0"
                        style={{ backgroundColor: board.settings.backgroundColor }}
                      />
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {board.settings.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{board.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">No description available</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {board.members?.length || 1} members
                      </span>
                      <span className="flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {new Date(board.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </div>
              ) : (
                <div key={board._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <Link to={`/board/${board._id}`} className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-8 h-8 rounded flex-shrink-0"
                        style={{ backgroundColor: board.settings.backgroundColor }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{board.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">No description available</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {board.members?.length || 1}
                      </span>
                      <span className="flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {new Date(board.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}