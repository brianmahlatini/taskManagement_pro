import { Request, Response } from 'express';
import Activity from '../models/Activity';
import Board from '../models/Board';
import Card from '../models/Card';
import Comment from '../models/Comment';
import User from '../models/User';

export const getActivities = async (req: Request, res: Response) => {
    const { boardId } = req.params;

    try {
        const activities = await Activity.find({ boardId })
            .populate('actorId', 'name email avatarUrl')
            .sort('-createdAt')
            .limit(50);
        res.json(activities);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createActivity = async (
    boardId: string,
    actorId: string,
    actionType: string,
    meta: any
) => {
    try {
        await Activity.create({
            boardId,
            actorId,
            actionType,
            meta,
        });
    } catch (error) {
        console.error('Error creating activity:', error);
    }
};

// Comprehensive activity logging functions
export const logCardActivity = async (cardId: string, actorId: string, action: 'created' | 'updated' | 'moved' | 'deleted', additionalMeta?: Record<string, any>) => {
    try {
        const card = await Card.findById(cardId);
        if (!card) throw new Error('Card not found');

        const board = await Board.findById(card.boardId);
        if (!board) throw new Error('Board not found');

        const meta = {
            cardId: card._id,
            cardTitle: card.title,
            listId: card.listId,
            ...additionalMeta,
        };

        await createActivity(board._id.toString(), actorId, `card_${action}`, meta);
    } catch (error: any) {
        console.error('Error logging card activity:', error);
    }
};

export const logCommentActivity = async (commentId: string, actorId: string, action: 'created' | 'updated' | 'deleted') => {
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) throw new Error('Comment not found');

        const card = await Card.findById(comment.cardId);
        if (!card) throw new Error('Card not found');

        const board = await Board.findById(card.boardId);
        if (!board) throw new Error('Board not found');

        const meta = {
            commentId: comment._id,
            cardId: card._id,
            cardTitle: card.title,
        };

        await createActivity(board._id.toString(), actorId, `comment_${action}`, meta);
    } catch (error: any) {
        console.error('Error logging comment activity:', error);
    }
};

export const logBoardActivity = async (boardId: string, actorId: string, action: 'created' | 'updated' | 'deleted', additionalMeta?: Record<string, any>) => {
    try {
        const board = await Board.findById(boardId);
        if (!board) throw new Error('Board not found');

        const meta = {
            boardId: board._id,
            boardTitle: board.title,
            ...additionalMeta,
        };

        await createActivity(board._id.toString(), actorId, `board_${action}`, meta);
    } catch (error: any) {
        console.error('Error logging board activity:', error);
    }
};

export const logMemberActivity = async (boardId: string, actorId: string, action: 'added' | 'removed', userId: string) => {
    try {
        const board = await Board.findById(boardId);
        if (!board) throw new Error('Board not found');

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const meta = {
            userId: user._id,
            userName: user.name,
        };

        await createActivity(board._id.toString(), actorId, `member_${action}`, meta);
    } catch (error: any) {
        console.error('Error logging member activity:', error);
    }
};

// Get all activities for dashboard (across all boards)
export const getAllActivities = async (req: any, res: Response) => {
    try {
        const { limit = 20, skip = 0 } = req.query;

        const activities = await Activity.find()
            .populate('actorId', 'name email avatarUrl')
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(Number(skip));

        const unreadCount = await Activity.countDocuments({ isRead: false });

        res.json({
            activities,
            unreadCount,
            hasMore: activities.length === Number(limit)
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all activities as read
export const markAllActivitiesAsRead = async (req: any, res: Response) => {
    try {
        await Activity.updateMany(
            { isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ success: true, message: 'All activities marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread activities count
export const getUnreadCount = async (req: any, res: Response) => {
    try {
        const count = await Activity.countDocuments({ isRead: false });
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
