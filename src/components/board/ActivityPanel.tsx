import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { X, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityPanelProps {
  boardId: string;
  onClose: () => void;
}

export function ActivityPanel({ boardId, onClose }: ActivityPanelProps) {
  const { activities } = useBoardStore();
  
  const boardActivities = activities
    .filter(activity => activity.boardId === boardId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {boardActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Actions on this board will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {boardActivities.map((activity) => (
              <div key={activity._id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">
                    {activity.actorId === '1' ? 'JD' : 'TM'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {activity.actorId === '1' ? 'John Doe' : 'Team Member'}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {getActivityMessage(activity.actionType, activity.meta)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
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

function getActivityMessage(actionType: string, meta: Record<string, any>): string {
  switch (actionType) {
    case 'card_created':
      return `created card "${meta.title}"`;
    case 'card_updated':
      return `updated card "${meta.title}"`;
    case 'card_moved':
      return `moved card "${meta.title}" to ${meta.listTitle}`;
    case 'card_deleted':
      return `deleted card "${meta.title}"`;
    case 'member_added':
      return `added ${meta.memberName} to the board`;
    case 'member_removed':
      return `removed ${meta.memberName} from the board`;
    case 'board_updated':
      return `updated the board`;
    case 'board_created':
      return `created the board`;
    default:
      return 'performed an action';
  }
}