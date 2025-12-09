import { Request, Response } from 'express';
import Board from '../models/Board';
import Card from '../models/Card';

export const search = async (req: Request, res: Response) => {
    const { q, listId, labelId, assigneeId } = req.query;

    if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        // Search Boards
        const boards = await Board.find({
            $text: { $search: q as string },
            'members.userId': (req as any).user._id,
        });

        // Search Cards
        const userBoards = await Board.find({
            'members.userId': (req as any).user._id,
        }).select('_id');

        const userBoardIds = userBoards.map(b => b._id);

        const query: any = {
            $text: { $search: q as string },
            boardId: { $in: userBoardIds },
        };

        if (listId) query.listId = listId;
        if (labelId) query.labels = labelId;
        if (assigneeId) query.assignees = assigneeId;

        const cards = await Card.find(query);

        res.json({ boards, cards });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
