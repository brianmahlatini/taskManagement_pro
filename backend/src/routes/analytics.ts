import express from 'express';
import { getBoardAnalytics, getAdvancedAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/:boardId', protect, getBoardAnalytics);
router.get('/:boardId/advanced', protect, getAdvancedAnalytics);

export default router;
