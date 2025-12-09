import express from 'express';
import { getLists, createList, updateList, deleteList } from '../controllers/listController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Note: getLists and createList are usually mounted on /api/boards/:boardId/lists
// But for simplicity in server.ts we might want to handle it differently or use mergeParams
// Let's assume we will mount this on /api/lists and pass boardId in body or query for creation?
// Actually requirements say: POST /api/boards/:boardId/lists
// So we should probably handle that in boards routes or use mergeParams.

// Let's stick to the requirements structure.
// These routes will be mounted at /api/lists for direct ID access
router.route('/:id').put(protect, updateList).delete(protect, deleteList);

// Card routes for specific lists
import { getCards, createCard } from '../controllers/cardController';
router.route('/:listId/cards').get(protect, getCards).post(protect, createCard);

export default router;
