import express from 'express';
import { protect } from '../middleware/auth';
import {
    createInvitation,
    getInvitationByToken,
    acceptInvitation,
    getUserInvitations,
    cancelInvitation
} from '../controllers/invitationController';

const router = express.Router();

// Public routes
router.get('/:token', getInvitationByToken);
router.post('/:token/accept', acceptInvitation);

// Protected routes
router.use(protect);
router.post('/', createInvitation);
router.get('/', getUserInvitations);
router.put('/:invitationId/cancel', cancelInvitation);

export default router;