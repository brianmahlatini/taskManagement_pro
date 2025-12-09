import { Request, Response } from 'express';
import Card from '../models/Card';
import List from '../models/List';
import Board from '../models/Board';
import Comment from '../models/Comment';

export const getCards = async (req: Request, res: Response) => {
    const { listId } = req.params;

    try {
        const cards = await Card.find({ listId }).sort('position');

        // Add comment counts to each card
        const cardsWithCommentCounts = await Promise.all(
            cards.map(async (card) => {
                const commentCount = await Comment.countDocuments({ cardId: card._id });
                return {
                    ...card.toObject(),
                    commentCount
                };
            })
        );

        res.json(cardsWithCommentCounts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCard = async (req: Request, res: Response) => {
    const { listId } = req.params;
    const { title } = req.body;

    try {
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Get current max position
        const lastCard = await Card.findOne({ listId }).sort('-position');
        const position = lastCard ? lastCard.position + 1 : 0;

        const card = await Card.create({
            listId,
            boardId: list.boardId,
            title,
            position,
        });

        res.status(201).json(card);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCard = async (req: Request, res: Response) => {
    try {
        const card = await Card.findById(req.params.id);

        if (card) {
            // Update basic fields
            card.title = req.body.title !== undefined ? req.body.title : card.title;
            card.description = req.body.description !== undefined ? req.body.description : card.description;
            
            // Update position if provided
            if (req.body.position !== undefined) card.position = req.body.position;
            
            // Update list if provided
            if (req.body.listId) card.listId = req.body.listId;
            
            // Update due date if provided
            if (req.body.dueDate !== undefined) card.dueDate = req.body.dueDate;
            
            // Update assignees if provided
            if (req.body.assignees !== undefined) card.assignees = req.body.assignees;
            
            // Update labels if provided
            if (req.body.labels !== undefined) card.labels = req.body.labels;
            
            // Update attachments if provided
            if (req.body.attachments !== undefined) card.attachments = req.body.attachments;
            
            // Update any other meta fields
            if (req.body.meta !== undefined) card.meta = req.body.meta;

            const updatedCard = await card.save();
            res.json(updatedCard);
        } else {
            res.status(404).json({ message: 'Card not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCard = async (req: Request, res: Response) => {
    try {
        const card = await Card.findById(req.params.id);

        if (card) {
            await card.deleteOne();
            res.json({ message: 'Card removed' });
        } else {
            res.status(404).json({ message: 'Card not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
