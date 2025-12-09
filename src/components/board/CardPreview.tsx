import React from 'react';
import { Card } from '../../types';
import { Calendar, Paperclip, MessageCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CardPreviewProps {
  card: Card;
  onClick: () => void;
}

export function CardPreview({ card, onClick }: CardPreviewProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer select-none"
      draggable="false"
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <span
              key={label._id}
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 mb-2">{card.title}</h4>

      {/* Description preview */}
      {card.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
      )}

      {/* Due date */}
      {card.dueDate && (
        <div className="flex items-center space-x-1 mb-2">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(card.dueDate, { addSuffix: true })}
          </span>
        </div>
      )}

      {/* Attachments Preview - Images */}
      {card.attachments && card.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {card.attachments.map((attachment) => {
            if (!attachment || !attachment.name) return null;
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.name);
            if (!isImage || !attachment.url) return null;
            
            return (
              <div key={attachment._id} className="relative group">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="h-14 w-14 object-cover rounded border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load image:', attachment.url);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Image loaded:', attachment.url);
                  }}
                />
                <div className="absolute -top-2 -right-2 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium text-gray-600 border border-white shadow-sm">
                  📎
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Attachments */}
          {card.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{card.attachments.length}</span>
            </div>
          )}

          {/* Comments */}
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{card.commentCount || 0}</span>
          </div>
        </div>

        {/* Assignees */}
        {card.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {card.assignees.slice(0, 3).map((assigneeId, index) => (
              <div
                key={assigneeId}
                className="w-6 h-6 bg-gray-300 rounded-full border border-white flex items-center justify-center"
                style={{ zIndex: card.assignees.length - index }}
              >
                <User className="w-3 h-3 text-gray-600" />
              </div>
            ))}
            {card.assignees.length > 3 && (
              <div className="w-6 h-6 bg-gray-100 rounded-full border border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{card.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}