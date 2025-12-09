import React, { useState } from 'react';
import { Card, Comment } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { X, Calendar, Paperclip, Tag, User, MessageCircle, Download, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updates: Partial<Card>) => void;
}

export function CardModal({ card, onClose, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [dueDate, setDueDate] = useState(card.dueDate?.toString() || '');
  const [assignees, setAssignees] = useState<string[]>(card.assignees || []);
  const [labels, setLabels] = useState(card.labels || []);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showLabelsPanel, setShowLabelsPanel] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [users] = useState<any[]>([]);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { uploadFile, addComment, getComments } = useBoardStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load comments when modal opens
  React.useEffect(() => {
    const loadComments = async () => {
      try {
        await getComments(card._id);
        // Get comments from global state
        const cardComments = useBoardStore.getState().comments.filter(c => c.cardId === card._id);
        setComments(cardComments);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    loadComments();
  }, [card._id, getComments]);

  // Update local state when card attachments change
  React.useEffect(() => {
    setComments(useBoardStore.getState().comments.filter(c => c.cardId === card._id));
  }, [card.attachments.length, card._id]);

  // Handle member removal
  const handleRemoveMember = async (userId: string) => {
    const newAssignees = assignees.filter(id => id !== userId);
    setAssignees(newAssignees);
    await onUpdate({ assignees: newAssignees });
  };

  // Handle label removal
  const handleRemoveLabel = async (labelId: string) => {
    const newLabels = labels.filter(l => l._id !== labelId);
    setLabels(newLabels);
    await onUpdate({ labels: newLabels });
  };

  // Handle due date change
  const handleSetDueDate = async (date: string) => {
    setDueDate(date);
    await onUpdate({ dueDate: new Date(date) });
    setShowDueDatePicker(false);
  };

  // Handle attachment download
  const handleDownloadAttachment = (attachment: any) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle attachment removal
  const handleRemoveAttachment = async (attachmentId: string) => {
    const newAttachments = card.attachments.filter(a => a._id !== attachmentId);
    await onUpdate({ attachments: newAttachments });
  };

  // Function to format mentions in comment text
  const formatCommentWithMentions = (text: string) => {
    // Simple regex to find @mentions and wrap them in a span
    return text.split(/(@\w+)/).map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Handle typing indicator
  const handleCommentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    // Emit typing event
    if (value.trim().length > 0 && !isTyping) {
      setIsTyping(true);
      // Emit typing started event
      // This would be handled by socket integration
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit typing stopped event
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        console.log('Starting file upload:', file.name);
        const uploadResult = await uploadFile(file);
        console.log('File uploaded successfully:', uploadResult);

        // Create new attachment object
        const newAttachment = {
          _id: `temp-${Date.now()}`, // Temporary ID until backend confirms
          url: uploadResult.url,
          key: uploadResult.key,
          name: uploadResult.name,
          size: uploadResult.size,
          type: uploadResult.type
        };

        console.log('Adding attachment to card:', newAttachment);
        
        // Optimistically update card with new attachment
        const updatedAttachments = [...card.attachments, newAttachment];
        console.log('Updated attachments:', updatedAttachments);
        
        onUpdate({
          attachments: updatedAttachments
        });

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Upload failed', error);
      }
    }
  };

  const handleSaveTitle = () => {
    onUpdate({ title });
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    onUpdate({ description });
    setIsEditingDescription(false);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await addComment(card._id, newComment);
        setNewComment('');
        // Refresh comments - getComments updates global state but doesn't return
        await getComments(card._id);
        // Get comments from global state
        const cardComments = useBoardStore.getState().comments.filter(c => c.cardId === card._id);
        setComments(cardComments);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleCommentButtonClick = () => {
    // Focus on comment input
    document.getElementById('comment-input')?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTitle(card.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl font-semibold bg-transparent border-none outline-none"
                autoFocus
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              >
                {card.title}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex max-h-[calc(90vh-5rem)]">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Labels */}
            {card.labels.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map((label) => (
                    <span
                      key={label._id}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={handleSaveDescription}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDescription(card.description || '');
                        setIsEditingDescription(false);
                      }}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="min-h-[100px] p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {card.description ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{card.description}</p>
                  ) : (
                    <p className="text-gray-500">Add a description...</p>
                  )}
                </div>
              )}
            </div>

            {/* Attachments */}
            {card.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments</h3>
                
                {/* Image Previews */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {card.attachments.map((attachment) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.name);
                    return isImage ? (
                      <div key={attachment._id} className="relative">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="h-20 w-20 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Attachment List */}
                <div className="space-y-2">
                  {card.attachments.map((attachment) => (
                    <div
                      key={attachment._id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Download attachment"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveAttachment(attachment._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Activity</h3>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">John Doe</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(card.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Created this card</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Comments</h3>

              {/* Comment Input */}
              <div className="mb-4">
                <textarea
                  id="comment-input"
                  value={newComment}
                  onChange={handleCommentInputChange}
                  placeholder="Add a comment... Use @username to mention someone"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600">
                          {comment.user?.name?.substring(0, 2) || 'US'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.user?.name || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatCommentWithMentions(comment.content)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 bg-gray-50 p-6 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Add to card</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowMembersPanel(!showMembersPanel)}
                className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Members</span>
              </button>
              <button 
                onClick={() => setShowLabelsPanel(!showLabelsPanel)}
                className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Tag className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Labels</span>
              </button>
              <button 
                onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Due date</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Paperclip className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Attachment</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </button>
            </div>

            {/* Members Panel */}
            {showMembersPanel && (
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Assigned</h4>
                {assignees.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {assignees.map((userId) => {
                      const member = users.find(u => u._id === userId);
                      return (
                        <div key={userId} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-xs text-gray-700">{member?.name || 'User'}</span>
                          <button
                            onClick={() => handleRemoveMember(userId)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-3">No members assigned</p>
                )}
              </div>
            )}

            {/* Labels Panel */}
            {showLabelsPanel && (
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Labels</h4>
                {labels.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {labels.map((label) => (
                      <div key={label._id} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: label.color + '20' }}>
                        <span className="text-xs font-medium" style={{ color: label.color }}>{label.name}</span>
                        <button
                          onClick={() => handleRemoveLabel(label._id)}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-3">No labels assigned</p>
                )}
              </div>
            )}

            {/* Due Date Picker */}
            {showDueDatePicker && (
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Due Date</h4>
                <input
                  type="datetime-local"
                  value={dueDate.split('.')[0].split('+')[0]}
                  onChange={(e) => handleSetDueDate(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                {dueDate && (
                  <button
                    onClick={() => {
                      setDueDate('');
                      onUpdate({ dueDate: undefined });
                      setShowDueDatePicker(false);
                    }}
                    className="mt-2 w-full text-xs text-red-600 hover:text-red-800"
                  >
                    Clear due date
                  </button>
                )}
              </div>
            )}

            {/* Display current values */}
            {assignees.length > 0 && !showMembersPanel && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700">Members: {assignees.length}</p>
              </div>
            )}
            {labels.length > 0 && !showLabelsPanel && (
              <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700">Labels: {labels.length}</p>
              </div>
            )}
            {dueDate && !showDueDatePicker && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700">Due: {new Date(dueDate).toLocaleDateString()}</p>
              </div>
            )}

            <h3 className="text-sm font-medium text-gray-700 mb-4 mt-6">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleCommentButtonClick}
                className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Comment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}