import React, { useState, useEffect } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { Shield, Plus, Edit, Trash2, Lock, Unlock, Check, X, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
}

interface Permission {
  name: string;
  category: string;
}

export function RoleManagementPage() {
  const { user: currentUser } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Check if user has admin access
  const hasAdminAccess = currentUser?.roles?.includes('admin') || currentUser?.isSuperAdmin || false;

  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all roles
        const rolesResponse = await fetch('/api/roles');
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setRoles(rolesData);
        }

        // Fetch all permissions
        const permissionsResponse = await fetch('/api/roles/permissions');
        if (permissionsResponse.ok) {
          const permissionsData = await permissionsResponse.json();
          setPermissions(permissionsData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      });

      if (response.ok) {
        const createdRole = await response.json();
        setRoles([...roles, createdRole]);
        setNewRole({ name: '', description: '', permissions: [] });
        setShowCreateRoleModal(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to create role: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Error creating role');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.name || !editingRole.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/roles/${editingRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions,
        }),
      });

      if (response.ok) {
        const updatedRole = await response.json();
        setRoles(roles.map(role => role._id === updatedRole._id ? updatedRole : role));
        setEditingRole(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to update role: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        const response = await fetch(`/api/roles/${roleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setRoles(roles.filter(role => role._id !== roleId));
        } else {
          const errorData = await response.json();
          alert(`Failed to delete role: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error deleting role');
      }
    }
  };

  const togglePermission = (permission: string) => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        permissions: editingRole.permissions.includes(permission)
          ? editingRole.permissions.filter(p => p !== permission)
          : [...editingRole.permissions, permission]
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.includes(permission)
          ? newRole.permissions.filter(p => p !== permission)
          : [...newRole.permissions, permission]
      });
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Organize permissions by category
  const permissionCategories = {
    'User Management': ['create_user', 'read_user', 'update_user', 'delete_user'],
    'Role Management': ['create_role', 'read_role', 'update_role', 'delete_role'],
    'Board Management': ['create_board', 'read_board', 'update_board', 'delete_board'],
    'Team Management': ['create_team', 'manage_team', 'delete_team'],
    'System Permissions': ['manage_permissions', 'view_all', 'edit_all', 'delete_all'],
    'Content Permissions': ['create_card', 'update_card', 'delete_card', 'create_comment', 'delete_comment'],
    'Admin Permissions': ['manage_settings', 'view_audit_logs', 'export_data']
  };

  // Check if user has permission to manage roles
  const canManageRoles = hasAdminAccess && (
    currentUser?.permissions?.includes('create_role') ||
    currentUser?.permissions?.includes('manage_permissions') ||
    currentUser?.isSuperAdmin
  );

  if (!hasAdminAccess) {
    return (
      <div className="flex-1 overflow-auto">
        <TopBar
          title="Access Denied"
          subtitle="You do not have permission to access this page"
        />
        <div className="p-6 text-center">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You need administrator privileges to access the Role Management page.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Role Management"
        subtitle="Create and manage user roles and permissions"
      />

      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {canManageRoles && (
              <button
                onClick={() => {
                  setEditingRole(null);
                  setNewRole({ name: '', description: '', permissions: [] });
                  setShowCreateRoleModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Role</span>
              </button>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Roles Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No roles found</p>
            {canManageRoles && (
              <button
                onClick={() => setShowCreateRoleModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Role</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoles.map((role) => (
                    <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500">{role._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{role.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <span key={permission} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          role.isDefault ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {role.isDefault ? 'Default' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {canManageRoles && !role.isDefault && (
                            <button
                              onClick={() => {
                                setEditingRole(role);
                                setShowCreateRoleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canManageRoles && !role.isDefault && (
                            <button
                              onClick={() => handleDeleteRole(role._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Role Modal */}
        {showCreateRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateRoleModal(false);
                    setEditingRole(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={editingRole ? editingRole.name : newRole.name}
                    onChange={(e) => {
                      if (editingRole) {
                        setEditingRole({ ...editingRole, name: e.target.value });
                      } else {
                        setNewRole({ ...newRole, name: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Project Manager, Content Editor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editingRole ? editingRole.description : newRole.description}
                    onChange={(e) => {
                      if (editingRole) {
                        setEditingRole({ ...editingRole, description: e.target.value });
                      } else {
                        setNewRole({ ...newRole, description: e.target.value });
                      }
                    }}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Describe what this role can do"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Permissions
                  </label>
                  <div className="space-y-6">
                    {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {categoryPermissions.map((permission) => (
                            <label key={permission} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <input
                                type="checkbox"
                                checked={(editingRole ? editingRole.permissions : newRole.permissions).includes(permission)}
                                onChange={() => togglePermission(permission)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                              />
                              <span className="text-sm text-gray-700">{permission}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoleModal(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingRole ? handleUpdateRole : handleCreateRole}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                >
                  {editingRole ? (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Update Role</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Role</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}