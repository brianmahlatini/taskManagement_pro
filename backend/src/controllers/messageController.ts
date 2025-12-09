import { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import User from '../models/User';
import { IUser } from '../models/User';

// Get all users (excluding current user)
export const getUsers = async (req: any, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user._id;

    const users = await User.find({ _id: { $ne: userId } })
      .select('_id name email avatarUrl')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Get all conversations for the current user
export const getConversations = async (req: any, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email avatarUrl')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error });
  }
};

// Create a new conversation
export const createConversation = async (req: any, res: Response) => {
  try {
    const { participantId } = req.body;
    const user = req.user as IUser;
    const userId = user._id;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [userId, participantId]
    });

    await conversation.save();
    await conversation.populate('participants', 'name email avatarUrl');

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating conversation', error });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const user = req.user as IUser;
    const userId = user._id;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

// Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const user = req.user as IUser;
    const userId = user._id;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = new Message({
      conversationId,
      sender: userId,
      content,
      isRead: false
    });

    await message.save();

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // Emit real-time event
    // io.emit('new_message', {
    //   conversationId,
    //   message: await message.populate('sender', 'name email avatarUrl')
    // });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const user = req.user as IUser;
    const userId = user._id;

    // Check if user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all unread messages from other users as read
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error });
  }
};

// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const user = req.user as IUser;
    const userId = user._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Message.findByIdAndDelete(messageId);

    // Emit real-time event
    // io.emit('message_deleted', { messageId, conversationId: message.conversationId });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};