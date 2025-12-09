import express from 'express';
import { protect } from '../middleware/auth';
import { getArchivedItems, restoreItem, deleteArchivedItem } from '../controllers/archiveController';

const router = express.Router();

router.use(protect);

// Archive routes
router.route('/').get(getArchivedItems);
router.route('/:itemId/restore').post(restoreItem);
router.route('/:itemId').delete(deleteArchivedItem);

export default router;