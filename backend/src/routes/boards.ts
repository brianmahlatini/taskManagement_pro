import express from 'express';
import { getBoards, createBoard, getBoardById, updateBoard, addMember, removeMember } from '../controllers/boardController';
import { getLists, createList } from '../controllers/listController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getBoards).post(protect, createBoard);
router.route('/:id').get(protect, getBoardById).put(protect, updateBoard);
router.route('/:id/members').post(protect, addMember);
router.route('/:id/members/:userId').delete(protect, removeMember);

// Board-specific list routes
router.route('/:boardId/lists').get(protect, getLists).post(protect, createList);

export default router;
