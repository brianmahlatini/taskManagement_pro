import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { FileText, Upload, Search, Folder, File, Plus, Trash2, Download, Eye, Edit, MoreVertical, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Document {
  _id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  parentId?: string;
  fileUrl?: string;
  children?: Document[];
}

export function DocumentsPage() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  // Mock data - in a real app, this would come from API
  useEffect(() => {
    // Simulate API call
    const mockDocuments: Document[] = [
      {
        _id: '1',
        name: 'Project Documentation',
        type: 'folder',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        createdBy: 'user1',
        children: [
          {
            _id: '2',
            name: 'Technical Specifications.pdf',
            type: 'file',
            size: 2048,
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 86400000),
            createdBy: 'user1',
            fileUrl: '/documents/tech-specs.pdf'
          },
          {
            _id: '3',
            name: 'API Documentation.pdf',
            type: 'file',
            size: 1536,
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 86400000),
            createdBy: 'user1',
            fileUrl: '/documents/api-docs.pdf'
          }
        ]
      },
      {
        _id: '4',
        name: 'Meeting Notes',
        type: 'folder',
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        createdBy: 'user1',
        children: [
          {
            _id: '5',
            name: 'Sprint Planning.txt',
            type: 'file',
            size: 512,
            createdAt: new Date(Date.now() - 172800000),
            updatedAt: new Date(Date.now() - 172800000),
            createdBy: 'user1',
            fileUrl: '/documents/sprint-planning.txt'
          }
        ]
      },
      {
        _id: '6',
        name: 'Design Assets.zip',
        type: 'file',
        size: 10240,
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 259200000),
        createdBy: 'user1',
        fileUrl: '/documents/design-assets.zip'
      }
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to the backend
      const newDoc: Document = {
        _id: Date.now().toString(),
        name: file.name,
        type: 'file',
        size: file.size,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?._id || 'user1',
        fileUrl: `/documents/${file.name}`
      };

      setDocuments([...documents, newDoc]);
      setShowUploadModal(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Document = {
        _id: Date.now().toString(),
        name: newFolderName,
        type: 'folder',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?._id || 'user1',
        children: []
      };

      setDocuments([...documents, newFolder]);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return '📄';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (name.endsWith('.zip') || name.endsWith('.rar')) return '🗄️';
    if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.gif')) return '🖼️';
    return '📋';
  };

  const formatFileSize = (size: number = 0) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Documents"
        subtitle="Manage your project files and documents"
      />

      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>

            <button
              onClick={() => setShowNewFolderModal(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Folder</span>
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No documents found</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Your First Document</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((document) => (
              <div key={document._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                      {document.type === 'folder' ? (
                        <Folder className="w-6 h-6 text-blue-600" />
                      ) : (
                        <span className="text-2xl">{getFileIcon(document.name)}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{document.name}</h3>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {document.createdBy === user?._id ? 'You' : 'Team Member'}
                    </span>
                    <span>
                      {document.updatedAt.toLocaleDateString()}
                    </span>
                  </div>

                  {document.type === 'file' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{formatFileSize(document.size)}</span>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop files here or click to browse</p>
                <input
                  type="file"
                  onChange={handleUploadFile}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Browse Files
                </label>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="mt-4 w-full text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* New Folder Modal */}
        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}