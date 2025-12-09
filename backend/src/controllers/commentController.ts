import { Request, Response } from 'express';
import Comment from '../models/Comment';
import User from '../models/User';
import Notification from '../models/Notification';

export const getComments = async (req: Request, res: Response) => {
    const { cardId } = req.params;

    try {
        const comments = await Comment.find({ cardId })
            .populate('userId', 'name email avatarUrl')
            .sort('createdAt');
        res.json(comments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addComment = async (req: any, res: Response) => {
    const { cardId } = req.params;
    const { content, parentCommentId } = req.body;

    try {
        // Parse mentions from content
        const mentions = parseMentions(content);

        const comment = await Comment.create({
            cardId,
            userId: req.user._id,
            content,
            parentCommentId,
            mentions,
        });

        const populatedComment = await Comment.findById(comment._id).populate('userId', 'name email avatarUrl');

        // Create notifications for mentioned users
        if (mentions.length > 0) {
            await createMentionNotifications(cardId, req.user._id, mentions, comment._id);
        }

        res.status(201).json(populatedComment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

function parseMentions(content: string): string[] {
    // Simple regex to find @mentions (e.g., @username)
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex) || [];
    return matches.map(mention => mention.substring(1)); // Remove @ symbol
}

async function createMentionNotifications(cardId: string, mentionerId: string, mentionedUsernames: string[], commentId: string) {
    try {
        // Find users by username
        const users = await User.find({ username: { $in: mentionedUsernames } });

        // Create notifications for each mentioned user
        const notifications = users.map(user => ({
            userId: user._id,
            type: 'mention',
            title: 'You were mentioned in a comment',
            message: `You were mentioned in a comment on card ${cardId}`,
            isRead: false,
            meta: {
                cardId,
                commentId,
                mentionerId,
                mentionedAt: new Date()
            },
            createdAt: new Date()
        }));

        // Save notifications
        await Notification.insertMany(notifications);

        // Emit real-time notifications via Socket.IO
        // This would be handled by the socket handler
    } catch (error) {
        console.error('Error creating mention notifications:', error);
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (comment) {
            await comment.deleteOne();
            res.json({ message: 'Comment removed' });
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
