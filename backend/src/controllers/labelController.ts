import { Request, Response } from 'express';
import Label from '../models/Label';
import Board from '../models/Board';

export const getLabels = async (req: Request, res: Response) => {
    const { boardId } = req.params;

    try {
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        const labels = await Label.find({ boardId }).sort('name');
        res.json(labels);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createLabel = async (req: Request, res: Response) => {
    const { boardId } = req.params;
    const { name, color } = req.body;

    try {
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        const label = await Label.create({
            boardId,
            name,
            color: color || '#4F46E5',
        });

        res.status(201).json(label);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLabel = async (req: Request, res: Response) => {
    try {
        const label = await Label.findById(req.params.id);

        if (label) {
            label.name = req.body.name || label.name;
            label.color = req.body.color || label.color;

            const updatedLabel = await label.save();
            res.json(updatedLabel);
        } else {
            res.status(404).json({ message: 'Label not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteLabel = async (req: Request, res: Response) => {
    try {
        const label = await Label.findById(req.params.id);

        if (label) {
            await label.deleteOne();
            res.json({ message: 'Label removed' });
        } else {
            res.status(404).json({ message: 'Label not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};