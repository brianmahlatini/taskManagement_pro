import express from 'express';
import { getCards, createCard, updateCard, deleteCard } from '../controllers/cardController';
import { addComment, getComments } from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Direct card access
router.route('/:id').put(protect, updateCard).delete(protect, deleteCard);

// Comments
router.route('/:cardId/comments').get(protect, getComments).post(protect, addComment);

// Board-specific card routes
router.route('/lists/:listId/cards').get(protect, getCards).post(protect, createCard);

export default router;
