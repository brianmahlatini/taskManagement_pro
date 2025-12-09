import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { Archive, Search, Trash2, RotateCcw, Eye, Calendar, User, Tag, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ArchivedItem {
  _id: string;
  type: 'board' | 'card' | 'list' | 'document';
  title: string;
  description?: string;
  archivedAt: Date;
  archivedBy: string;
  originalId: string;
  meta?: {
    boardId?: string;
    listId?: string;
    labels?: string[];
    dueDate?: Date;
    attachments?: number;
    comments?: number;
  };
}

export function ArchivePage() {
  const { user } = useAuthStore();
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'boards' | 'cards' | 'documents'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in a real app, this would come from API
  useEffect(() => {
    // Simulate API call
    const mockArchivedItems: ArchivedItem[] = [
      {
        _id: '1',
        type: 'board',
        title: 'Old Project Board',
        description: 'Project that was completed last year',
        archivedAt: new Date(Date.now() - 86400000 * 30),
        archivedBy: 'user1',
        originalId: 'board-123'
      },
      {
        _id: '2',
        type: 'card',
        title: 'Completed Task',
        description: 'Task that was completed and archived',
        archivedAt: new Date(Date.now() - 86400000 * 7),
        archivedBy: 'user2',
        originalId: 'card-456',
        meta: {
          boardId: 'board-789',
          labels: ['completed', 'backend'],
          comments: 3,
          attachments: 1
        }
      },
      {
        _id: '3',
        type: 'document',
        title: 'Old Specification.pdf',
        description: 'Outdated technical specification',
        archivedAt: new Date(Date.now() - 86400000 * 15),
        archivedBy: 'user1',
        originalId: 'doc-789'
      },
      {
        _id: '4',
        type: 'card',
        title: 'Deprecated Feature',
        description: 'Feature that was deprecated',
        archivedAt: new Date(Date.now() - 86400000 * 2),
        archivedBy: 'user3',
        originalId: 'card-101',
        meta: {
          boardId: 'board-789',
          labels: ['deprecated', 'frontend'],
          dueDate: new Date(Date.now() - 86400000 * 30),
          comments: 5
        }
      }
    ];

    setTimeout(() => {
      setArchivedItems(mockArchivedItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || item.type === filterType.replace('s', '');

    return matchesSearch && matchesFilter;
  });

  const handleRestore = (itemId: string) => {
    // In a real app, this would call the backend to restore the item
    setArchivedItems(archivedItems.filter(item => item._id !== itemId));
    // Show success message
    alert('Item restored successfully!');
  };

  const handlePermanentDelete = (itemId: string) => {
    // In a real app, this would call the backend to permanently delete
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      setArchivedItems(archivedItems.filter(item => item._id !== itemId));
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'board': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'card': return <FileText className="w-5 h-5 text-green-600" />;
      case 'document': return <FileText className="w-5 h-5 text-purple-600" />;
      default: return <Archive className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Archive"
        subtitle="View and manage archived items"
      />

      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search archive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'boards' | 'cards' | 'documents')}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="boards">Boards</option>
                <option value="cards">Cards</option>
                <option value="documents">Documents</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                🔽
              </div>
            </div>
          </div>
        </div>

        {/* Archive Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading archive...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No archived items found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
                            {item.type}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Archived on {formatDate(item.archivedAt)}
                          </span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {item.archivedBy === user?._id ? 'You' : 'Team Member'}
                          </span>
                          {item.meta?.labels && item.meta.labels.length > 0 && (
                            <span className="flex items-center">
                              <Tag className="w-3 h-3 mr-1" />
                              {item.meta.labels.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleRestore(item._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}