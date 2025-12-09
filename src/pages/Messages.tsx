import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { MessageSquare, Send, Search, User, Paperclip, Smile, Mic, Plus, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';

export function MessagesPage() {
  const { user } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    users,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setCurrentConversation,
    createConversation,
    fetchUsers
  } = useMessageStore();

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Fetch conversations and users on component mount
  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, [fetchConversations, fetchUsers]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation._id);
    }
  }, [currentConversation, fetchMessages]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const content = conv.lastMessage?.content?.toLowerCase() || '';
    const senderName = conv.lastMessage?.sender?.name?.toLowerCase() || '';
    return content.includes(searchTerm.toLowerCase()) || senderName.includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && currentConversation) {
      sendMessage(currentConversation._id, newMessage);
      setNewMessage('');
    }
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const conversation = await createConversation(userId);
      setCurrentConversation(conversation);
      setShowNewConversation(false);
      await fetchConversations();
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Helper function to get the other participant in conversation
  const getOtherParticipant = (conversation: any) => {
    if (!conversation.participants || !Array.isArray(conversation.participants)) {
      return null;
    }
    // Find participant that is not the current user
    return conversation.participants.find((p: any) => p._id !== user?._id);
  };

  return (
    <div className="flex-1 overflow-auto">
      <TopBar
        title="Messages"
        subtitle="Communicate with your team"
      />

      <div className="flex h-[calc(100vh-120px)] bg-gray-50">
        {/* Conversation List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => setShowNewConversation(!showNewConversation)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Start new conversation"
              >
                {showNewConversation ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
            {showNewConversation ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Select a user:</h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No users available</p>
                  ) : (
                    users.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleStartConversation(u._id)}
                        className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">{u.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading conversations...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation._id}
                    onClick={() => setCurrentConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      currentConversation?._id === conversation._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {otherParticipant?.avatarUrl ? (
                            <img
                              src={otherParticipant.avatarUrl}
                              alt={otherParticipant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {otherParticipant?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {otherParticipant?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.content || 'No messages'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage?.createdAt ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="mt-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col bg-white">
          {currentConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                {(() => {
                  const otherParticipant = getOtherParticipant(currentConversation);
                  return (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        {otherParticipant?.avatarUrl ? (
                          <img
                            src={otherParticipant.avatarUrl}
                            alt={otherParticipant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600">
                            {otherParticipant?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {otherParticipant?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {currentConversation.participants?.length || 2} participants
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${message.senderId === user?._id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="mt-1">Choose a conversation from the left panel to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}