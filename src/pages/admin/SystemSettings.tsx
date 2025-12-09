import React, { useState, useEffect } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { Settings, Save, AlertTriangle, Shield, Bell, Database, Key, Globe, Users, Lock, Unlock, Search, Edit } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SystemSetting {
  _id: string;
  key: string;
  value: string | boolean | number;
  description: string;
  category: 'general' | 'security' | 'notifications' | 'integration';
  isEditable: boolean;
}

export function SystemSettingsPage() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'general' | 'security' | 'notifications' | 'integration'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [editValue, setEditValue] = useState('');

  // Mock data - in a real app, this would come from API
  useEffect(() => {
    // Simulate API call
    const mockSettings: SystemSetting[] = [
      {
        _id: '1',
        key: 'app_name',
        value: 'TaskFlow',
        description: 'The name of the application',
        category: 'general',
        isEditable: true
      },
      {
        _id: '2',
        key: 'max_upload_size',
        value: 10,
        description: 'Maximum file upload size in MB',
        category: 'general',
        isEditable: true
      },
      {
        _id: '3',
        key: 'allow_public_boards',
        value: true,
        description: 'Allow users to create public boards',
        category: 'security',
        isEditable: true
      },
      {
        _id: '4',
        key: 'password_min_length',
        value: 8,
        description: 'Minimum password length requirement',
        category: 'security',
        isEditable: true
      },
      {
        _id: '5',
        key: 'email_notifications',
        value: true,
        description: 'Enable email notifications for users',
        category: 'notifications',
        isEditable: true
      },
      {
        _id: '6',
        key: 'maintenance_mode',
        value: false,
        description: 'Enable maintenance mode for the application',
        category: 'general',
        isEditable: true
      },
      {
        _id: '7',
        key: 'api_rate_limit',
        value: 100,
        description: 'API requests per minute limit',
        category: 'integration',
        isEditable: true
      },
      {
        _id: '8',
        key: 'app_version',
        value: '1.0.0',
        description: 'Current application version',
        category: 'general',
        isEditable: false
      }
    ];

    setTimeout(() => {
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.value.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterCategory === 'all' || setting.category === filterCategory;

    return matchesSearch && matchesFilter;
  });

  const handleEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setEditValue(setting.value.toString());
  };

  const handleSave = () => {
    if (editingSetting) {
      setSettings(settings.map(s =>
        s._id === editingSetting._id
          ? { ...s, value: editValue }
          : s
      ));
      setEditingSetting(null);
      // In a real app, this would call the backend to save the setting
      alert('Setting saved successfully!');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <Settings className="w-4 h-4 text-blue-600" />;
      case 'security': return <Shield className="w-4 h-4 text-green-600" />;
      case 'notifications': return <Bell className="w-4 h-4 text-yellow-600" />;
      case 'integration': return <Globe className="w-4 h-4 text-purple-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    return value.toString();
  };

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="System Settings"
        subtitle="Configure application settings"
      />

      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as 'all' | 'general' | 'security' | 'notifications' | 'integration')}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="security">Security</option>
                <option value="notifications">Notifications</option>
                <option value="integration">Integration</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                🔽
              </div>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No settings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSettings.map((setting) => (
              <div key={setting._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(setting.category)}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {getCategoryName(setting.category)}
                      </span>
                    </div>
                    {setting.isEditable && (
                      <button
                        onClick={() => handleEdit(setting)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit setting"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{setting.key}</h3>
                  <p className="text-sm text-gray-600 mb-4">{setting.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Value:</span>
                      {editingSetting?._id === setting._id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {formatValue(setting.value)}
                        </span>
                      )}
                    </div>

                    {editingSetting?._id === setting._id && (
                      <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                        title="Save changes"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    )}
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