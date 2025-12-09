import React, { useEffect } from 'react';
import { User, TrendingUp, Award, Clock } from 'lucide-react';
import { useTeamPerformanceStore } from '../../store/teamPerformanceStore';

export function TeamPerformance() {
  const {
    teamMembers,
    topPerformer,
    averageResponseTime,
    isLoading,
    error,
    fetchTeamPerformance,
    fetchTopPerformer,
    fetchAverageResponseTime
  } = useTeamPerformanceStore();

  useEffect(() => {
    fetchTeamPerformance();
    fetchTopPerformer();
    fetchAverageResponseTime();
  }, [fetchTeamPerformance, fetchTopPerformer, fetchAverageResponseTime]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
        </div>
        <div className="text-center py-4 text-red-500">
          {error}
          <button
            onClick={() => {
              fetchTeamPerformance();
              fetchTopPerformer();
              fetchAverageResponseTime();
            }}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={member.user.avatarUrl || `https://i.pravatar.cc/150?u=${member.user._id}`}
                  alt={member.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  member.status === 'online' ? 'bg-green-500' :
                  member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.user.name}</p>
                <p className="text-sm text-gray-500">{member.tasksCompleted} tasks completed</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>{member.efficiencyScore}%</span>
              </div>
              <p className="text-xs text-gray-500">efficiency</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Top Performer</p>
            <p className="text-xs text-gray-500">{topPerformer?.user.name || 'N/A'}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Avg. Response</p>
            <p className="text-xs text-gray-500">{averageResponseTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}