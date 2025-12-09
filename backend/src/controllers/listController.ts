import { Request, Response } from 'express';
import List from '../models/List';
import Board from '../models/Board';

export const getLists = async (req: Request, res: Response) => {
    const { boardId } = req.params;

    try {
        // Verify board access
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        // TODO: Check if user is member of board

        const lists = await List.find({ boardId }).sort('position');
        res.json(lists);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createList = async (req: Request, res: Response) => {
    const { boardId } = req.params;
    const { title } = req.body;

    try {
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Get current max position
        const lastList = await List.findOne({ boardId }).sort('-position');
        const position = lastList ? lastList.position + 1 : 0;

        const list = await List.create({
            boardId,
            title,
            position,
        });

        res.status(201).json(list);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateList = async (req: Request, res: Response) => {
    try {
        const list = await List.findById(req.params.id);

        if (list) {
            list.title = req.body.title || list.title;
            if (req.body.position !== undefined) list.position = req.body.position;

            const updatedList = await list.save();
            res.json(updatedList);
        } else {
            res.status(404).json({ message: 'List not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteList = async (req: Request, res: Response) => {
    try {
        const list = await List.findById(req.params.id);

        if (list) {
            await list.deleteOne();
            res.json({ message: 'List removed' });
        } else {
            res.status(404).json({ message: 'List not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
