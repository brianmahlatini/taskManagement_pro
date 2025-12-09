import React, { useState, useEffect } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { BarChart3, Download, Search, Calendar, Users, Activity, FileText, PieChart, LineChart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Report {
  _id: string;
  title: string;
  type: 'user_activity' | 'board_activity' | 'system_usage' | 'performance';
  description: string;
  createdAt: Date;
  data: any;
  generatedBy: string;
}

interface QuickStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
}

export function ReportsPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user_activity' | 'board_activity' | 'system_usage' | 'performance'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Mock data - in a real app, this would come from API
  useEffect(() => {
    // Simulate API call
    const mockReports: Report[] = [
      {
        _id: '1',
        title: 'User Activity Report',
        type: 'user_activity',
        description: 'User activity and engagement metrics',
        createdAt: new Date(Date.now() - 86400000 * 7),
        generatedBy: 'system',
        data: {
          activeUsers: 25,
          newUsers: 5,
          totalLogins: 125,
          averageSession: '12m 30s'
        }
      },
      {
        _id: '2',
        title: 'Board Productivity Report',
        type: 'board_activity',
        description: 'Board creation and usage statistics',
        createdAt: new Date(Date.now() - 86400000 * 3),
        generatedBy: 'system',
        data: {
          boardsCreated: 12,
          cardsCreated: 45,
          cardsCompleted: 32,
          averageCompletionTime: '2.5 days'
        }
      },
      {
        _id: '3',
        title: 'System Performance Report',
        type: 'performance',
        description: 'Application performance metrics',
        createdAt: new Date(Date.now() - 86400000),
        generatedBy: 'system',
        data: {
          uptime: '99.9%',
          responseTime: '120ms',
          errorRate: '0.1%',
          apiCalls: 1250
        }
      },
      {
        _id: '4',
        title: 'Storage Usage Report',
        type: 'system_usage',
        description: 'Storage and resource utilization',
        createdAt: new Date(Date.now() - 86400000 * 2),
        generatedBy: 'system',
        data: {
          totalStorage: '15.2 GB',
          usedStorage: '8.7 GB',
          freeStorage: '6.5 GB',
          usagePercentage: 57
        }
      }
    ];

    setTimeout(() => {
      setReports(mockReports);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || report.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'user_activity': return <Users className="w-5 h-5 text-blue-600" />;
      case 'board_activity': return <Activity className="w-5 h-5 text-green-600" />;
      case 'system_usage': return <PieChart className="w-5 h-5 text-purple-600" />;
      case 'performance': return <LineChart className="w-5 h-5 text-yellow-600" />;
      default: return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getReportTypeName = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const quickStats: QuickStat[] = [
    {
      title: 'Active Users',
      value: '25',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      change: 5
    },
    {
      title: 'Boards Created',
      value: '12',
      icon: <FileText className="w-6 h-6 text-green-600" />,
      change: 2
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      icon: <PieChart className="w-6 h-6 text-purple-600" />,
      change: 0.1
    },
    {
      title: 'API Calls',
      value: '1,250',
      icon: <BarChart3 className="w-6 h-6 text-yellow-600" />,
      change: 150
    }
  ];

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Reports"
        subtitle="View system analytics and reports"
      />

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change !== undefined && (
                    <p className={`text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change >= 0 ? '+' : ''}{stat.change} {stat.change >= 0 ? '▲' : '▼'}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'user_activity' | 'board_activity' | 'system_usage' | 'performance')}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="user_activity">User Activity</option>
                <option value="board_activity">Board Activity</option>
                <option value="system_usage">System Usage</option>
                <option value="performance">Performance</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                🔽
              </div>
            </div>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </button>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                        {getReportIcon(report.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {getReportTypeName(report.type)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Report Details</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(report.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <span className="font-medium text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-4">
                    <span>Generated on {report.createdAt.toLocaleDateString()}</span>
                    <span>By {report.generatedBy === 'system' ? 'System' : 'User'}</span>
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