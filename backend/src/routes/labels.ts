import express from 'express';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/:boardId/labels')
    .get(protect, getLabels)
    .post(protect, createLabel);

router.route('/:id')
    .put(protect, updateLabel)
    .delete(protect, deleteLabel);

export default router;