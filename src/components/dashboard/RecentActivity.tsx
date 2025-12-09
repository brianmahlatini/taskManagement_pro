import React from 'react';
import { Activity as ActivityType } from '../../types';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  activities: ActivityType[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity._id} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">
                    {activity.actorId === '1' ? 'John Doe' : 'Team Member'}
                  </span>
                  {' '}
                  {getActivityMessage(activity.actionType, activity.meta)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getActivityMessage(actionType: string, meta: Record<string, any>): string {
  switch (actionType) {
    case 'card_created':
      return `created a new card "${meta.title}"`;
    case 'card_updated':
      return `updated card "${meta.title}"`;
    case 'card_moved':
      return `moved card "${meta.title}"`;
    case 'card_deleted':
      return `deleted card "${meta.title}"`;
    case 'member_added':
      return `added a new member to the team`;
    case 'member_removed':
      return `removed a member from the team`;
    case 'board_updated':
      return `updated board settings`;
    case 'board_created':
      return `created a new board`;
    default:
      return 'performed an action';
  }
}