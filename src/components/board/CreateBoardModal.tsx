import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useTeamStore } from '../../store/teamStore';
import { X, Plus, Users, Lock, Unlock, Palette, Tag, Globe, Shield } from 'lucide-react';

interface CreateBoardForm {
  title: string;
  description: string;
  isPrivate: boolean;
  teamId?: string;
  backgroundColor: string;
  tags: string[];
  permissions: {
    canInvite: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export function CreateBoardModal({ onClose }: { onClose: () => void }) {
  const { createBoard } = useBoardStore();
  const { teams } = useTeamStore();
  const [formData, setFormData] = useState<CreateBoardForm>({
    title: '',
    description: '',
    isPrivate: false,
    backgroundColor: '#3B82F6',
    tags: [],
    permissions: {
      canInvite: true,
      canEdit: true,
      canDelete: false,
    },
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create board with form data
      await createBoard({
        title: formData.title,
        description: formData.description,
        settings: {
          isPrivate: formData.isPrivate,
          backgroundColor: formData.backgroundColor,
          permissions: formData.permissions
        },
        teamId: formData.teamId,
        tags: formData.tags
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        isPrivate: false,
        backgroundColor: '#3B82F6',
        tags: [],
        permissions: {
          canInvite: true,
          canEdit: true,
          canDelete: false,
        },
      });
      onClose();

    } catch (error) {
      console.error('Error creating board:', error);
      setError('Failed to create board. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backgroundColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Board</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Board Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Board Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Project Management, Marketing Campaign"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          {/* Board Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the purpose of this board..."
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Privacy & Team Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Settings</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPrivate"
                    checked={!formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1 text-blue-600" />
                    Public
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <Lock className="w-4 h-4 mr-1 text-gray-600" />
                    Private
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
                Team (Optional)
              </label>
              <select
                id="teamId"
                name="teamId"
                value={formData.teamId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Personal Board</option>
                {teams.map((team: any) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <div className="flex flex-wrap gap-2">
              {backgroundColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, backgroundColor: color }))}
                  className={`w-8 h-8 rounded-lg ${formData.backgroundColor === color ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add tag..."
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Member Permissions</label>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Allow members to invite others
                </span>
                <input
                  type="checkbox"
                  name="canInvite"
                  checked={formData.permissions.canInvite}
                  onChange={handlePermissionChange}
                  className="w-4 h-4 text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Allow members to edit board settings
                </span>
                <input
                  type="checkbox"
                  name="canEdit"
                  checked={formData.permissions.canEdit}
                  onChange={handlePermissionChange}
                  className="w-4 h-4 text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-red-600" />
                  Allow members to delete board
                </span>
                <input
                  type="checkbox"
                  name="canDelete"
                  checked={formData.permissions.canDelete}
                  onChange={handlePermissionChange}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Board</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}