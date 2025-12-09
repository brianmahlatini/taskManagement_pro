import React, { useState } from 'react';
import { Board, User } from '../../types';
import { X, Users, Plus, Crown, Shield, Eye } from 'lucide-react';

interface MembersPanelProps {
  board: Board;
  onClose: () => void;
}

// Mock users for demonstration
const mockUsers: User[] = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    roles: ['user'],
    lastSeen: new Date(),
    createdAt: new Date('2024-01-01'),
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    roles: ['user'],
    lastSeen: new Date(),
    createdAt: new Date('2024-01-01'),
  },
];

export function MembersPanel({ board, onClose }: MembersPanelProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const membersWithUsers = board.members.map(member => ({
    ...member,
    user: mockUsers.find(user => user._id === member.userId),
  }));

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'member':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      // In a real app, this would send an invitation
      console.log('Inviting:', inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  return (
    <>
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors mb-6"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Invite members</span>
          </button>

          {/* Members List */}
          <div className="space-y-3">
            {membersWithUsers.map((member) => (
              <div key={member.userId} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {member.user?.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {member.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.user?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.user?.email || 'No email'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getRoleIcon(member.role)}
                  <span className="text-xs text-gray-500 capitalize">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Invite Members</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInvite();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}