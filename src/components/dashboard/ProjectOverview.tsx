import React from 'react';
import { Board } from '../../types';
import { MoreHorizontal, Users, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectOverviewProps {
  boards: Board[];
}

export function ProjectOverview({ boards }: ProjectOverviewProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Overview</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {boards.slice(0, 5).map((board) => (
          <div key={board._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: board.settings.backgroundColor }}
              />
              <div>
                <h4 className="font-medium text-gray-900">{board.title}</h4>
                <p className="text-sm text-gray-500">
                  Updated {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{board.members.length}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>85%</span>
              </div>
              
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: '85%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}