import React, { useState, useEffect } from 'react';
import { TopBar } from '../layout/TopBar';
import { Plus, Users, UserPlus, Search, Mail, MapPin, MoreHorizontal } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';
import { useBoardStore } from '../../store/boardStore';
import api from '../../api/axios';

export function TeamPage() {
  const { teams, fetchTeams, createTeam, addTeamMember, setCurrentTeam, currentTeam } = useTeamStore();
  const { users, fetchUsers } = useBoardStore();
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'admin'>('member');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [createTeamError, setCreateTeamError] = useState<string | null>(null);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, [fetchTeams, fetchUsers]);

  // Create a map of userId to full user details
  const userDetailsMap = new Map();
  users.forEach(user => {
    userDetailsMap.set(user._id, user);
  });

  // Get full user details for team members
  const teamMembersWithDetails = currentTeam?.members.map(member => {
    const userDetails = userDetailsMap.get(member.userId);
    return {
      ...member,
      ...userDetails,
      role: member.role, // Ensure role from team membership is preserved
      status: member.status // Ensure status from team membership is preserved
    };
  }) || [];

  // Filter members based on search term
  const filteredMembers = teamMembersWithDetails.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Teams"
        subtitle="Manage your teams and team members"
        actions={
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </button>
            {currentTeam && (
              <button
                onClick={() => {
                  setShowAddMemberModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Teams Section - Always shown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Teams</h2>
              <p className="text-gray-600 mt-1">
                {teams.length === 0 ? 'You are not part of any teams yet' : `You are part of ${teams.length} team${teams.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Empty state when no teams */}
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-blue-50 rounded-lg p-6 inline-block mb-4">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800 font-medium">No teams found</p>
                <p className="text-blue-600 text-sm mt-1">Create your first team to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team._id}
                  onClick={() => setCurrentTeam(team)}
                  className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all cursor-pointer ${
                    currentTeam?._id === team._id
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-500">{team.members.length} members</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {team.description || 'No description provided'}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {team.members.slice(0, 3).map((member) => {
                          // Debug logging to understand the data structure
                          console.log('Member object:', member);
                          console.log('Member userId type:', typeof member.userId);
                          console.log('Member userId value:', member.userId);

                          // Handle both cases: when userId is a string or when it's a populated user object
                          let displayText = '';
                          if (typeof member.userId === 'string') {
                            // Case 1: userId is a string (not populated)
                            displayText = member.userId.substring(0, 2).toUpperCase();
                          } else if (member.userId && typeof member.userId === 'object') {
                            // Case 2: userId is a populated user object
                            const userObj = member.userId as any;
                            if (userObj.name) {
                              // Use first two letters of user's name
                              displayText = userObj.name.substring(0, 2).toUpperCase();
                            } else if (userObj._id) {
                              // Fallback to using the _id if name is not available
                              displayText = userObj._id.toString().substring(0, 2).toUpperCase();
                            } else {
                              // Final fallback
                              displayText = '??';
                            }
                          } else {
                            // Fallback for any other case
                            displayText = '??';
                          }

                          return (
                            <div key={typeof member.userId === 'string' ? member.userId : (member.userId as any)?._id?.toString() || 'fallback'} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                              {displayText}
                            </div>
                          );
                        })}
                        {team.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                            +{team.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTeam(team);
                        setShowAddMemberModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      <UserPlus className="w-3 h-3 inline mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members Section - Only shown when a team is selected */}
        {currentTeam && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                <p className="text-gray-600 mt-1">
                  Showing {filteredMembers.length} of {currentTeam.members.length} members in {currentTeam.name}
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* Members Grid */}
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No members match your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <div key={member._id} className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <img
                          src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' :
                          member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role || 'Team Member'}</p>
                      <p className="text-xs text-gray-500">{member.department || 'General'}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">{member.email}</span>
                      </div>
                      {member.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{member.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">-</p>
                          <p className="text-gray-500">Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">-</p>
                          <p className="text-gray-500">Projects</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Development, Marketing, Design"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="teamDescription"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="Describe the purpose of this team..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              {createTeamError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {createTeamError}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateTeamModal(false);
                    setCreateTeamError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newTeamName.trim()) {
                      setCreateTeamError('Team name is required');
                      return;
                    }

                    try {
                      setIsCreatingTeam(true);
                      setCreateTeamError(null);

                      await createTeam(newTeamName.trim(), newTeamDescription.trim());
                      await fetchTeams();

                      // Reset and close
                      setShowCreateTeamModal(false);
                      setNewTeamName('');
                      setNewTeamDescription('');
                      setIsCreatingTeam(false);

                    } catch (error) {
                      console.error('Error creating team:', error);
                      setCreateTeamError('Failed to create team');
                      setIsCreatingTeam(false);
                    }
                  }}
                  disabled={isCreatingTeam}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isCreatingTeam ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Member Email
                  </label>
                  <input
                    type="email"
                    id="memberEmail"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="memberRole"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as 'member' | 'admin')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {addMemberError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {addMemberError}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setAddMemberError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newMemberEmail) {
                      setAddMemberError('Please enter an email');
                      return;
                    }

                    try {
                      setIsAddingMember(true);
                      setAddMemberError(null);

                      // Find existing user by email
                      const usersResponse = await api.get('/users');
                      const userToAdd = usersResponse.data.find((u: any) =>
                        u.email.toLowerCase() === newMemberEmail.toLowerCase()
                      );

                      if (!userToAdd) {
                        setAddMemberError('User not found. Please ask them to register first.');
                        setIsAddingMember(false);
                        return;
                      }

                      // Check if user is already a member
                      if (currentTeam?.members.some(m => 
                        (typeof m.userId === 'string' ? m.userId : m.userId._id) === userToAdd._id
                      )) {
                        setAddMemberError('User is already a member of this team');
                        setIsAddingMember(false);
                        return;
                      }

                      // Add existing user directly to team
                      if (currentTeam) {
                        await addTeamMember(currentTeam._id, userToAdd._id, newMemberRole);
                      }

                      // Refresh team data
                      await fetchTeams();

                      // Close modal and reset
                      setShowAddMemberModal(false);
                      setNewMemberEmail('');
                      setNewMemberRole('member');
                      setIsAddingMember(false);

                    } catch (error) {
                      console.error('Error adding member:', error);
                      setAddMemberError('Failed to add member');
                      setIsAddingMember(false);
                    }
                  }}
                  disabled={isAddingMember}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isAddingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}