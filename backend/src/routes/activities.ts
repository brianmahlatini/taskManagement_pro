import express from 'express';
import { getActivities, getAllActivities, markAllActivitiesAsRead, getUnreadCount } from '../controllers/activityController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Board-specific activities
router.route('/:boardId').get(getActivities);

// Dashboard activities
router.route('/').get(getAllActivities);
router.route('/mark-all-read').post(markAllActivitiesAsRead);
router.route('/unread-count').get(getUnreadCount);

export default router;
